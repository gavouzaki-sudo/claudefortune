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
});




