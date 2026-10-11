import { Router } from 'express'
import { generateLesson } from './agent.js'
import { gameKinds } from '../../src/data/learning.js'
export const learningRouter = Router()
let activeRequests = 0
let requests = []
learningRouter.get('/status',(_req,res) => res.json({configured:Boolean(process.env.OPENAI_API_KEY)}))
learningRouter.post('/generate',async (req,res) => {
  const {topic,aid = '',history = []} = req.body || {}
  if(typeof topic !== 'string' || !topic.trim() || topic.length > 100 || typeof aid !== 'string' || aid.length > 3000 || !Array.isArray(history) || history.length > 20 || history.some(item => !item || !gameKinds.includes(item.kind) || typeof item.title !== 'string' || item.title.length > 200)) return res.status(400).json({message:'Enter a topic of up to 100 characters and optional learning notes.'})
  if(!process.env.OPENAI_API_KEY) return res.status(503).json({message:'The AI tutor is not connected. Add OPENAI_API_KEY to the server environment. You can try the sample ocean adventures below.'})
  requests = requests.filter(time => Date.now()-time < 60000)
  if(activeRequests >= 2 || requests.length >= 6) return res.status(429).json({message:'Bubbi is making another adventure. Please try again in a minute.'})
  requests.push(Date.now());activeRequests++
  try {res.json(await generateLesson({topic:topic.trim(),aid,history}))}
  catch {res.status(502).json({message:'Bubbi couldn’t create a source-backed activity for this topic. Try a school topic or clearer learning notes.'})}
  finally {activeRequests--}
})
