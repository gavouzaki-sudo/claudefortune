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
