import test from 'node:test'
import assert from 'node:assert/strict'
import { generateLesson } from './agent.js'
import { validateLesson } from './schema.js'
import { sampleLesson, nextKind, isCorrect, gameKinds } from '../../src/data/learning.js'
const output = (text,annotations=[]) => ({status:'completed',output:[{type:'message',content:[{type:'output_text',text,annotations}]}]})
function mockProvider(lesson,{flagged=false,source='https://www.si.edu/ocean'}={}) {
  const requests = []
  const fetchImpl = async (url,options) => {
    const body = JSON.parse(options.body);requests.push({url,body})
    if(url.endsWith('/moderations')) return {ok:true,json:async () => ({results:[{flagged}]})}
    if(body.tools) return {ok:true,json:async () => output('Fish have gills. Whales breathe air.',[{type:'url_citation',url:source,title:'Ocean learning'}])}
    return {ok:true,json:async () => output(JSON.stringify(lesson))}
  }
  return {fetchImpl,requests}
}
test('all sample formats have valid and gradable answers',() => {
  for(const kind of gameKinds) {
    const lesson = sampleLesson(kind)
    validateLesson(lesson,kind)
    for(const round of lesson.rounds) {assert.equal(isCorrect(round,round.solution),true);assert.equal(isCorrect(round,[]),false)}
  }
})
test('a new activity avoids the last three formats',() => {
  const history = []
  for(let i=0;i<16;i++) {const kind=nextKind(history);assert.ok(!history.slice(-3).some(item => item.kind === kind));history.push({kind})}
})
test('out-of-range answers and duplicate sequence steps are rejected',() => {
  const quiz = sampleLesson('quiz');quiz.rounds[0].solution=[100]
  assert.throws(() => validateLesson(quiz),/quiz/)
  const sequence=sampleLesson('sequence');sequence.rounds[0].solution=[0,0,2,3]
  assert.throws(() => validateLesson(sequence),/sequence/)
  const match=sampleLesson('match');match.rounds[0].solution=[0,0,1,2]
  assert.throws(() => validateLesson(match),/matching/)
})
test('agent researches first, generates a validated game, and returns source links',async () => {
  const provider=mockProvider(sampleLesson('sort'))
  const lesson=await generateLesson({topic:'Ocean animals',history:[{title:'Previous quiz',kind:'quiz'}]},{apiKey:'test-only',...provider})
  assert.equal(lesson.kind,'sort');assert.equal(lesson.origin,'ai');assert.equal(lesson.sources.length,1)
  const responses=provider.requests.filter(item => item.url.endsWith('/responses'))
  assert.equal(responses.length,2);assert.equal(responses[0].body.tools[0].type,'web_search');assert.equal(responses[0].body.tool_choice,'required')
  assert.equal(responses[1].body.text.format.type,'json_schema')
  assert.ok(responses.every(item => item.body.store === false))
  assert.equal(provider.requests.filter(item => item.url.endsWith('/moderations')).length,2)
})
test('no key, flagged content, missing citations, wrong game format and provider failure fail clearly',async () => {
  await assert.rejects(generateLesson({topic:'Ocean'},{apiKey:''}),/NOT_CONFIGURED/)
  await assert.rejects(generateLesson({topic:'Ocean'},{apiKey:'test',...mockProvider(sampleLesson('quiz'),{flagged:true})}),/CONTENT_BLOCKED/)
  await assert.rejects(generateLesson({topic:'Ocean'},{apiKey:'test',...mockProvider(sampleLesson('quiz'),{source:'https://untrusted.example/info'})}),/NO_SOURCES/)
  await assert.rejects(generateLesson({topic:'Ocean'},{apiKey:'test',...mockProvider(sampleLesson('sort'))}),/structure/)
  await assert.rejects(generateLesson({topic:'Ocean'},{apiKey:'test',fetchImpl:async () => ({ok:false})}),/MODERATION_FAILED/)
})
test('saved lessons survive MongoDB schema casting',async () => {
  const { Family } = await import('../models.js')
  const { initial } = await import('../../src/data/initial.js')
  const lesson=sampleLesson('sequence')
  const family=new Family({...initial,key:'test',activities:[{id:'test',topic:lesson.topic,aid:'',approved:true,lesson}]})
  await family.validate()
  const stored=family.toObject().activities[0]
  assert.equal(stored.approved,true);assert.equal(stored.lesson.kind,'sequence');assert.deepEqual(stored.lesson.rounds[0].solution,lesson.rounds[0].solution)
})
