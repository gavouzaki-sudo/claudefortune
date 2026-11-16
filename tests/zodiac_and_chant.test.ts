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

  // Rapid soundscape switch: cancelling before init resolves must leave final state 'none'
  const p1 = ambientSoundEngine.setSoundscape('bamboo_chime');
  const p2 = ambientSoundEngine.setSoundscape('none');
  await Promise.all([p1, p2]);
  assert.equal(ambientSoundEngine.getSoundscape(), 'none');
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

  spiritualSpeechEngine.setPreset('dharma');
  assert.equal(spiritualSpeechEngine.getState().activePresetId, 'dharma', 'setPreset must preserve chosen preset');

  // Google TTS speed assertions: default is +20% (1.2x) and supports adjustment
  assert.equal(spiritualSpeechEngine.getState().googleTtsSpeed, 1.2, 'Default Google TTS speed is +20% (1.2x)');
  assert.equal(typeof spiritualSpeechEngine.setGoogleTtsSpeed, 'function');
  spiritualSpeechEngine.setGoogleTtsSpeed(1.35);
  assert.equal(spiritualSpeechEngine.getState().googleTtsSpeed, 1.35);
  spiritualSpeechEngine.setGoogleTtsSpeed(1.2);

  // Unsupported speech notification assertions
  let receivedNotice = '';
  const unsub = spiritualSpeechEngine.onNotice((msg) => {
    receivedNotice = msg;
  });
  spiritualSpeechEngine.handleUnsupportedSpeech('ไม่รองรับเสียงพูด');
  assert.equal(receivedNotice, 'ไม่รองรับเสียงพูด', 'Notice must emit ไม่รองรับเสียงพูด');
  assert.equal(spiritualSpeechEngine.getState().isUnsupported, true, 'isUnsupported must be true');
  assert.equal(spiritualSpeechEngine.getState().isFallbackMelody, false, 'Melodic fallback must be false');
  unsub();
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

test('Refactored utilities and constants integrity', async () => {
  const { FEST_INDEX_MAP } = await import('../src/hooks/useThemeManager');
  assert.equal(FEST_INDEX_MAP.shrine, 0);
  assert.equal(FEST_INDEX_MAP.songkran, 1);
  assert.equal(FEST_INDEX_MAP.loy, 3);

  const { formatStickReading } = await import('../src/components/SiameseSticks');
  const dummyStick = {
    stick: 9,
    title: 'นกน้อยรังใหม่',
    level: 1,
    level_name: 'ดี',
    verse: 'เริ่มจากสิ่งเล็ก ค่อยๆ สร้างค่อยๆ มั่นคง',
    aspects: [
      { name: 'การเงิน', text: 'การเงินราบรื่น' },
      { name: 'ความรัก', text: 'ความสัมพันธ์ดี' },
    ],
  };
  const formatted = formatStickReading(dummyStick);
  assert.ok(formatted.includes('เซียมซีใบที่ 9 นกน้อยรังใหม่'));
  assert.ok(formatted.includes('คำทำนาย: ดี'));
  assert.ok(formatted.includes('การเงิน การเงินราบรื่น'));

  const { THAI_MONTHS, ALL_WEEKDAYS } = await import('../src/components/AuspiciousCalendar');
  assert.equal(THAI_MONTHS.length, 12);
  assert.equal(THAI_MONTHS[10], 'พฤศจิกายน');
  assert.equal(ALL_WEEKDAYS.length, 7);
});

test('Thai Astrological Calendar: C.E. and B.E. year normalization works seamlessly', async () => {
  const { normalizeToBE, getKalaYogaForYear, generateMonthAuspiciousDays } = await import('../src/data/auspiciousCalendarData');
  assert.equal(normalizeToBE(2026), 2569);
  assert.equal(normalizeToBE(2569), 2569);

  const kalaCE = getKalaYogaForYear(2026);
  const kalaBE = getKalaYogaForYear(2569);
  assert.deepEqual(kalaCE, kalaBE);
  assert.equal(kalaCE.thongchai, 3);
  assert.equal(kalaCE.ubatha, 4);

  const daysCE = generateMonthAuspiciousDays(2026, 11);
  const daysBE = generateMonthAuspiciousDays(2569, 11);
  assert.equal(daysCE.length, 30);
  assert.equal(daysBE.length, 30);
  assert.equal(daysCE[0].date, daysBE[0].date);
  assert.equal(daysCE[23].lunarDay, 15);
});

test('safeStorage handles objects safely with fallback support', async () => {
  const { safeStorage } = await import('../src/utils/storage');
  const testSession = {
    systemId: 'thai',
    systemName: 'ไทย',
    symbolName: 'มังกร',
    symbolIcon: '🐉',
    element: 'ทอง',
    aura: '#ffd700',
    attribute: 'เดช',
    year: 2569,
    zodiac: 4,
  };

  const saved = safeStorage.set('session', '__test_shrine_session__', testSession);
  assert.equal(saved, true);
  const retrieved = safeStorage.get<typeof testSession | null>('session', '__test_shrine_session__', null);
  assert.deepEqual(retrieved, testSession);
  safeStorage.remove('session', '__test_shrine_session__');
  const removed = safeStorage.get('session', '__test_shrine_session__', null);
  assert.equal(removed, null);

  // Test legacy unquoted string (e.g. raw "th" stored in local storage)
  // In Node environment without window, MemoryStorage fallback is used
  const langVal = safeStorage.get<string>('local', 'shrine.lang', 'th');
  assert.equal(typeof langVal, 'string');
});

test('Sacred Journey 9 Temples (มหามงคล 9 วัด) data and mechanics integrity', async () => {
  const { ALL_TEMPLES, GAME_EVENTS, TEMPLE_TILE_IDS, WISH_TOPICS } = await import(
    '../src/data/sacredTemplesData'
  );

  // 1. 100 temples database
  assert.equal(ALL_TEMPLES.length, 100, 'Must have exactly 100 temples across Thailand');
  ALL_TEMPLES.forEach((t) => {
    assert.ok(t.id >= 1 && t.id <= 100);
    assert.ok(t.name.startsWith('วัด'), `Temple ${t.name} must start with วัด`);
    assert.ok(t.province.length > 0);
    assert.ok(['กลาง', 'เหนือ', 'อีสาน', 'ใต้', 'ตะวันออก', 'ตะวันตก'].includes(t.region));
    assert.ok(t.theme.length > 0);
    assert.ok(t.wish.length > 0);
    assert.ok(t.blessing.length > 0);
  });

  // 2. Exactly 9 temple tiles along 36-tile board
  assert.equal(TEMPLE_TILE_IDS.length, 9);
  assert.deepEqual(TEMPLE_TILE_IDS, [4, 8, 12, 16, 20, 24, 28, 32, 35]);

  // 3. Game events
  const eventTileIds = Object.keys(GAME_EVENTS).map(Number);
  assert.ok(eventTileIds.length >= 10);
  // Ensure no overlap between temple tiles and event tiles
  for (const tid of TEMPLE_TILE_IDS) {
    assert.ok(!GAME_EVENTS[tid], `Temple tile ${tid} must not conflict with an event`);
  }

  // 4. Wish topics
  assert.equal(WISH_TOPICS.length, 6);
  assert.ok(WISH_TOPICS.includes('การงาน'));
  assert.ok(WISH_TOPICS.includes('การเงิน'));
  assert.ok(WISH_TOPICS.includes('ความรัก'));
  assert.ok(WISH_TOPICS.includes('สุขภาพ'));
  assert.ok(WISH_TOPICS.includes('ครอบครัว'));
  assert.ok(WISH_TOPICS.includes('ความสงบและความเป็นสิริมงคล'));
});

test('Regression: Bridge.fromBytes byteOffset, JsCoreEngine zodiac parity, and formatter disambiguation', async () => {
  const { readFile } = await import('node:fs/promises');
  const { Bridge } = await import('../src/bridge');
  const { formatThaiDateTime } = await import('../src/utils/formatters');
  const formattersMod = await import('../src/utils/formatters');

  // 1. formatters no longer exports conflicting formatThaiDate
  assert.equal('formatThaiDate' in formattersMod, false);
  assert.ok(formatThaiDateTime(new Date(2026, 9, 31, 10, 30)).length > 0);

  // 2. Bridge.fromBytes respects non-zero byteOffset subarrays
  const rawWasm = await readFile(new URL('../public/wasm/core.wasm', import.meta.url));
  const padded = new Uint8Array(rawWasm.length + 16);
  padded.set(rawWasm, 16);
  const offsetSlice = padded.subarray(16);
  assert.equal(offsetSlice.byteOffset, 16);
  const wasmBridge = await Bridge.fromBytes(offsetSlice);
  assert.equal(wasmBridge.version(), 1);
  assert.equal(wasmBridge.initSession('ทดสอบ', 2000), 4);

  // 3. JsCoreEngine.getZodiacInfo parity with Wasm schema
  const jsBridge = await Bridge.fromBytes(new Uint8Array(0));
  jsBridge.setDate(new Date(2026, 9, 31));
  jsBridge.initSession('ทดสอบ', 1995);
  const jsZodiac = jsBridge.zodiacInfo();
  assert.equal(jsZodiac.index, 11);
  assert.equal(jsZodiac.name, 'กุน');
  assert.equal(typeof jsZodiac.direction, 'string');
  assert.equal(jsZodiac.current_year_name, 'มะเมีย');
  assert.equal(jsZodiac.current_year_index, 6);
  assert.equal(jsZodiac.year, 2026);
});

test('Dynamic year labels, drawRoundedRect fallback, and shared AudioContext singleton', async () => {
  const { getCurrentYearRemedyLabel } = await import('../src/data/translations');
  assert.equal(getCurrentYearRemedyLabel('th', 2026), 'แก้ปีชง 2569 (มะเมีย)');
  assert.equal(getCurrentYearRemedyLabel('en', 2026), '2026 Year of the Horse Clash Remedy');
  assert.equal(getCurrentYearRemedyLabel('zh', 2026), '2026 丙午马年化太岁');
  assert.equal(getCurrentYearRemedyLabel('th', 2027), 'แก้ปีชง 2570 (มะแม)');
  assert.equal(getCurrentYearRemedyLabel('en', 2027), '2027 Year of the Goat Clash Remedy');
  assert.equal(getCurrentYearRemedyLabel('zh', 2027), '2027 丁未羊年化太岁');

  const { normalizeToBE } = await import('../src/data/auspiciousCalendarData');
  assert.equal(normalizeToBE(Number.NaN), new Date().getFullYear() + 543);

  const { drawRoundedRect } = await import('../src/utils/canvasUtils');
  const calls: string[] = [];
  const mockCtxFallback = {
    beginPath: () => calls.push('beginPath'),
    moveTo: () => calls.push('moveTo'),
    lineTo: () => calls.push('lineTo'),
    quadraticCurveTo: () => calls.push('quadraticCurveTo'),
    closePath: () => calls.push('closePath'),
  } as unknown as CanvasRenderingContext2D;
  drawRoundedRect(mockCtxFallback, 10, 20, 100, 50, [8]);
  assert.ok(calls.includes('beginPath'));
  assert.ok(calls.includes('quadraticCurveTo'));
  assert.ok(calls.includes('closePath'));

  let nativeCalled = false;
  const mockCtxNative = {
    beginPath: () => {},
    roundRect: () => {
      nativeCalled = true;
    },
  } as unknown as CanvasRenderingContext2D;
  drawRoundedRect(mockCtxNative, 0, 0, 50, 50, 6);
  assert.equal(nativeCalled, true);

  const { getSharedAudioContextSync, getSharedAudioContext } = await import('../src/utils/audioContext');
  assert.equal(getSharedAudioContextSync(), null);
  assert.equal(await getSharedAudioContext(), null);
});

test('Thai Lottery: postponed draw schedule (2559–2569) resolves normal and actual dates', async () => {
  const {
    POSTPONED_LOTTERY_DRAWS,
    LOTTERY_DRAW_DAY_OPTIONS,
    resolvePostponedDraw,
    getActualDrawDateIso,
    formatPostponedNote,
    shiftIsoDate,
  } = await import('../src/data/postponedLotteryDraws');

  assert.ok(POSTPONED_LOTTERY_DRAWS.length >= 34);
  assert.equal(LOTTERY_DRAW_DAY_OPTIONS.length, 31);
  assert.equal(LOTTERY_DRAW_DAY_OPTIONS[0].value, '01');
  assert.equal(LOTTERY_DRAW_DAY_OPTIONS[15].value, '16');
  assert.equal(LOTTERY_DRAW_DAY_OPTIONS[30].value, '31');

  // UTC-safe date shifting across month/year boundaries
  assert.equal(shiftIsoDate('2027-01-01', -2), '2026-12-30');
  assert.equal(shiftIsoDate('2026-08-01', -1), '2026-07-31');
  assert.equal(shiftIsoDate('2026-01-16', 1), '2026-01-17');

  // Teacher's Day 2569 (16 Jan -> 17 Jan)
  assert.equal(getActualDrawDateIso('2026-01-16'), '2026-01-17');
  assert.equal(getActualDrawDateIso('2026-01-17'), '2026-01-17');
  // Labor Day 2569 (1 May -> 2 May)
  assert.equal(getActualDrawDateIso('2026-05-01'), '2026-05-02');
  // New Year 2569 & 2570 (1 Jan -> 2 Jan)
  assert.equal(getActualDrawDateIso('2026-01-01'), '2026-01-02');
  assert.equal(getActualDrawDateIso('2027-01-01'), '2027-01-02');
  // Royal Cremation Ceremony Dec 2569 (16 Dec -> 17 Dec)
  assert.equal(getActualDrawDateIso('2026-12-16'), '2026-12-17');
  // COVID-19 2563 (1 Apr -> 16 May)
  assert.equal(getActualDrawDateIso('2020-04-01'), '2020-05-16');
  // Year-end 2567 canceled Dec 30 -> Jan 2, 2568
  assert.equal(getActualDrawDateIso('2024-12-30'), '2025-01-02');
  // Asalha Puja 2562 (16 Jul -> 15 Jul) and 2566 (1 Aug -> 31 Jul)
  assert.equal(getActualDrawDateIso('2019-07-16'), '2019-07-15');
  assert.equal(getActualDrawDateIso('2023-08-01'), '2023-07-31');
  // Makha Bucha 2561 (1 Mar -> 2 Mar)
  assert.equal(getActualDrawDateIso('2018-03-01'), '2018-03-02');
  // Normal unaffected draw remains unchanged
  assert.equal(getActualDrawDateIso('2026-11-01'), '2026-11-01');

  const decEntry = resolvePostponedDraw('2026-12-17');
  assert.ok(decEntry);
  assert.match(formatPostponedNote(decEntry), /16 ธันวาคม 2569/);
  assert.match(formatPostponedNote(decEntry), /พระราชพิธี/);
});

test('Weekly 5-set prophecy rotation follows Monday–Sunday schedule and loops cleanly after 5 weeks', async () => {
  const { getWeeklyProphecySetIndex, getLotteryPeriodKey } = await import('../src/utils/prophecyCycle');

  // Nov 15, 2026 is Sunday; Nov 16, 2026 is Monday; Nov 22, 2026 is Sunday; Nov 23, 2026 is Monday
  const sunIdx = getWeeklyProphecySetIndex(new Date(2026, 10, 15));
  const monW1Idx = getWeeklyProphecySetIndex(new Date(2026, 10, 16));
  const wedW1Idx = getWeeklyProphecySetIndex(new Date(2026, 10, 18));
  const sunW1Idx = getWeeklyProphecySetIndex(new Date(2026, 10, 22));
  const monW2Idx = getWeeklyProphecySetIndex(new Date(2026, 10, 23));

  assert.notEqual(sunIdx, monW1Idx, 'Sunday to Monday must rotate to next prophecy set');
  assert.equal(monW1Idx, wedW1Idx, 'Monday and Wednesday of same week must share set');
  assert.equal(monW1Idx, sunW1Idx, 'Monday through Sunday of same week must share set');
  assert.equal(monW2Idx, (monW1Idx + 1) % 5, 'Next Monday must advance by 1 mod 5');

  // Verify 5 consecutive weeks visit all 5 distinct indices and week 6 returns to week 1
  const fiveWeeks = [0, 1, 2, 3, 4].map((w) =>
    getWeeklyProphecySetIndex(new Date(2026, 10, 16 + w * 7))
  );
  assert.equal(new Set(fiveWeeks).size, 5, '5 consecutive weeks must cover all 5 distinct sets');
  const week6Idx = getWeeklyProphecySetIndex(new Date(2026, 10, 16 + 5 * 7));
  assert.equal(week6Idx, fiveWeeks[0], 'Week 6 must cycle back to Week 1 set');

  // Verify calendar half-month lottery period keys (1-15 vs 16-30/31)
  assert.equal(getLotteryPeriodKey(new Date(2026, 10, 1)), '2026-11-P1');
  assert.equal(getLotteryPeriodKey(new Date(2026, 10, 15)), '2026-11-P1');
  assert.equal(getLotteryPeriodKey(new Date(2026, 10, 16)), '2026-11-P2');
  assert.equal(getLotteryPeriodKey(new Date(2026, 10, 30)), '2026-11-P2');
  assert.equal(getLotteryPeriodKey(new Date(2026, 11, 31)), '2026-12-P2');
});

test('All ritual prophecy datasets contain strictly 5 non-duplicate sets', async () => {
  const {
    STICK_VERSE_SETS,
    STICK_ASPECT_SETS,
    TAROT_MEANING_SETS,
    CANDLE_PROPHECY_SETS,
    OFFERING_GUIDE_SETS,
    REMEDY_SUMMARY_SETS,
    REMEDY_PRACTICAL_SETS,
    REMEDY_MERIT_SETS,
    REMEDY_MANTRA_SETS,
    FESTIVAL_BLESSING_SETS,
    LOVE_FORTUNE_SETS,
    IMAGE_SCAN_READINGS,
    SIGNATURE_TRAIT_SETS,
    MEDITATION_QUOTES_5,
  } = await import('../src/data/ritualProphecies');

  const assert5Unique = (items: readonly string[], label: string) => {
    assert.equal(items.length, 5, `${label} must have 5 sets`);
    assert.equal(new Set(items).size, 5, `${label} must have 5 distinct non-duplicate strings`);
  };

  assert.equal(STICK_VERSE_SETS.length, 28);
  STICK_VERSE_SETS.forEach((sets, i) => assert5Unique(sets, `STICK_VERSE[${i}]`));

  assert.equal(STICK_ASPECT_SETS.length, 4);
  STICK_ASPECT_SETS.forEach((lvl, l) => {
    assert.equal(lvl.length, 4);
    lvl.forEach((asp, a) => assert5Unique(asp, `STICK_ASPECT[${l}][${a}]`));
  });

  assert.equal(TAROT_MEANING_SETS.length, 22);
  TAROT_MEANING_SETS.forEach((cardSets, i) => {
    assert5Unique(cardSets.map((c) => c.up), `TAROT[${i}].up`);
    assert5Unique(cardSets.map((c) => c.rev), `TAROT[${i}].rev`);
  });

  assert5Unique(CANDLE_PROPHECY_SETS.map((c) => c.dedication), 'CANDLE.dedication');
  assert5Unique(CANDLE_PROPHECY_SETS.map((c) => c.mantra.join('|')), 'CANDLE.mantra');

  OFFERING_GUIDE_SETS.forEach((g, i) => assert5Unique(g, `OFFERING_GUIDE[${i}]`));
  REMEDY_SUMMARY_SETS.forEach((s, i) => assert5Unique(s, `REMEDY_SUMMARY[${i}]`));
  REMEDY_PRACTICAL_SETS.forEach((p, i) => assert5Unique(p, `REMEDY_PRACTICAL[${i}]`));
  REMEDY_MERIT_SETS.forEach((m, i) => assert5Unique(m, `REMEDY_MERIT[${i}]`));
  assert5Unique(REMEDY_MANTRA_SETS.map((m) => m.join('|')), 'REMEDY_MANTRA');

  assert.equal(FESTIVAL_BLESSING_SETS.length, 6);
  FESTIVAL_BLESSING_SETS.forEach((f, i) => {
    assert5Unique(f.map((x) => `${x.title}|${x.text}`), `FESTIVAL_BLESSING[${i}]`);
  });

  (['single', 'crush', 'couple'] as const).forEach((status) => {
    assert5Unique(
      LOVE_FORTUNE_SETS[status].map((l) => `${l.verdict}|${l.prediction}|${l.mantra}`),
      `LOVE_FORTUNE[${status}]`
    );
  });

  IMAGE_SCAN_READINGS.forEach((modeArr, m) =>
    modeArr.forEach((elemArr, e) => assert5Unique(elemArr, `IMAGE_SCAN[${m}][${e}]`))
  );

  SIGNATURE_TRAIT_SETS.size.forEach((arr, i) => assert5Unique(arr, `SIG.size[${i}]`));
  SIGNATURE_TRAIT_SETS.rise.forEach((arr, i) => assert5Unique(arr, `SIG.rise[${i}]`));
  SIGNATURE_TRAIT_SETS.jagged.forEach((arr, i) => assert5Unique(arr, `SIG.jagged[${i}]`));
  assert5Unique(MEDITATION_QUOTES_5.map((q) => `${q.pali}|${q.thai}`), 'MEDITATION_QUOTES_5');
});

test('Period-locked unified lucky numbers & weekly prophecies work across Wasm and TS Bridges', async () => {
  const { readFile } = await import('node:fs/promises');
  const { Bridge } = await import('../src/bridge');
  const { getPeriodUnifiedLuckyNumbers } = await import('../src/utils/prophecyCycle');

  // 1. Direct personalization and boundary tests for getPeriodUnifiedLuckyNumbers
  const p1Day1 = getPeriodUnifiedLuckyNumbers({
    date: { year: 2026, month: 11, day: 1 },
    birthYear: 1995,
    zodiac: 11,
    userName: 'ทดสอบ',
    deviceSeed: 'device-A',
    useCache: false,
  });
  const p1Day15 = getPeriodUnifiedLuckyNumbers({
    date: { year: 2026, month: 11, day: 15 },
    birthYear: 1995,
    zodiac: 11,
    userName: 'ทดสอบ',
    deviceSeed: 'device-A',
    useCache: false,
  });
  assert.deepEqual(p1Day1, p1Day15, 'Days 1..15 must lock to identical numbers');

  const p2Day16 = getPeriodUnifiedLuckyNumbers({
    date: { year: 2026, month: 11, day: 16 },
    birthYear: 1995,
    zodiac: 11,
    userName: 'ทดสอบ',
    deviceSeed: 'device-A',
    useCache: false,
  });
  const p2Day30 = getPeriodUnifiedLuckyNumbers({
    date: { year: 2026, month: 11, day: 30 },
    birthYear: 1995,
    zodiac: 11,
    userName: 'ทดสอบ',
    deviceSeed: 'device-A',
    useCache: false,
  });
  assert.deepEqual(p2Day16, p2Day30, 'Days 16..30 must lock to identical numbers');
  assert.notEqual(p1Day1.primary2, p2Day16.primary2, 'Switching 15 -> 16 must change 2-digit lucky number');
  assert.notEqual(p1Day1.primary3, p2Day16.primary3, 'Switching 15 -> 16 must change 3-digit lucky number');

  // Different birthYear / zodiac / deviceSeed personalizes output
  const diffUser = getPeriodUnifiedLuckyNumbers({
    date: { year: 2026, month: 11, day: 1 },
    birthYear: 1988,
    zodiac: 4,
    userName: 'ทดสอบ',
    deviceSeed: 'device-A',
    useCache: false,
  });
  const diffDevice = getPeriodUnifiedLuckyNumbers({
    date: { year: 2026, month: 11, day: 1 },
    birthYear: 1995,
    zodiac: 11,
    userName: 'ทดสอบ',
    deviceSeed: 'device-B',
    useCache: false,
  });
  assert.notEqual(
    `${p1Day1.primary2}|${p1Day1.primary3}`,
    `${diffUser.primary2}|${diffUser.primary3}`,
    'Different birthYear/zodiac must personalize lucky numbers'
  );
  assert.notEqual(
    `${p1Day1.primary2}|${p1Day1.primary3}`,
    `${diffDevice.primary2}|${diffDevice.primary3}`,
    'Different device must personalize lucky numbers'
  );

  // 2. Test both Wasm Bridge and JS Fallback Bridge unify all ritual lucky numbers
  const rawWasm = await readFile(new URL('../public/wasm/core.wasm', import.meta.url));
  const bridges = [await Bridge.fromBytes(rawWasm), await Bridge.fromBytes(new Uint8Array(0))];

  for (const br of bridges) {
    br.setDate(new Date(2026, 10, 15)); // Sun Nov 15, 2026 (P1)
    br.initSession('สมชาย', 2538, 11); // B.E. 2538 -> 1995

    const l0 = br.luckyNumbers(0);
    const l1 = br.luckyNumbers(1);
    const l2 = br.luckyNumbers(2);
    const candle = br.candle(4500);
    const candlePartial = br.candle(1000);
    const coffin = br.blessing(2);
    const loy = br.blessing(3);
    const offer = br.offering(1, 'ขอให้การงานราบรื่น');
    const crisis = br.offering(1, 'ฉันอยากตาย');

    assert.ok(l0.two && l1.three && l2.two && l2.three && l2.run);
    assert.deepEqual(l0.two, l2.two, 'LuckyNumbers 2-digit categories must agree');
    assert.deepEqual(l1.three, l2.three, 'LuckyNumbers 3-digit categories must agree');

    const primary2 = l2.two[0];
    const primary3 = l2.three[0];
    assert.equal(candle.unlocked, true);
    assert.equal(candle.lucky2, primary2, 'Candle lucky2 must match unified period number');
    assert.equal(candle.lucky3, primary3, 'Candle lucky3 must match unified period number');
    assert.equal(coffin.lucky, primary2, 'Coffin card lucky number must match unified period number');
    assert.equal(loy.lucky, primary2, 'Loy Krathong 3D lucky number must match unified period number');
    assert.equal(offer.lucky, primary2, 'Offering lucky number must match unified period number');

    assert.equal(candlePartial.unlocked, false);
    assert.ok(!candlePartial.lucky2);

    assert.equal(crisis.care, true);
    assert.match(crisis.message, /1323/);
    assert.equal(crisis.lucky, undefined);

    // Move forward to Mon Nov 16, 2026 (P2 AND new Monday week)
    br.setDate(new Date(2026, 10, 16));
    const l2Next = br.luckyNumbers(2);
    const coffinNext = br.blessing(2);
    const loyNext = br.blessing(3);
    const candleNext = br.candle(4500);

    assert.notEqual(l2Next.two![0], primary2, 'Day 16 must change 2-digit lucky number');
    assert.notEqual(l2Next.three![0], primary3, 'Day 16 must change 3-digit lucky number');
    assert.equal(coffinNext.lucky, l2Next.two![0], 'Coffin must track new period unified number');
    assert.equal(loyNext.lucky, l2Next.two![0], 'Loy Krathong must track new period unified number');
    assert.equal(candleNext.lucky2, l2Next.two![0]);
    assert.equal(candleNext.lucky3, l2Next.three![0]);

    // Weekly prophecy text rotation on Monday transition
    assert.notEqual(candle.dedication, candleNext.dedication, 'Candle dedication rotates on Monday');
    assert.notEqual(coffin.text, coffinNext.text, 'Coffin blessing text rotates on Monday');
    assert.notEqual(loy.text, loyNext.text, 'Loy Krathong blessing text rotates on Monday');

    // Remedy, imageScan, and signature also rotate cleanly between Sun Nov 15 and Mon Nov 16
    br.setDate(new Date(2026, 10, 15));
    const remSun = br.remedy(6, 0);
    const scanSun = br.imageScan(new Uint8Array(64).fill(42), 0);
    const pts: [number, number, number][] = Array.from({ length: 12 }, (_, i) => [i * 30, 100 - i * 5, 0]);
    const sigSun = br.signature(pts);

    br.setDate(new Date(2026, 10, 16));
    const remMon = br.remedy(6, 0);
    const scanMon = br.imageScan(new Uint8Array(64).fill(42), 0);
    const sigMon = br.signature(pts);

    assert.notEqual(remSun.summary, remMon.summary);
    assert.notEqual(remSun.practical, remMon.practical);
    assert.notEqual(scanSun.reading, scanMon.reading);
    assert.notDeepEqual(sigSun.traits, sigMon.traits);
  }
});

test('Wasm vs JS Fallback full parity: zodiac table, imageScan elements/readings, setDate month, signature, and ScanFortune Y-axis', async () => {
  const { readFile } = await import('node:fs/promises');
  const { Bridge } = await import('../src/bridge');

  const rawWasm = await readFile(new URL('../public/wasm/core.wasm', import.meta.url));
  const wasmBr = await Bridge.fromBytes(rawWasm);
  const jsBr = await Bridge.fromBytes(new Uint8Array(0));

  for (const br of [wasmBr, jsBr]) {
    br.setDate(new Date(2026, 10, 15));
    br.initSession('สมหญิง', 1992, 8);
  }

  // 1. All 12 zodiacs: name, animal, color, direction, and remedy must match between Wasm and JS
  for (let z = 0; z < 12; z++) {
    const wz = wasmBr.zodiacInfo(z);
    const jz = jsBr.zodiacInfo(z);
    assert.equal(jz.name, wz.name, `Zodiac ${z} name mismatch`);
    assert.equal(jz.animal, wz.animal, `Zodiac ${z} animal mismatch`);
    assert.equal(jz.color, wz.color, `Zodiac ${z} color mismatch`);
    assert.equal(jz.direction, wz.direction, `Zodiac ${z} direction mismatch`);
    assert.equal(jz.current_year_name, wz.current_year_name);
    assert.equal(jz.current_year_index, wz.current_year_index);
    assert.equal(jz.year, wz.year);

    const wr = wasmBr.remedy(z, z % 4);
    const jr = jsBr.remedy(z, z % 4);
    assert.equal(jr.color, wr.color, `Remedy ${z} color mismatch`);
    assert.equal(jr.direction, wr.direction, `Remedy ${z} direction mismatch`);
    assert.equal(jr.relation, wr.relation, `Remedy ${z} relation mismatch`);
  }

  // 2. imageScan: Wasm & JS return identical element, fingerprint, scores, and reading across all 5 elements
  const seenElements = new Set<string>();
  for (let seed = 0; seed < 80 && seenElements.size < 5; seed++) {
    const px = new Uint8Array(64).map((_, i) => (i * 17 + seed * 31) & 255);
    for (const mode of [0, 1]) {
      const ws = wasmBr.imageScan(px, mode);
      const js = jsBr.imageScan(px, mode);
      assert.equal(js.element, ws.element, `Element mismatch at seed=${seed}, mode=${mode}`);
      assert.equal(js.fingerprint, ws.fingerprint, `Fingerprint mismatch at seed=${seed}, mode=${mode}`);
      assert.deepEqual(js.scores, ws.scores, `Scores mismatch at seed=${seed}, mode=${mode}`);
      assert.equal(js.reading, ws.reading, `Reading mismatch at seed=${seed}, mode=${mode}`);
      assert.ok(
        ws.reading.includes(ws.element),
        `Reading for element "${ws.element}" must reference "${ws.element}", got: ${ws.reading}`
      );
      assert.ok(!ws.reading.includes('ทองคำ'), `Reading must not leak ทองคำ when element is ${ws.element}`);
    }
    seenElements.add(wasmBr.imageScan(px, 0).element);
  }
  assert.deepEqual(seenElements, new Set(['ไฟ', 'ดิน', 'โลหะ', 'น้ำ', 'ไม้']));

  // 3. setDate month tracking in JS fallback affects weekly set and lucky numbers cleanly
  jsBr.setDate(new Date(2026, 4, 10)); // May 10, 2026
  const maySet = jsBr.getWeeklySetIndex();
  const mayLucky = jsBr.luckyNumbers(2);
  jsBr.setDate(new Date(2026, 10, 10)); // Nov 10, 2026
  const novSet = jsBr.getWeeklySetIndex();
  const novLucky = jsBr.luckyNumbers(2);
  assert.notEqual(maySet, novSet, 'setDate must track month changes');
  assert.notDeepEqual(mayLucky.two, novLucky.two);

  // 4. signature: Wasm & JS parity across stroke geometries
  const sigSamples: [number, number, number][][] = [
    Array.from({ length: 20 }, (_, i) => [100 + i * 35, 800 - i * 30, i < 10 ? 0 : 1]),
    Array.from({ length: 16 }, (_, i) => [200 + i * 10, 500 + (i % 2) * 10, 0]),
    Array.from({ length: 24 }, (_, i) => [50 + i * 25, 100 + i * 30, Math.floor(i / 6)]),
  ];
  for (const pts of sigSamples) {
    const wSig = wasmBr.signature(pts);
    const jSig = jsBr.signature(pts);
    assert.equal(jSig.strokes, wSig.strokes);
    assert.deepEqual(jSig.traits, wSig.traits);
    assert.deepEqual(jSig.scores, wSig.scores);
  }

  // 5. ScanFortune.tsx normalizes Y coordinate by cv.height (not cv.width)
  const scanSrc = await readFile(new URL('../src/components/ScanFortune.tsx', import.meta.url), 'utf8');
  assert.ok(!scanSrc.includes('(y * 1000) / cv.width'), 'ScanFortune.tsx must not divide y by cv.width');
  const yNormMatches = scanSrc.match(/\(y \* 1000\) \/ cv\.height/g) ?? [];
  assert.equal(yNormMatches.length, 2, 'ScanFortune.tsx must normalize y by cv.height in both pointerDown and pointerMove');
});

test('Regression: session restoration, 3D/Canvas resource hygiene, C buffer safety, ARIA nesting, and calendar Set lookup', async () => {
  const { readFile } = await import('node:fs/promises');

  const appSrc = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.ok(appSrc.includes("safeStorage.get<UserSession | null>('session', 'shrine.session'"), 'App must restore shrine.session');
  assert.ok(appSrc.includes("safeStorage.set('session', 'shrine.session', guestSession)"), 'openGuestTab must persist guest session');
  assert.ok(appSrc.includes("safeStorage.remove('session', 'shrine.session')"), 'handleSessionChange must clear shrine.session');

  const gateSrc = await readFile(new URL('../src/components/Gate.tsx', import.meta.url), 'utf8');
  const centerCardSection = gateSrc.slice(gateSrc.indexOf('className="radial-menu-center-card'), gateSrc.indexOf('className="radial-symbols-wheel'));
  assert.ok(!centerCardSection.includes('role="button"'), 'radial-menu-center-card must not wrap buttons with role="button"');

  const loySrc = await readFile(new URL('../src/components/LoyKrathong3D.tsx', import.meta.url), 'utf8');
  assert.ok(loySrc.includes('roomEnv.dispose()'), 'LoyKrathong3D must dispose RoomEnvironment after generating PMREM');
  assert.ok(loySrc.includes('envTarget.dispose()'), 'LoyKrathong3D must dispose envTarget on unmount');

  const burnSrc = await readFile(new URL('../src/components/BurnTalisman.tsx', import.meta.url), 'utf8');
  assert.ok(!burnSrc.includes('ctx.filter'), 'BurnTalisman must not use ctx.filter in render loop');

  const calSrc = await readFile(new URL('../src/components/AuspiciousCalendar.tsx', import.meta.url), 'utf8');
  assert.ok(calSrc.includes('filteredDayDates.has(day.date)'), 'AuspiciousCalendar must use Set lookup instead of filteredDays.some');
  assert.ok(!calSrc.includes('!filteredDays.some('), 'AuspiciousCalendar must not use O(N^2) filteredDays.some');

  const coreC = await readFile(new URL('../wasm/core.c', import.meta.url), 'utf8');
  assert.ok(coreC.includes('#define J_MAX_DEPTH 32'), 'wasm/core.c must expand JSON stack depth beyond 10');
  assert.ok(coreC.includes('if (sp < J_MAX_DEPTH) stk[sp++] = 1;\n  else overflow = 1;'), 'j_open must mark overflow when depth exceeded');
  assert.ok(coreC.includes('char t[16];') && coreC.includes('if (digits > 15) digits = 15;'), 'put_num must guard buffer bounds');
});

test('Full Wasm vs JS Fallback Parity Test across every Bridge method & validation rule', async () => {
  const { readFile } = await import('node:fs/promises');
  const { Bridge } = await import('../src/bridge');
  const {
    STICK_VERSE_SETS,
    STICK_ASPECT_SETS,
    TAROT_MEANING_SETS,
    CANDLE_PROPHECY_SETS,
    FESTIVAL_BLESSING_SETS,
  } = await import('../src/data/ritualProphecies');

  const rawWasm = await readFile(new URL('../public/wasm/core.wasm', import.meta.url));
  const wasmBr = await Bridge.fromBytes(rawWasm);
  const jsBr = await Bridge.fromBytes(new Uint8Array(0));

  // Uninitialized session error parity
  assert.throws(() => wasmBr.zodiacInfo(-1));
  assert.throws(() => jsBr.zodiacInfo(-1));
  assert.throws(() => wasmBr.remedy(-1, 0));
  assert.throws(() => jsBr.remedy(-1, 0));

  // version()
  assert.equal(jsBr.version(), wasmBr.version());

  // setDate() + initSession() parity
  const testDate = new Date(2026, 10, 18); // Wed Nov 18, 2026
  wasmBr.setDate(testDate);
  jsBr.setDate(testDate);

  assert.equal(jsBr.initSession('ทดสอบ', 1500), wasmBr.initSession('ทดสอบ', 1500));
  assert.equal(jsBr.initSession('ทดสอบ', 1990, 12), wasmBr.initSession('ทดสอบ', 1990, 12));
  assert.equal(jsBr.initSession('ทดสอบ', 1990, -2), wasmBr.initSession('ทดสอบ', 1990, -2));
  assert.equal(jsBr.initSession('กิตติ', 2000), wasmBr.initSession('กิตติ', 2000));
  assert.equal(jsBr.initSession('กิตติ', 2543), wasmBr.initSession('กิตติ', 2543));
  assert.equal(jsBr.initSession('กิตติ', 1995.8, 11.2), wasmBr.initSession('กิตติ', 1995.8, 11.2));

  // zodiacInfo() full fields & invalid index parity
  assert.throws(() => wasmBr.zodiacInfo(12));
  assert.throws(() => jsBr.zodiacInfo(12));
  for (let z = -1; z < 12; z++) {
    const wz = wasmBr.zodiacInfo(z);
    const jz = jsBr.zodiacInfo(z);
    assert.equal(jz.index, wz.index);
    assert.equal(jz.name, wz.name);
    assert.equal(jz.animal, wz.animal);
    assert.equal(jz.color, wz.color);
    assert.equal(jz.direction, wz.direction);
    assert.equal(jz.current_year_name, wz.current_year_name);
    assert.equal(jz.current_year_index, wz.current_year_index);
    assert.equal(jz.year, wz.year);
  }

  // drawStick() schema & single-source-of-truth dataset parity
  const setIdx = wasmBr.getWeeklySetIndex();
  assert.equal(jsBr.getWeeklySetIndex(), setIdx);
  for (const br of [wasmBr, jsBr]) {
    const stick = br.drawStick(350);
    assert.ok(stick.stick >= 1 && stick.stick <= 28);
    assert.ok(stick.level >= 0 && stick.level <= 3);
    assert.equal(stick.level_name, ['ดีเยี่ยม', 'ดี', 'ปานกลาง', 'ควรระวัง'][stick.level]);
    assert.equal(stick.verse, STICK_VERSE_SETS[stick.stick - 1][setIdx]);
    assert.equal(stick.aspects.length, 4);
    stick.aspects.forEach((asp, aIdx) => {
      assert.equal(asp.name, ['การเงิน', 'ความรัก', 'สุขภาพ', 'การงาน'][aIdx]);
      assert.equal(asp.text, STICK_ASPECT_SETS[stick.level][aIdx][setIdx]);
    });
  }

  // drawTarot() count clamping, uniqueness, & dataset parity
  for (const count of [0, 3, 99]) {
    const wt = wasmBr.drawTarot(count);
    const jt = jsBr.drawTarot(count);
    const expectedLen = Math.max(1, Math.min(10, count));
    assert.equal(wt.cards.length, expectedLen);
    assert.equal(jt.cards.length, expectedLen);
    assert.equal(new Set(wt.cards.map((c) => c.id)).size, expectedLen);
    assert.equal(new Set(jt.cards.map((c) => c.id)).size, expectedLen);
    for (const card of [...wt.cards, ...jt.cards]) {
      const mSet = TAROT_MEANING_SETS[card.id][setIdx];
      assert.equal(card.meaning, card.reversed ? mSet.rev : mSet.up);
    }
  }

  // luckyNumbers() exact parity + invalid category throws
  assert.throws(() => wasmBr.luckyNumbers(-1));
  assert.throws(() => jsBr.luckyNumbers(-1));
  assert.throws(() => wasmBr.luckyNumbers(3));
  assert.throws(() => jsBr.luckyNumbers(3));
  for (const cat of [0, 1, 2]) {
    assert.deepEqual(jsBr.luckyNumbers(cat), wasmBr.luckyNumbers(cat));
  }

  // remedy() / badLuckRemedy() 12x4 matrix + error parity
  assert.throws(() => wasmBr.remedy(12, 0));
  assert.throws(() => jsBr.remedy(12, 0));
  assert.throws(() => wasmBr.remedy(0, -1));
  assert.throws(() => jsBr.remedy(0, -1));
  assert.throws(() => wasmBr.remedy(0, 4));
  assert.throws(() => jsBr.remedy(0, 4));
  for (let z = -1; z < 12; z++) {
    for (let p = 0; p < 4; p++) {
      assert.deepEqual(jsBr.remedy(z, p), wasmBr.remedy(z, p));
    }
  }

  // candle() / candleUnlock() exact parity
  for (const ms of [-50, 0, 2500, 3999]) {
    const wc = wasmBr.candle(ms);
    const jc = jsBr.candle(ms);
    assert.equal(jc.level, wc.level);
    assert.equal(jc.unlocked, false);
    assert.equal(wc.unlocked, false);
    assert.equal(jc.remaining_ms, wc.remaining_ms);
  }
  for (const ms of [4000, 5000, 75000]) {
    const wc = wasmBr.candle(ms);
    const jc = jsBr.candle(ms);
    assert.deepEqual(jc, wc);
    assert.equal(jc.dedication, CANDLE_PROPHECY_SETS[setIdx].dedication);
    assert.deepEqual(jc.mantra, CANDLE_PROPHECY_SETS[setIdx].mantra);
  }

  // getFestival() boundary date parity
  const festDates: [number, number][] = [
    [1, 1], [1, 14], [1, 15], [2, 28], [3, 15], [4, 1], [4, 13],
    [7, 1], [10, 31], [11, 24], [12, 19], [12, 20], [12, 31],
  ];
  for (const [m, d] of festDates) {
    assert.equal(jsBr.festival(m, d), wasmBr.festival(m, d), `Festival mismatch for ${m}/${d}`);
  }

  // festivalInfo() & blessing() exact parity + invalid id throws
  assert.throws(() => wasmBr.festivalInfo(-1));
  assert.throws(() => jsBr.festivalInfo(-1));
  assert.throws(() => wasmBr.festivalInfo(6));
  assert.throws(() => jsBr.festivalInfo(6));
  assert.throws(() => wasmBr.blessing(-1));
  assert.throws(() => jsBr.blessing(-1));
  assert.throws(() => wasmBr.blessing(6));
  assert.throws(() => jsBr.blessing(6));

  for (let id = 0; id <= 5; id++) {
    const wfi = wasmBr.festivalInfo(id);
    const jfi = jsBr.festivalInfo(id);
    assert.equal(jfi.name, wfi.name);
    assert.equal(jfi.tagline, wfi.tagline);

    const wb = wasmBr.blessing(id);
    const jb = jsBr.blessing(id);
    assert.equal(jb.title, FESTIVAL_BLESSING_SETS[id][setIdx].title);
    assert.equal(jb.text, FESTIVAL_BLESSING_SETS[id][setIdx].text);
    assert.equal(jb.title, wb.title);
    assert.equal(jb.text, wb.text);
    assert.equal(jb.lucky, wb.lucky);
    if (id === 4) {
      assert.ok([8, 18, 28, 66, 88, 168, 888].includes(wb.angpao!));
      assert.ok([8, 18, 28, 66, 88, 168, 888].includes(jb.angpao!));
    } else {
      assert.equal(wb.angpao, undefined);
      assert.equal(jb.angpao, undefined);
    }
  }

  // offering() / digitalOffering() parity + crisis + error throws
  assert.throws(() => wasmBr.offering(-1, 'test'));
  assert.throws(() => jsBr.offering(-1, 'test'));
  assert.throws(() => wasmBr.offering(6, 'test'));
  assert.throws(() => jsBr.offering(6, 'test'));

  const offerTexts = [
    'กังวลเรื่องหนี้และเงิน',
    'คิดถึงแฟนเรื่องความรัก',
    'ป่วยนอนไม่หลับสุขภาพแย่',
    'งานหนักมากเจ้านายเร่ง',
    'ขอให้ครอบครัวมีความสุข',
  ];
  for (let type = 0; type <= 5; type++) {
    for (const msg of offerTexts) {
      const wo = wasmBr.offering(type, msg);
      const jo = jsBr.offering(type, msg);
      assert.equal(jo.offering, wo.offering);
      assert.equal(jo.care, wo.care);
      assert.equal(jo.category, wo.category);
      assert.equal(jo.message, wo.message);
      assert.equal(jo.lucky, wo.lucky);
      assert.equal(jo.color, wo.color);
      assert.ok((jo.merit ?? 0) >= 10 && (jo.merit ?? 0) <= 99);
      assert.ok((wo.merit ?? 0) >= 10 && (wo.merit ?? 0) <= 99);
    }
  }
  const wCare = wasmBr.offering(2, 'รู้สึกไม่อยากมีชีวิตแล้ว');
  const jCare = jsBr.offering(2, 'รู้สึกไม่อยากมีชีวิตแล้ว');
  assert.deepEqual(jCare, wCare);

  // imageScan() & signature() exact parity + invalid input throws
  assert.throws(() => wasmBr.imageScan(new Uint8Array(8), 0));
  assert.throws(() => jsBr.imageScan(new Uint8Array(8), 0));
  assert.throws(() => wasmBr.imageScan(new Uint8Array(32), 2));
  assert.throws(() => jsBr.imageScan(new Uint8Array(32), 2));
  const scanPixels = new Uint8Array(64).map((_, i) => (i * 29 + 13) & 255);
  for (const mode of [0, 1]) {
    const ws = wasmBr.imageScan(scanPixels, mode);
    const js = jsBr.imageScan(scanPixels, mode);
    assert.equal(js.element, ws.element);
    assert.equal(js.fingerprint, ws.fingerprint);
    assert.deepEqual(js.scores, ws.scores);
    assert.equal(js.reading, ws.reading);
  }

  assert.throws(() => wasmBr.signature([[10, 20, 0]]));
  assert.throws(() => jsBr.signature([[10, 20, 0]]));
  const floatPts: [number, number, number][] = Array.from({ length: 18 }, (_, i) => [
    120.7 + i * 28.4,
    720.9 - i * 24.3 + (i % 3) * 15.6,
    i < 9 ? 0 : 1,
  ]);
  const wSig = wasmBr.signature(floatPts);
  const jSig = jsBr.signature(floatPts);
  assert.equal(jSig.strokes, wSig.strokes);
  assert.deepEqual(jSig.traits, wSig.traits);
  assert.deepEqual(jSig.scores, wSig.scores);
});

test('Phase 3 i18n: locale placeholder parity, localized data modules, and card builders across TH/EN/ZH', async () => {
  const { TRANSLATIONS } = await import('../src/data/translations');
  const {
    ZODIAC_SYSTEMS,
    GATE_SYSTEM_NODES,
    getLocalizedZodiacSystem,
    getLocalizedZodiacItem,
  } = await import('../src/data/zodiacSystems');
  const {
    getLocalizedLoveReading,
    getLocalizedMeditationQuote,
    getLocalizedElementName,
    getLocalizedTarotTitle,
  } = await import('../src/data/ritualProphecies');
  const {
    ALL_TEMPLES,
    TEMPLE_TILE_IDS,
    GAME_EVENTS,
    getLocalizedRegion,
    getLocalizedProvince,
    getLocalizedWishTopics,
    getLocalizedGameEvent,
    getLocalizedTemple,
  } = await import('../src/data/sacredTemplesData');
  const {
    generateMonthAuspiciousDays,
    getThaksaRelation,
    getLocalizedMonths,
    getLocalizedWeekdays,
    getLocalizedBirthDays,
    getLocalizedWorkCategories,
    getLocalizedDayDetails,
    getLocalizedThaksaRelation,
  } = await import('../src/data/auspiciousCalendarData');
  const {
    resolvePostponedDraw,
    getLocalizedShortMonths,
    getLocalizedLotteryDrawDayOptions,
    formatLocalizedShortDate,
    formatPostponedNoteByLang,
  } = await import('../src/data/postponedLotteryDraws');
  const {
    formatLotteryDateByLang,
    getLocalizedPrizeName,
  } = await import('../src/utils/lotteryApi');
  const {
    buildStickCardData,
    buildTarotCardData,
    buildLuckyNumbersCardData,
    buildAuspiciousCardData,
    buildSacredJourneyCardData,
    TAROT_GLYPHS,
  } = await import('../src/utils/cardDataBuilder');

  const langs = ['th', 'en', 'zh'] as const;

  // 1. Dictionary values non-empty & {placeholder} parity across all languages
  const extractPlaceholders = (s: string) =>
    [...(s.match(/\{[a-zA-Z0-9_]+\}/g) || [])].sort().join(',');

  for (const k of Object.keys(TRANSLATIONS.th) as (keyof typeof TRANSLATIONS.th)[]) {
    const thVal = TRANSLATIONS.th[k];
    const enVal = TRANSLATIONS.en[k];
    const zhVal = TRANSLATIONS.zh[k];
    assert.ok(thVal.length > 0, `Empty TH value for ${k}`);
    assert.ok(enVal.length > 0, `Empty EN value for ${k}`);
    assert.ok(zhVal.length > 0, `Empty ZH value for ${k}`);
    if (k === 'calYearPrefix') {
      assert.equal(extractPlaceholders(thVal), '{yearBE}');
      assert.equal(extractPlaceholders(enVal), '{yearBE},{yearCE}');
      assert.equal(extractPlaceholders(zhVal), '{yearBE},{yearCE}');
    } else {
      assert.equal(extractPlaceholders(enVal), extractPlaceholders(thVal), `Placeholder mismatch in EN key: ${k}`);
      assert.equal(extractPlaceholders(zhVal), extractPlaceholders(thVal), `Placeholder mismatch in ZH key: ${k}`);
    }
  }

  // 2. Zodiac systems & items localization
  for (const sys of ZODIAC_SYSTEMS) {
    assert.ok(GATE_SYSTEM_NODES[sys.id], `Missing GATE_SYSTEM_NODES entry for ${sys.id}`);
    for (const lang of langs) {
      assert.ok(GATE_SYSTEM_NODES[sys.id].label[lang].length > 0);
      assert.ok(GATE_SYSTEM_NODES[sys.id].sub[lang].length > 0);
      const locSys = getLocalizedZodiacSystem(sys, lang);
      assert.ok(locSys.name.length > 0 && locSys.region.length > 0);
      for (const item of sys.items) {
        const locItem = getLocalizedZodiacItem(item, sys.id, lang);
        assert.ok(locItem.name.length > 0);
        assert.ok(locItem.primaryLabel.length > 0);
        assert.ok(locItem.element.length > 0);
      }
    }
  }
  assert.notEqual(
    getLocalizedZodiacSystem(ZODIAC_SYSTEMS[0], 'en').name,
    getLocalizedZodiacSystem(ZODIAC_SYSTEMS[0], 'th').name
  );
  assert.notEqual(
    getLocalizedZodiacSystem(ZODIAC_SYSTEMS[0], 'zh').name,
    getLocalizedZodiacSystem(ZODIAC_SYSTEMS[0], 'en').name
  );

  // 3. Love fortune, meditation quotes, elements, and tarot titles
  for (const lang of langs) {
    for (const status of ['single', 'crush', 'couple'] as const) {
      for (let i = 0; i < 5; i++) {
        const reading = getLocalizedLoveReading(status, i, lang);
        assert.ok(reading.verdict.length > 0 && reading.prediction.length > 0 && reading.mantra.length > 0);
      }
    }
    for (let i = 0; i < 5; i++) {
      const q = getLocalizedMeditationQuote(i, lang);
      assert.ok(q.pali.length > 0 && q.thai.length > 0);
    }
    assert.ok(getLocalizedElementName('ธาตุไฟ', lang).length > 0);
    assert.ok(getLocalizedElementName('ธาตุน้ำ', lang).length > 0);
    for (let id = 0; id < 22; id++) {
      assert.ok(getLocalizedTarotTitle(id, 'ไพ่', 'Card', lang).length > 0);
    }
  }
  assert.equal(getLocalizedTarotTitle(0, 'เดอะฟูล', 'The Fool', 'en'), 'The Fool');
  assert.match(getLocalizedTarotTitle(0, 'เดอะฟูล', 'The Fool', 'zh'), /愚者/);

  // 4. Sacred temples metadata, provinces, regions, wishes, events
  const eventIds = Object.keys(GAME_EVENTS).map(Number);
  assert.ok(TEMPLE_TILE_IDS.length === 9);
  for (const lang of langs) {
    assert.equal(getLocalizedWishTopics(lang).length, 6);
    assert.ok(getLocalizedRegion('กลาง', lang).length > 0);
    assert.ok(getLocalizedProvince('เชียงใหม่', lang).length > 0);
    for (const eid of eventIds) {
      const ev = getLocalizedGameEvent(eid, lang);
      assert.ok(ev && ev.name.length > 0 && ev.desc.length > 0);
    }
    const locTemple = getLocalizedTemple(ALL_TEMPLES[0], lang);
    assert.ok(locTemple.name.startsWith('วัด'));
    assert.ok(locTemple.province.length > 0 && locTemple.region.length > 0 && locTemple.blessing.length > 0);
  }
  assert.equal(getLocalizedTemple(ALL_TEMPLES[0], 'en').region.includes('ภาค'), false);

  // 5. Auspicious calendar localization
  const novDays = generateMonthAuspiciousDays(2569, 11);
  const sampleDay = novDays[23];
  for (const lang of langs) {
    assert.equal(getLocalizedMonths(lang).length, 12);
    assert.equal(getLocalizedWeekdays(lang).length, 7);
    assert.equal(getLocalizedBirthDays(lang).length, 8);
    const cats = getLocalizedWorkCategories(lang);
    assert.ok(cats.wedding.title.length > 0 && cats.others.title.length > 0);
    const locDay = getLocalizedDayDetails(sampleDay, lang);
    assert.ok(locDay.dayName.length > 0 && locDay.lunarDate.length > 0 && locDay.thaiRukName.length > 0);
    assert.ok(locDay.bestHours.ubakongYama.length > 0 && locDay.luckyColors.length > 0);
    const thaksa = getLocalizedThaksaRelation(getThaksaRelation('sunday', 5), 'sunday', lang);
    assert.equal(thaksa.isKalakini, true);
    assert.ok(thaksa.advice.length > 0 && thaksa.badgeText.length > 0 && thaksa.nameTh.length > 0);
  }

  // 6. Lottery & Postponed draws localization
  const postponed = resolvePostponedDraw('2026-12-17');
  assert.ok(postponed);
  for (const lang of langs) {
    assert.equal(getLocalizedShortMonths(lang).length, 12);
    assert.equal(getLocalizedLotteryDrawDayOptions(lang).length, 31);
    assert.ok(formatLocalizedShortDate('2026-11-01', lang).length > 0);
    assert.ok(formatLotteryDateByLang('2026-11-01', lang).length > 0);
    assert.ok(formatPostponedNoteByLang(postponed, lang).length > 0);
    assert.ok(getLocalizedPrizeName('รางวัลที่ 1', lang).length > 0);
  }
  assert.equal(getLocalizedPrizeName('รางวัลที่ 1', 'en'), '1st Prize');
  assert.equal(getLocalizedPrizeName('รางวัลที่ 1', 'zh'), '一等奖');

  // 7. Card data builders across languages
  const sampleStick = {
    stick: 8,
    title: 'สิริมงคล',
    level: 0,
    level_name: 'ดีเยี่ยม',
    verse: 'ก้าวหน้ามั่นคง',
    aspects: [{ name: 'การเงิน', text: 'คล่องตัว' }],
  };
  const sampleTarot = [{ id: 0, name: 'เดอะฟูล', en: 'The Fool', reversed: false, meaning: 'เริ่มต้นใหม่' }];
  for (const lang of langs) {
    const sCard = buildStickCardData(sampleStick, lang);
    const { cardData: tCard } = buildTarotCardData(sampleTarot, 1, TAROT_GLYPHS, { 1: ['Daily'] }, lang);
    const { cardData: nCard } = buildLuckyNumbersCardData('89', 0, lang);
    const aCard = buildAuspiciousCardData(sampleDay, getLocalizedMonths(lang)[10], lang);
    const sjCard = buildSacredJourneyCardData([{ name: ALL_TEMPLES[0].name, province: 'Bangkok' }], 330, 'Peace', lang);
    assert.ok(sCard.title.length > 0);
    assert.ok(tCard.title.length > 0);
    assert.ok(nCard.title.length > 0);
    assert.ok(aCard.title.length > 0 && aCard.details.auspiciousInfo?.thaiRukName);
    assert.ok(sjCard.title.length > 0 && sjCard.details.remedyInfo?.advice);
  }
});



