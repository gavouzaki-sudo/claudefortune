import test from 'node:test';
import assert from 'node:assert/strict';
import { ZODIAC_SYSTEMS } from '../src/data/zodiacSystems';
import { CHANT_INFO, isChantMuted, toggleMuteChant } from '../src/utils/chantAudio';

test('Zodiac systems list contains 10 distinct civilizations', () => {
  assert.equal(ZODIAC_SYSTEMS.length, 10);
  const ids = ZODIAC_SYSTEMS.map((s) => s.id);
  assert.equal(new Set(ids).size, 10);

  // Expected 10 civilizations requested by user
  const expectedSystems = [
    'western',
    'native_american',
    'vedic',
    'thai',
    'chinese',
    'islamic',
    'vietnamese',
    'burmese',
    'egyptian',
    'aztec_mayan',
  ];
  for (const expectedId of expectedSystems) {
    assert.ok(ids.includes(expectedId), `Missing civilization: ${expectedId}`);
  }
});

test('Every zodiac system has valid symbols and metadata', () => {
  for (const sys of ZODIAC_SYSTEMS) {
    assert.ok(sys.name.length > 0, `System ${sys.id} missing name`);
    assert.ok(sys.items.length >= 8, `System ${sys.id} must have at least 8 symbols`);
    for (const item of sys.items) {
      assert.ok(item.name.length > 0, `Symbol missing name in ${sys.id}`);
      assert.ok(item.symbol.length > 0, `Symbol missing icon in ${sys.id}`);
      assert.ok(item.element.length > 0, `Symbol missing element in ${sys.id}`);
      assert.ok(item.attribute.length > 0, `Symbol missing attribute in ${sys.id}`);
    }
  }
});

test('Chant metadata covers all 10 civilizations with sacred titles and instruments', () => {
  for (const sys of ZODIAC_SYSTEMS) {
    const chant = CHANT_INFO[sys.id];
    assert.ok(chant, `Missing chant info for ${sys.id}`);
    assert.ok(chant.chantTitle.length > 0, `Chant title empty for ${sys.id}`);
    assert.ok(chant.mantraPreview.length > 0, `Mantra preview empty for ${sys.id}`);
    assert.ok(chant.instrument.length > 0, `Instrument empty for ${sys.id}`);
  }
});

test('Chant mute/unmute state toggles reliably', () => {
  const initial = isChantMuted();
  const toggled = toggleMuteChant();
  assert.equal(toggled, !initial);
  const reverted = toggleMuteChant();
  assert.equal(reverted, initial);
});

test('Theme system contains 18 themes including xmas, valentine, frost, midautumn, forest', async () => {
  const { ALL_THEMES } = await import('../src/utils/smartTheme');
  assert.ok(ALL_THEMES.length >= 18, `Expected at least 18 themes, found ${ALL_THEMES.length}`);
  const xmas = ALL_THEMES.find((t) => t.id === 'xmas');
  assert.ok(xmas, 'Missing xmas theme');
  const val = ALL_THEMES.find((t) => t.id === 'valentine');
  assert.ok(val, 'Missing valentine theme');
  const frost = ALL_THEMES.find((t) => t.id === 'frost');
  assert.ok(frost, 'Missing frost theme');
  const midautumn = ALL_THEMES.find((t) => t.id === 'midautumn');
  assert.ok(midautumn, 'Missing midautumn theme');
  const forest = ALL_THEMES.find((t) => t.id === 'forest');
  assert.ok(forest, 'Missing forest theme');
});

test('Pua Poi sound effects and audio engine helpers exist and are callable', async () => {
  const { playWoodClatter, playFireCrackle } = await import('../src/utils/chantAudio');
  assert.equal(typeof playWoodClatter, 'function');
  assert.equal(typeof playFireCrackle, 'function');
  // Should not throw even in non-browser or test runner environment
  assert.doesNotThrow(() => playWoodClatter());
  assert.doesNotThrow(() => playFireCrackle());
});

test('Soundscapes configuration contains Bamboo Chimes, Temple Rain, Tibetan Bowl, and Temple Bells', async () => {
  const { SOUNDSCAPES, ambientSoundEngine } = await import('../src/utils/ambientSoundscapes');
  assert.ok(SOUNDSCAPES.length >= 5);
  const ids = SOUNDSCAPES.map((s) => s.id);
  assert.ok(ids.includes('bamboo_chime'), 'Missing bamboo_chime soundscape');
  assert.ok(ids.includes('temple_rain'), 'Missing temple_rain soundscape');
  assert.ok(ids.includes('tibetan_bowl'), 'Missing tibetan_bowl soundscape');
  assert.ok(ids.includes('temple_bell'), 'Missing temple_bell soundscape');
  assert.ok(ids.includes('none'), 'Missing none soundscape');

  assert.equal(typeof ambientSoundEngine.getSoundscape, 'function');
  assert.equal(typeof ambientSoundEngine.setVolume, 'function');
  ambientSoundEngine.setVolume(0.8);
  assert.equal(ambientSoundEngine.getVolume(), 0.8);
});

test('Spiritual Text-to-Speech presets include Elder Sinsei, Dharma Calm, and Meditation Chanting', async () => {
  const { SPIRITUAL_PRESETS, spiritualSpeechEngine } = await import('../src/utils/spiritualSpeech');
  assert.ok(SPIRITUAL_PRESETS.sinsei, 'Missing sinsei preset');
  assert.ok(SPIRITUAL_PRESETS.dharma, 'Missing dharma preset');
  assert.ok(SPIRITUAL_PRESETS.meditation, 'Missing meditation preset');

  assert.ok(SPIRITUAL_PRESETS.sinsei.rate <= 0.8, 'Sinsei voice rate should be calm and slow');
  assert.ok(SPIRITUAL_PRESETS.meditation.pitch <= 0.8, 'Meditation voice should have deep resonance');

  assert.equal(typeof spiritualSpeechEngine.setPreset, 'function');
  assert.equal(typeof spiritualSpeechEngine.speak, 'function');
  assert.equal(typeof spiritualSpeechEngine.stop, 'function');
  assert.doesNotThrow(() => spiritualSpeechEngine.stop());
});

test('Multi-language translation dictionary covers TH, EN, and ZH with identical keys', async () => {
  const { TRANSLATIONS } = await import('../src/data/translations');
  assert.ok(TRANSLATIONS.th, 'Missing Thai translations');
  assert.ok(TRANSLATIONS.en, 'Missing English translations');
  assert.ok(TRANSLATIONS.zh, 'Missing Chinese translations');

  const thKeys = Object.keys(TRANSLATIONS.th);
  const enKeys = Object.keys(TRANSLATIONS.en);
  const zhKeys = Object.keys(TRANSLATIONS.zh);

  assert.equal(thKeys.length, enKeys.length, 'Key count mismatch between TH and EN');
  assert.equal(thKeys.length, zhKeys.length, 'Key count mismatch between TH and ZH');

  for (const k of thKeys) {
    assert.ok(k in TRANSLATIONS.en, `Missing EN key: ${k}`);
    assert.ok(k in TRANSLATIONS.zh, `Missing ZH key: ${k}`);
  }
});

test('PWA icon assets and Web App Manifest are present and valid', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const requiredIcons = [
    'public/icon.svg',
    'public/pwa-192x192.png',
    'public/pwa-512x512.png',
    'public/pwa-maskable-512x512.png',
    'public/apple-touch-icon.png',
  ];

  for (const iconPath of requiredIcons) {
    const full = path.resolve(process.cwd(), iconPath);
    assert.ok(fs.existsSync(full), `Required PWA icon not found: ${iconPath}`);
    const stat = fs.statSync(full);
    assert.ok(stat.size > 100, `Icon file is suspiciously small or empty: ${iconPath}`);
  }
});

test('Thai Astrological Calendar: 5 work categories and titles match user requirements', async () => {
  const { WORK_CATEGORIES_INFO } = await import('../src/data/auspiciousCalendarData');
  assert.equal(WORK_CATEGORIES_INFO.wedding.titleTh, 'ฤกษ์แต่งงาน / จดทะเบียนสมรส');
  assert.equal(WORK_CATEGORIES_INFO.house.titleTh, 'ฤกษ์ขึ้นบ้านใหม่ / ย้ายเข้าที่อยู่อาศัยใหม่');
  assert.equal(WORK_CATEGORIES_INFO.merit.titleTh, 'ฤกษ์ทำบุญประจำปี / ทำบุญบริษัท / ทำบุญบ้าน');
  assert.equal(WORK_CATEGORIES_INFO.vehicle_business.titleTh, 'ฤกษ์ออกรถใหม่ / ขึ้นบ้านใหม่ / เปิดกิจการร้านค้า');
  assert.equal(WORK_CATEGORIES_INFO.others.titleTh, 'ฤกษ์มงคลอื่นๆ (ถ้ามี เช่น เจรจาค้าขาย, ทำศัลยกรรม)');
});

test('Thai Astrological Calendar: Kala Yoga calculation for B.E. 2569', async () => {
  const { getKalaYogaForYear } = await import('../src/data/auspiciousCalendarData');
  const kala2569 = getKalaYogaForYear(2569);
  assert.equal(kala2569.ubatha, 4, 'B.E. 2569 Ubatha should be Thursday (4)');
  assert.equal(kala2569.lokawinas, 6, 'B.E. 2569 Lokawinas should be Saturday (6)');
  assert.equal(kala2569.thongchai, 3, 'B.E. 2569 Thongchai should be Wednesday (3)');
  assert.equal(kala2569.athipadi, 2, 'B.E. 2569 Athipadi should be Tuesday (2)');
});

test('Thai Astrological Calendar: Thaksa Kalakini and Sri relations are 100% authentic', async () => {
  const { getThaksaRelation } = await import('../src/data/auspiciousCalendarData');

  // Verify Kalakini for each day of birth
  assert.equal(getThaksaRelation('sunday', 5).isKalakini, true, 'Sunday Kalakini is Friday (5)');
  assert.equal(getThaksaRelation('monday', 0).isKalakini, true, 'Monday Kalakini is Sunday (0)');
  assert.equal(getThaksaRelation('tuesday', 1).isKalakini, true, 'Tuesday Kalakini is Monday (1)');
  assert.equal(getThaksaRelation('wednesday_day', 2).isKalakini, true, 'Wed Day Kalakini is Tuesday (2)');
  assert.equal(getThaksaRelation('wednesday_night', 4).isKalakini, true, 'Wed Night Kalakini is Thursday (4)');
  assert.equal(getThaksaRelation('thursday', 6).isKalakini, true, 'Thursday Kalakini is Saturday (6)');
  assert.equal(getThaksaRelation('friday', 3).isKalakini, true, 'Friday Kalakini is Wednesday (3)');
  assert.equal(getThaksaRelation('saturday', 3).isKalakini, true, 'Saturday Kalakini is Wednesday (3)');

  // Verify non-Kalakini day is favorable
  assert.equal(getThaksaRelation('friday', 2).isKalakini, false);
  assert.equal(getThaksaRelation('friday', 2).relation, 'sri');
});

test('Thai Astrological Calendar: November 2569 days and dynamic month generation', async () => {
  const { generateMonthAuspiciousDays } = await import('../src/data/auspiciousCalendarData');
  const nov2569 = generateMonthAuspiciousDays(2569, 11);
  assert.equal(nov2569.length, 30);

  // Ubatha & Lokawinas days must not recommend wedding/house
  const ubathaDays = nov2569.filter((d) => d.kalaYoga === 'ubatha');
  const lokawinasDays = nov2569.filter((d) => d.kalaYoga === 'lokawinas');
  assert.ok(ubathaDays.length >= 4, 'Nov 2569 has at least 4 Thursdays');
  assert.ok(lokawinasDays.length >= 4, 'Nov 2569 has at least 4 Saturdays');

  for (const d of ubathaDays) {
    assert.ok(!d.suitableCategories.includes('wedding'), `Day ${d.dayOfMonth} is Ubatha and must not recommend wedding`);
    assert.ok(!d.suitableCategories.includes('house'), `Day ${d.dayOfMonth} is Ubatha and must not recommend house`);
  }
  for (const d of lokawinasDays) {
    assert.ok(!d.suitableCategories.includes('wedding'), `Day ${d.dayOfMonth} is Lokawinas and must not recommend wedding`);
  }

  // 1. Natural lunar sequence verification (ขึ้น 1..15, แรม 1..15/14)
  // Days 10 to 24 in Nov 2569 must strictly advance from ขึ้น 1 ค่ำ to ขึ้น 15 ค่ำ
  for (let day = 10; day <= 24; day++) {
    const d = nov2569[day - 1];
    assert.equal(d.lunarPhase, 'waxing');
    assert.equal(d.lunarDay, day - 9, `Day ${day} should be waxing day ${day - 9}`);
  }
  // Nov 24 must be Loy Krathong full moon (ขึ้น 15 ค่ำ เดือน 12)
  assert.equal(nov2569[23].lunarDay, 15);
  assert.equal(nov2569[23].lunarPhase, 'waxing');
  assert.ok(nov2569[23].lunarDateTh.includes('ขึ้น ๑๕ ค่ำ'));

  // Month 11 is an odd month (เดือนคี่/เดือนขาด) ending at แรม 14 ค่ำ (Nov 9)
  assert.equal(nov2569[7].lunarDay, 13); // Nov 8: แรม 13 ค่ำ
  assert.equal(nov2569[7].buddhistHolyDay, false, 'Nov 8 is แรม 13 ค่ำ and must NOT be a holy day');
  assert.equal(nov2569[8].lunarDay, 14); // Nov 9: แรม 14 ค่ำ (end of Month 11)
  assert.equal(nov2569[8].lunarMonth, 11);
  assert.equal(nov2569[8].buddhistHolyDay, true, 'Nov 9 is แรม 14 ค่ำ (end of Month 11) and IS a holy day');

  // Verify holy days in Nov 2569: strictly 4 days (Nov 3, 9, 17, 24)
  const holyDays = nov2569.filter((d) => d.buddhistHolyDay);
  assert.equal(holyDays.length, 4, 'Nov 2569 must have exactly 4 Buddhist Holy Days');
  const holyDayNums = holyDays.map((d) => d.dayOfMonth);
  assert.deepEqual(holyDayNums, [3, 9, 17, 24]);

  // Nov 17 is ขึ้น 8 ค่ำ (วันพระ)
  assert.equal(nov2569[16].lunarDay, 8);
  assert.equal(nov2569[16].lunarPhase, 'waxing');
  assert.equal(nov2569[16].buddhistHolyDay, true);

  // 2. Ruk (นพดลฤกษ์) spellings and rotations
  // Days 8 and 17 must be เพชฌฆาตฤกษ์ (strictly spelled with ฌ เฌอ)
  assert.equal(nov2569[7].thaiRuk, 'phetchakat');
  assert.equal(nov2569[7].thaiRukNameTh, 'เพชฌฆาตฤกษ์');
  assert.ok(!nov2569[7].thaiRukNameTh.includes('เพชร'), 'Must not spell with ร');
  assert.equal(nov2569[16].thaiRuk, 'phetchakat');
  assert.equal(nov2569[16].thaiRukNameTh, 'เพชฌฆาตฤกษ์');

  // Days 4 and 13 must be โจโรฤกษ์ (strictly spelled with โ)
  assert.equal(nov2569[3].thaiRuk, 'joro');
  assert.equal(nov2569[3].thaiRukNameTh, 'โจโรฤกษ์');
  assert.equal(nov2569[12].thaiRuk, 'joro');
  assert.equal(nov2569[12].thaiRukNameTh, 'โจโรฤกษ์');

  // Ruk (นพดลฤกษ์) must change consecutively and NOT be identical every 7 days
  const saturdays = [nov2569[6], nov2569[13], nov2569[20], nov2569[27]]; // Nov 7, 14, 21, 28
  const satRukNames = saturdays.map((s) => s.thaiRuk);
  const uniqueSatRuks = new Set(satRukNames);
  assert.ok(uniqueSatRuks.size > 1, 'Ruks on Saturdays must not be locked to a single repeating ruk');

  const wednesdays = [nov2569[3], nov2569[10], nov2569[17], nov2569[24]]; // Nov 4, 11, 18, 25
  const wedRukNames = wednesdays.map((w) => w.thaiRuk);
  const uniqueWedRuks = new Set(wedRukNames);
  assert.ok(uniqueWedRuks.size > 1, 'Ruks on Wednesdays must not be locked to a single repeating ruk');

  // Consecutive days must advance through ruks
  assert.notEqual(nov2569[0].thaiRuk, nov2569[1].thaiRuk);
  assert.notEqual(nov2569[1].thaiRuk, nov2569[2].thaiRuk);
  assert.notEqual(nov2569[2].thaiRuk, nov2569[3].thaiRuk);
});

test('Thai Lottery: B.E. year parsing, formatThaiDate, and prize checks', async () => {
  const { formatThaiDate, parseDateString, checkTicketWin } = await import('../src/utils/lotteryApi');

  // Verify formatThaiDate converts C.E. 2026 to B.E. 2569
  const formatted = formatThaiDate(2026, 11, 1);
  assert.equal(formatted, '1 พฤศจิกายน 2569');

  const formatted2024 = formatThaiDate(2024, 3, 1);
  assert.equal(formatted2024, '1 มีนาคม 2567');

  // Verify parseDateString
  const parsed = parseDateString('2026-11-01');
  assert.equal(parsed.day, 1);
  assert.equal(parsed.month, 11);
  assert.equal(parsed.yearCe, 2026);

  // Mock draw
  const mockDraw = {
    first: '174629',
    firstPrice: '6,000,000',
    last3f: ['917', '195'],
    last3fPrice: '4,000',
    last3b: ['408', '041'],
    last3bPrice: '4,000',
    last2: '48',
    last2Price: '2,000',
    rawDate: '2026-02-01',
    formattedThaiDate: '1 กุมภาพันธ์ 2569',
  };

  // Test 1st prize win
  const winFirst = checkTicketWin('174629', mockDraw);
  assert.equal(winFirst.isWon, true);
  assert.equal(winFirst.totalReward, 6000000);
  assert.equal(winFirst.wonPrizes[0].prizeName, 'รางวัลที่ 1');

  // Test 2-digit back win
  const winLast2 = checkTicketWin('000048', mockDraw);
  assert.equal(winLast2.isWon, true);
  assert.equal(winLast2.totalReward, 2000);
  assert.equal(winLast2.wonPrizes[0].prizeName, 'รางวัลเลขท้าย 2 ตัว');

  // Test 3-digit front win
  const winFront3 = checkTicketWin('917000', mockDraw);
  assert.equal(winFront3.isWon, true);
  assert.equal(winFront3.totalReward, 4000);
  assert.equal(winFront3.wonPrizes[0].prizeName, 'รางวัลเลขหน้า 3 ตัว');

  // Test 3-digit back win
  const winBack3 = checkTicketWin('000408', mockDraw);
  assert.equal(winBack3.isWon, true);
  assert.equal(winBack3.totalReward, 4000);
  assert.equal(winBack3.wonPrizes[0].prizeName, 'รางวัลเลขท้าย 3 ตัว');

  // Test non-winning ticket
  const noWin = checkTicketWin('999999', mockDraw);
  assert.equal(noWin.isWon, false);
  assert.equal(noWin.totalReward, 0);
  assert.equal(noWin.wonPrizes.length, 0);
});
