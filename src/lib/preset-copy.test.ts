import test from 'node:test'
import assert from 'node:assert/strict'
import { CORE_ORDER, PRESET_COPY, coreFor, presetCopy } from './preset-copy.ts'

test('ten presets, unique ids, one entry per rail voice', () => {
  const ids = PRESET_COPY.map((p) => p.id)
  assert.equal(ids.length, 10)
  assert.equal(new Set(ids).size, 10)
  for (const id of ['dB', 'Pulse', 'Bass', 'Spectral', 'Stems', 'MIDI', 'BPM', 'Snap & Hold', 'Harmony', 'Automation']) {
    assert.ok(ids.includes(id), `missing ${id}`)
  }
})

test('the core never loses Range or Force, and keeps its order', () => {
  for (const p of PRESET_COPY) {
    const core = coreFor(p.id)
    assert.ok(core.includes('Range') && core.includes('Force'), `${p.id} dropped Range or Force`)
    const idx = core.map((s) => CORE_ORDER.indexOf(s))
    for (let i = 1; i < idx.length; i++) assert.ok(idx[i] > idx[i - 1], `${p.id} reordered the core`)
  }
})

test('verbs describe the plan they declare', () => {
  for (const p of PRESET_COPY) {
    if (p.verb === 'core') { assert.ok(!p.hide && !p.replace && !p.extra, `${p.id}: core means nothing added or replaced`) }
    if (p.verb === 'add') { assert.ok(p.extra && !p.hide && !p.replace, `${p.id}: add means one extra section`) }
    if (p.verb === 'replace') { assert.ok(p.replace && CORE_ORDER.includes(p.replace), `${p.id}: replace needs a core target`) }
    if (p.verb === 'hide') { assert.ok(p.hide && p.hide.length > 0, `${p.id}: hide needs a section`) }
    assert.ok(coreFor(p.id).length >= 2, `${p.id}: at least two core sections must survive`)
  }
})

test('a replaced section is never hidden at the same time', () => {
  for (const p of PRESET_COPY) {
    if (p.replace && p.hide) assert.ok(!p.hide.includes(p.replace), `${p.id} both replaces and hides ${p.replace}`)
  }
})

test('bands that are hidden do not carry copy', () => {
  for (const p of PRESET_COPY) {
    if ((p.hide ?? []).includes('Band')) assert.equal(p.bandNote, '', `${p.id}: hidden band cannot have a note`)
  }
})

test('presetCopy falls back instead of returning undefined', () => {
  assert.equal(presetCopy('nope').id, 'dB')
  assert.equal(presetCopy('Pulse').id, 'Pulse')
})

test('the unwired presets declare it, the wired ones do not lie', () => {
  const unwired = PRESET_COPY.filter((p) => !p.wired).map((p) => p.id)
  assert.deepEqual(unwired.sort(), ['Automation', 'Harmony', 'MIDI', 'Stems'].sort())
})

test('a source that is not analysis is never reachable in the audio panel', () => {
  for (const p of PRESET_COPY) {
    if (p.source === 'model' || p.source === 'transport') assert.equal(p.wired, false, `${p.id}: capability missing means not wired`)
    if (p.source === 'transport') assert.equal(p.hidden, true, `${p.id}: transport presets leave the audio rail`)
  }
  const hidden = PRESET_COPY.filter((p) => p.hidden).map((p) => p.id).sort()
  assert.deepEqual(hidden, ['Automation', 'MIDI'].sort())
})
