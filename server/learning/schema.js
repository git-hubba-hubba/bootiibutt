import { gameKinds } from '../../src/data/learning.js'
const text = {type:'string'}
export const lessonSchema = {
  type:'object',additionalProperties:false,
  required:['title','concept','intro','kind','rounds'],
  properties:{title:text,concept:text,intro:text,kind:{type:'string',enum:gameKinds},rounds:{type:'array',items:{type:'object',additionalProperties:false,required:['prompt','cards','targets','solution','explanation','hint'],properties:{prompt:text,cards:{type:'array',items:text},targets:{type:'array',items:text},solution:{type:'array',items:{type:'integer'}},explanation:text,hint:text}}}},
}
export function validateLesson(lesson, kind) {
  const validText = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 2000
  if (!lesson || !['title','concept','intro'].every(key => validText(lesson[key])) || !gameKinds.includes(lesson.kind) || (kind && lesson.kind !== kind) || !Array.isArray(lesson.rounds) || lesson.rounds.length < 2 || lesson.rounds.length > 5) throw new Error('Invalid lesson structure.')
  if(lesson.title.length > 200) throw new Error('Lesson title is too long.')
  for (const round of lesson.rounds) {
    if (!['prompt','explanation','hint'].every(key => validText(round[key])) || !Array.isArray(round.cards) || round.cards.length < 2 || round.cards.length > 6 || !round.cards.every(validText) || new Set(round.cards).size !== round.cards.length || !Array.isArray(round.targets) || !round.targets.every(validText) || !Array.isArray(round.solution) || !round.solution.every(Number.isInteger)) throw new Error('Invalid lesson round.')
    if (lesson.kind === 'quiz') {
      if (round.targets.length || round.solution.length !== 1 || round.solution[0] < 0 || round.solution[0] >= round.cards.length) throw new Error('Invalid quiz solution.')
    } else if (lesson.kind === 'sequence') {
      if (round.targets.length || round.solution.length !== round.cards.length || new Set(round.solution).size !== round.cards.length || round.solution.some(index => index < 0 || index >= round.cards.length)) throw new Error('Invalid sequence solution.')
    } else {
      if (round.targets.length < 2 || round.targets.length > 6 || new Set(round.targets).size !== round.targets.length || round.solution.length !== round.cards.length || round.solution.some(index => index < 0 || index >= round.targets.length)) throw new Error('Invalid assignment solution.')
      if (lesson.kind === 'match' && (round.targets.length !== round.cards.length || new Set(round.solution).size !== round.cards.length)) throw new Error('Invalid matching solution.')
    }
  }
  return lesson
}
