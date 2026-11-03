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



