# 🏮 ศาลเจ้าแห่งโชคลาภ (Lucky Shrine)

เว็บ **หวย ดวงชะตา และสะเดาะเคราะห์ออนไลน์** — เซียมซี ไพ่ยิปซี เลขมงคล จุดเทียน ลอยโคม แก้ปีชง สแกนภาพ/ลายเซ็น และธีมเทศกาลที่สลับตามวันที่อัตโนมัติ

- **Frontend:** HTML / CSS / JavaScript (ES modules) — UI ธีมจีน-ไทย, อนิเมชัน, เซนเซอร์เขย่ามือถือ, Canvas
- **Core (สมองกล):** WebAssembly เขียนด้วย C (`wasm/core.c`) — ตรรกะสุ่ม สูตรดวง และฐานข้อมูลคำทำนายทั้งหมด
- ไม่มี backend, ไม่มี dependency, ไม่มี build tool ฝั่งเว็บ — โฮสต์เป็นไฟล์ static ได้ทุกที่ (GitHub Pages, Hugging Face Static Space ฯลฯ)

> ⚠️ **เพื่อความบันเทิงเท่านั้น** เลขมงคลไม่ใช่การทำนายผลสลากจริง และคำทำนายไม่ใช่คำแนะนำทางการแพทย์ กฎหมาย หรือการเงิน

## โครงสร้างโปรเจกต์

```
lucky-shrine/
├─ wasm/core.c              # Wasm core (freestanding C, ไม่ใช้ libc)
├─ build.sh                 # คอมไพล์ core.c -> web/wasm/core.wasm
├─ web/                     # เว็บไซต์ทั้งหมด (โฟลเดอร์นี้คือสิ่งที่ deploy)
│  ├─ index.html
│  ├─ css/style.css         # ธีม + อนิเมชัน (data-theme ตามเทศกาล)
│  ├─ js/bridge.js          # ตัวเชื่อม JS <-> Wasm (ใช้ใน Node ได้ด้วย)
│  ├─ js/app.js             # UI, อนิเมชัน, อินพุตอุปกรณ์
│  └─ wasm/core.wasm        # ไบนารีที่คอมไพล์แล้ว (commit ไว้ให้ใช้ได้ทันที)
├─ tests/core.test.mjs      # ทดสอบ Wasm core ด้วย Node (ไม่ต้องติดตั้งอะไร)
├─ tests/e2e.py             # ทดสอบบนเบราว์เซอร์จริงด้วย Playwright (ไม่บังคับ)
├─ scripts/package-hf.sh    # แพ็กเกจสำหรับ Hugging Face Static Space
└─ .github/workflows/pages.yml  # build + test + deploy ขึ้น GitHub Pages อัตโนมัติ
```

## ฟังก์ชันใน Wasm core

ทุกฟังก์ชันที่คืนข้อมูลจะเขียน JSON (UTF-8) ลงบัฟเฟอร์ภายในและคืนความยาวไบต์ (ค่าลบ = error) `bridge.js` จัดการการส่ง string/array เข้า-ออกให้แล้ว

| หมวด | ฟังก์ชัน | หน้าที่ |
|---|---|---|
| เซสชัน | `init_session(name, len, birth_year, zodiac)` | เก็บข้อมูลผู้ใช้ตลอดเซสชัน รับปี พ.ศ./ค.ศ. คำนวณนักษัตรให้ (`zodiac = -1`) |
| | `get_zodiac_info(z)`, `set_date(y,m,d)`, `seed_entropy(a,b,c,d)` | ข้อมูลนักษัตร, วันที่, ผสม entropy จาก `crypto.getRandomValues` |
| เซียมซี | `draw_siamese_sticks(shake_power)` | สุ่มใบที่ 1–28 ตามแรงเขย่า พร้อมคำทำนาย 4 ด้าน (การเงิน/รัก/สุขภาพ/งาน) |
| ไพ่ยิปซี | `draw_tarot_cards(count)` | Fisher-Yates จาก Major Arcana 22 ใบ ไม่ซ้ำ พร้อมสถานะหงาย/กลับหัว |
| เลขมงคล | `generate_lucky_numbers(category)` | 2 ตัว / 3 ตัว / ครบชุด+เลขวิ่ง จากชื่อ ปีเกิด นักษัตร และวันที่ |
| สะเดาะเคราะห์ | `calculate_bad_luck_remedy(zodiac, problem)` | หาความสัมพันธ์ปีนี้กับนักษัตร (ชง/ไห่/พัง/ตรง) ระดับความหนัก วิธีแก้ บทสวด |
| | `process_digital_offering(type, text, len)` | จับหมวดความกังวลจากข้อความอธิษฐาน (hash + สุ่ม) ปลดล็อกคำปลอบใจ |
| | `candle_unlock(hold_ms)` | ตัดสินใจปลดล็อกบทสวด/เลขมงคลเมื่อจุดเทียนครบ 4 วินาที |
| ภาพ/ลายเส้น | `process_image_scan(rgba, len, mode)` | ใช้สถิติพิกเซล + hash เป็น seed ได้ธาตุและคะแนนโชค |
| | `process_signature(points, n)` | วิเคราะห์ขนาด ทิศเส้น ความหักมุม จำนวนเส้น ของลายเซ็น |
| เทศกาล | `get_festival(m,d)`, `festival_info(id)`, `draw_festival_blessing(id)` | เลือกธีมตามวันที่ และสุ่มพรประจำเทศกาล |

**เทศกาลที่รองรับ:** สงกรานต์ (เม.ย.) · ฮาโลวีน (ต.ค.) · ลอยกระทง (พ.ย.) · ตรุษจีน (ปลาย ม.ค.–ก.พ.) · ปีใหม่ (20 ธ.ค.–14 ม.ค.) · วันธรรมดา — เลือกธีมเองได้จากเมนูมุมขวาบน

**พิธีกรรมโต้ตอบ:** จุดเทียน (กดค้างด้วยเมาส์/นิ้ว) · ลอยโคม (พิมพ์ความทุกข์ใจ) · แก้ปีชง (ยันต์เรืองแสง) · สาดน้ำสงกรานต์ · เปิดโลงศพฮาโลวีน · ลอยกระทง · อั่งเปา · จุดพลุปีใหม่

## รันในเครื่อง

ต้องเปิดผ่านเว็บเซิร์ฟเวอร์ (เบราว์เซอร์ไม่ยอมโหลด `.wasm` จาก `file://`):

```bash
cd web
python3 -m http.server 8000
# เปิด http://localhost:8000
```

## Build Wasm ใหม่ (หลังแก้ `wasm/core.c`)

ต้องมี `clang` ที่รองรับ target wasm32 และ `wasm-ld` (Ubuntu/Debian: `sudo apt install clang lld`, macOS: `brew install llvm lld`)

```bash
./build.sh          # สร้าง web/wasm/core.wasm
node tests/core.test.mjs   # ทดสอบ (Node 18+)
```

ทดสอบบนเบราว์เซอร์จริง (ไม่บังคับ): `pip install playwright && python3 tests/e2e.py --chrome /path/to/chrome`

## อัปโหลดขึ้น GitHub

```bash
cd lucky-shrine
git init -b main            # ข้ามถ้าโฟลเดอร์นี้เป็น git repo อยู่แล้ว
git add .
git commit -m "Initial commit: Lucky Shrine"
git remote add origin https://github.com/<USERNAME>/lucky-shrine.git
git push -u origin main
```

### Deploy บน GitHub Pages

1. ไปที่ **Settings → Pages → Build and deployment → Source** เลือก **GitHub Actions**
2. push ขึ้น `main` — workflow `.github/workflows/pages.yml` จะติดตั้ง clang, build Wasm, รันเทสต์ แล้ว deploy โฟลเดอร์ `web/`
3. เว็บจะอยู่ที่ `https://<USERNAME>.github.io/lucky-shrine/` (ทุก path ในโปรเจกต์เป็น relative จึงใช้ใน sub-path ได้)

### Deploy บน Hugging Face Static Space (ฟรี)

```bash
./scripts/package-hf.sh     # สร้าง dist-hf/ พร้อม README.md ที่มี front-matter (sdk: static)
```

สร้าง Space ใหม่แบบ **Static** แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์ `dist-hf/`

## ความเป็นส่วนตัว

- ทุกอย่างประมวลผลในเบราว์เซอร์ **ไม่มีการส่งข้อมูลออกไปเซิร์ฟเวอร์** (ฟอนต์ Google Fonts เป็นการเรียกภายนอกอย่างเดียว — ลบ 3 บรรทัด `<link>` ใน `index.html` ได้หากไม่ต้องการ)
- รูปภาพถูกย่อเป็น 64×64 พิกเซลแล้วส่งเข้า Wasm เท่านั้น ไม่มีการอัปโหลด/จัดเก็บ และไม่มีการระบุตัวตนบุคคล
- ข้อความอธิษฐานถูกล้างออกจากช่องกรอกทันทีที่ปล่อยโคม
- เก็บเฉพาะชื่อ/ปีเกิดใน `sessionStorage` ของแท็บนั้น (หายเมื่อปิดแท็บ)
- ถ้าข้อความอธิษฐานมีถ้อยคำที่บ่งบอกว่าอยากทำร้ายตัวเอง ระบบจะไม่ให้คำทำนาย แต่แสดงข้อความห่วงใยพร้อมสายด่วนสุขภาพจิต **1323** แทน

## หมายเหตุเรื่อง Anti-Cheat / Anti-Tamper

การรวมตรรกะไว้ใน Wasm ช่วย **ซ่อนสูตรและฐานคำทำนายจากการอ่านผ่าน View Source** และทำให้แก้ไขยากขึ้น แต่ Wasm ทำงานบนเครื่องของผู้ใช้ จึง **ไม่ใช่ความปลอดภัยแบบสมบูรณ์** — คนที่ตั้งใจสามารถ decompile หรือเรียกฟังก์ชันตรงๆ ได้ ถ้าต้องการกันการโกงจริงจัง (เช่น จะมีรางวัลหรือคะแนนจริง) ต้องย้ายการสุ่มและตัดสินผลไปที่เซิร์ฟเวอร์

## ปรับแต่งเนื้อหา

- เพิ่ม/แก้คำทำนาย: ตาราง `STICKS`, `STICK_TEXT`, `TAROT`, `BLESS` ใน `wasm/core.c` แล้วรัน `./build.sh`
- เพิ่มธีมเทศกาล: เพิ่มชุดตัวแปรสี `body[data-theme="..."]` ใน `style.css`, เพิ่มในตาราง `FEST_NAME`/`BLESS` และ `get_festival()` ใน core, แล้วเพิ่ม stage ใน `renderFestival()` ของ `app.js`
- เนื้อหาคำทำนายทั้งหมดเป็นข้อความต้นฉบับที่เขียนขึ้นใหม่ ไม่ได้คัดลอกจากใบเซียมซีของวัดหรือสำนักใด

## License

MIT — ดูไฟล์ [LICENSE](LICENSE)
