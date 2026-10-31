"""
End-to-end browser test (optional). Needs: pip install playwright + a Chrome/Chromium.
  python3 tests/e2e.py [--shots DIR] [--chrome /path/to/chrome]
Serves ./web on a local port, drives every tab and festival theme, fails on any console error.
"""
import argparse, http.server, os, socketserver, struct, sys, threading, zlib

from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("--shots", default=None)
ap.add_argument("--chrome", default=None)
args = ap.parse_args()

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")


class Q(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(("127.0.0.1", 0), Q)
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()


def png(w=48, h=48):
    raw = b"".join(b"\x00" + bytes([(x * 5) % 256, (y * 4) % 256, 120] * 1) * 1 if False else
                   b"\x00" + b"".join(bytes([(x * 5) % 256, (y * 4) % 256, 120]) for x in range(w)) for y in range(h))
    def chunk(t, d):
        c = struct.pack(">I", len(d)) + t + d
        return c + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")


errors = []
ok = 0


def check(name, cond):
    global ok
    if not cond:
        print("FAIL -", name)
        errors.append(name)
    else:
        ok += 1
        print("ok   -", name)


with sync_playwright() as p:
    launch = dict(headless=True, args=["--no-sandbox"])
    if args.chrome:
        launch["executable_path"] = args.chrome
    browser = p.chromium.launch(**launch)
    page = browser.new_page(viewport={"width": 430, "height": 900})
    # fonts come from Google; block them so the test does not depend on the network
    page.route("**/fonts.googleapis.com/**", lambda r: r.abort())
    page.route("**/fonts.gstatic.com/**", lambda r: r.abort())
    console = []
    page.on("console", lambda m: console.append(m) if m.type == "error" and "ERR_FAILED" not in m.text and "fonts" not in m.text else None)
    page.on("pageerror", lambda e: console.append(e))

    def shot(name):
        if args.shots:
            os.makedirs(args.shots, exist_ok=True)
            page.screenshot(path=os.path.join(args.shots, name + ".png"), full_page=False)

    page.goto(f"http://127.0.0.1:{port}/index.html")
    page.wait_for_selector("#gate-form")
    shot("01-gate")

    # --- gate validation
    page.fill("#in-name", "สมชาย")
    page.fill("#in-year", "2300")  # passes the HTML range but is neither a valid CE nor BE birth year
    page.click("#gate-form button[type=submit]")
    check("invalid year shows error", page.is_visible("#gate-error"))
    page.fill("#in-year", "2540")
    page.click("#gate-form button[type=submit]")
    page.wait_for_selector("#app", state="visible")
    who = page.inner_text("#who")
    check("session greets by name + zodiac (2540 = 1997 = ฉลู)", "สมชาย" in who and "ฉลู" in who)

    # --- sticks
    page.click("#btn-shake")
    page.wait_for_selector("#stick-result", state="visible", timeout=10000)
    t = page.inner_text("#stick-result")
    check("stick result has number and 4 aspects", "ใบที่" in t and page.locator("#stick-result .aspect").count() == 4)
    shot("02-stick")

    # --- tarot
    page.click('#tabs [data-tab="tarot"]')
    page.click("#btn-tarot")
    check("tarot deals 3 cards", page.locator("#tarot-table .tcard").count() == 3)
    page.click("#btn-flip-all")
    page.wait_for_timeout(1500)
    check("tarot flips all", page.locator("#tarot-table .tcard.flipped").count() == 3)
    shot("03-tarot")

    # --- numbers
    page.click('#tabs [data-tab="number"]')
    page.check('input[name="numcat"][value="2"]', force=True)
    page.click("#btn-number")
    page.wait_for_timeout(3500)
    reels = page.locator("#number-out .reel").all_inner_texts()
    check("numbers: 3x2 + 3x3 + 2 digits = 17 reels", len(reels) == 17 and all(r.isdigit() for r in reels))
    check("numbers note shown", "บันเทิง" in page.inner_text("#number-note"))
    shot("04-number")

    # --- candle
    page.click('#tabs [data-tab="ritual"]')
    page.locator("#candle-wrap").scroll_into_view_if_needed()
    box = page.locator("#candle-wrap").bounding_box()
    page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
    page.mouse.down()
    page.wait_for_timeout(1200)
    shot("05-candle-lighting")
    page.mouse.up()
    check("candle: early release does not unlock", not page.is_visible("#candle-result"))
    page.mouse.down()
    page.wait_for_timeout(4400)
    page.mouse.up()
    check("candle: hold 4s unlocks mantra", page.is_visible("#candle-result") and "นะโม" in page.inner_text("#candle-result"))
    shot("06-candle-done")

    # --- lantern
    page.click('.pill[data-rit="lantern"]')
    page.fill("#lantern-text", "กังวลเรื่องหนี้และเงิน")
    page.click("#btn-lantern")
    page.wait_for_selector("#lantern-result", state="visible", timeout=6000)
    check("lantern: category detected", "การเงิน" in page.inner_text("#lantern-result"))
    check("lantern: wish text cleared from the page", page.input_value("#lantern-text") == "")
    shot("07-lantern")
    page.fill("#lantern-text", "ฉันอยากตาย")
    page.click("#btn-lantern")
    page.wait_for_timeout(2500)
    check("lantern: crisis text shows care card with 1323", page.locator("#lantern-result.care").count() == 1 and "1323" in page.inner_text("#lantern-result"))

    # --- chong
    page.click('.pill[data-rit="chong"]')
    page.select_option("#chong-zodiac", "0")
    page.click("#btn-chong")
    page.wait_for_selector("#chong-result", state="visible", timeout=6000)
    check("chong: rat vs horse year = ปีชง", "ปีชง" in page.inner_text("#chong-result"))
    shot("08-chong")

    # --- scan
    page.click('#tabs [data-tab="scan"]')
    page.set_input_files("#in-image", files=[{"name": "t.png", "mimeType": "image/png", "buffer": png()}])
    page.wait_for_function("!document.querySelector('#btn-scan').disabled")
    page.click("#btn-scan")
    page.wait_for_selector("#scan-result", state="visible")
    check("image scan: element + 4 bars", "ธาตุ" in page.inner_text("#scan-result") and page.locator("#scan-result .bar").count() == 4)
    page.locator("#sig").scroll_into_view_if_needed()
    sb = page.locator("#sig").bounding_box()
    page.mouse.move(sb["x"] + 30, sb["y"] + sb["height"] * 0.7)
    page.mouse.down()
    for i in range(40):
        page.mouse.move(sb["x"] + 30 + i * 6, sb["y"] + sb["height"] * (0.7 - i * 0.006 + (0.03 if i % 3 == 0 else 0)))
    page.mouse.up()
    page.click("#btn-sig")
    page.wait_for_selector("#sig-result", state="visible")
    check("signature: 3 traits", page.locator("#sig-result p", has_text="•").count() == 3)
    shot("09-scan")

    # --- festivals: every theme
    page.click('#tabs [data-tab="festival"]')
    for theme, stage_sel, click_sel, label in [
        ("shrine", "#fest-stage .btn", "#fest-stage .btn", "daily"),
        ("songkran", ".bowl", ".bowl", "songkran"),
        ("halloween", ".coffin", ".coffin", "halloween"),
        ("loy", ".pond", "#fest-stage .btn", "loy"),
        ("cny", ".angpao", ".angpao", "cny"),
        ("newyear", ".countdown", "#fest-stage .btn", "newyear"),
    ]:
        page.select_option("#theme", theme)
        page.wait_for_selector(stage_sel)
        check(f"theme {theme}: body data-theme", page.get_attribute("body", "data-theme") == theme)
        page.click(click_sel)
        page.wait_for_selector("#fest-result", state="visible", timeout=9000)
        page.wait_for_timeout(600)
        check(f"festival {label}: blessing shown", len(page.inner_text("#fest-result")) > 20)
        shot("10-fest-" + label)

    # auto theme should follow the real date
    page.select_option("#theme", "auto")
    check("auto theme picks a valid theme", page.get_attribute("body", "data-theme") in ["shrine", "songkran", "halloween", "loy", "cny", "newyear"])

    # --- session persistence + reset
    page.reload()
    page.wait_for_selector("#app", state="visible")
    check("session restored after reload (same tab)", "สมชาย" in page.inner_text("#who"))
    page.click("#btn-change")
    check("change data returns to gate", page.is_visible("#gate"))

    check("no console/page errors", not console)
    for c in console:
        print("   console:", getattr(c, "text", c))
    browser.close()

srv.shutdown()
print(f"\n{ok} checks passed, {len(errors)} failed")
sys.exit(1 if errors else 0)
