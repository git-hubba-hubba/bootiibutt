import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeVitalImport } from '../vitalImport.js'
import { Family } from '../models.js'

const imported = {importId:'test-import',insurance:[{id:'dependent',category:'Dental',coveredPerson:'Test child',memberId:'TEST 03',services:[{label:'Support',value:'555-0100',kind:'phone'}],costs:[]}]}
test('insurance import preserves existing care notes and trusted contacts', () => {
  const vital = {medical:'Existing care plan',allergies:'Existing allergy',contacts:{Mom:[{name:'Contact'}]},insurance:[]}
  const result = mergeVitalImport(vital, imported)
  assert.equal(result.medical, vital.medical)
  assert.equal(result.allergies, vital.allergies)
  assert.deepEqual(result.contacts, vital.contacts)
  assert.equal(result.insurance.length, 1)
  assert.equal(vital.insurance.length, 0)
})
test('repeated imports do not duplicate insurance records or overwrite edits', () => {
  const first = mergeVitalImport({insurance:[]}, imported)
  first.insurance[0] = {...first.insurance[0],memberId:'EDITED'}
  assert.strictEqual(mergeVitalImport(first, imported), first)
  const result = mergeVitalImport(first, {...imported,importId:'second-import'})
  assert.equal(result.insurance.length, 1)
  assert.equal(result.insurance[0].memberId, 'EDITED')
})
test('missing local import leaves family records unchanged', () => {
  const vital = {medical:'Keep'}
  assert.strictEqual(mergeVitalImport(vital, null), vital)
})
test('MongoDB schema retains dependent roles, contacts, benefits and source references', async () => {
  const record = {...imported.insurance[0],relationship:'Dependent',subscriber:'Test subscriber',sourceUrl:'/api/vital-cards/dependent-dental.png',costs:[{label:'Family',inNetwork:'$2,000',outOfNetwork:'$7,000'}]}
  const family = new Family({key:'test',vital:{insurance:[record],insuranceImports:['test-import']}})
  await family.validate()
  assert.deepEqual(family.vital.insurance[0].toObject(), record)
  assert.deepEqual([...family.vital.insuranceImports], ['test-import'])
})
