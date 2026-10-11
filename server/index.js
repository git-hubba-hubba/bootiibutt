import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import nodemailer from 'nodemailer'
import { mkdir } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { randomUUID, timingSafeEqual, createHash } from 'node:crypto'
import { Family } from './models.js'
import { initial } from '../src/data/initial.js'
import { learningRouter } from './learning/routes.js'
import { validateLesson } from './learning/schema.js'
import { readVitalImport, mergeVitalImport, privateDirectory } from './vitalImport.js'
import { fileURLToPath } from 'node:url'
const importedVital = await readVitalImport()
const seededInitial = { ...initial, vital: mergeVitalImport(initial.vital, importedVital) }
const app = express()
const production = process.env.NODE_ENV === 'production'
if (production && (!process.env.APP_USERNAME || !process.env.APP_PASSWORD)) {
 throw new Error('APP_USERNAME and APP_PASSWORD are required in production.')
}
app.get('/api/health', (_req, res) => {
 res.set('Cache-Control', 'no-store')
 res.json({database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'})
})
if (production) {
 const digest = value => createHash('sha256').update(value).digest()
 const expected = digest(`${process.env.APP_USERNAME}:${process.env.APP_PASSWORD}`)
 app.use((req, res, next) => {
  const authorization = req.get('authorization') || ''
  const credentials = authorization.startsWith('Basic ') ? Buffer.from(authorization.slice(6), 'base64').toString('utf8') : ''
  if (timingSafeEqual(digest(credentials), expected)) return next()
  res.set('WWW-Authenticate', 'Basic realm="Bubbi Cafe", charset="UTF-8"')
  res.set('Cache-Control', 'no-store')
  res.status(401).send('Sign in to access Bubbi Cafe.')
 })
}
const uploadPath = resolve(process.env.UPLOAD_DIR || 'server/uploads')
await mkdir(uploadPath,{recursive:true})
app.use(express.json({limit:'1mb'}))
app.use('/api',(_req,res,next) => {res.set('Cache-Control','no-store');next()})
app.use('/api/learning', learningRouter)
// Local private files are kept outside the frontend/public assets and source control.
app.get('/api/vital-import', (_req,res) => res.json(importedVital || {insurance:[]}))
app.get('/api/vital-cards/:name', (req,res) => {
 const allowed = new Set(['medical-id.pdf','subscriber-dental.png','dependent-dental.png'])
 if(!allowed.has(req.params.name)) return res.sendStatus(404)
 res.set('X-Content-Type-Options','nosniff')
 res.set('Content-Security-Policy',"default-src 'none'; sandbox")
 res.sendFile(req.params.name,{root:fileURLToPath(new URL('cards/',privateDirectory))})
})
app.use('/api',(_req,res,next) => { if(mongoose.connection.readyState !== 1) return res.status(503).json({message:'MongoDB is not connected.'});next() })
const serialize = family => {const result = family.toObject();delete result._id;delete result.__v;delete result.key;delete result.createdAt;delete result.updatedAt;return result}
app.get('/api/family',async (_req,res,next) => {try { const family = await Family.findOneAndUpdate({key:'family'},{$setOnInsert:{...seededInitial,key:'family',revision:0}},{upsert:true,new:true,runValidators:true});res.json(serialize(family)) } catch(error) {next(error)} })
app.put('/api/family',async (req,res,next) => {
 try {
  const {events,items,vital,photos,documents,activities,revision} = req.body
  if(!Number.isInteger(revision) || ![events,items,photos,documents,activities].every(Array.isArray) || !vital) return res.status(400).json({message:'Invalid family record.'})
  if(events.some(event => !Number.isFinite(Date.parse(event.start)) || !Number.isFinite(Date.parse(event.end)) || event.end <= event.start)) return res.status(400).json({message:'Invalid event time range.'})
  if(['Mom','Dad'].some(parent => vital.contacts?.[parent]?.length !== 3)) return res.status(400).json({message:'Each parent needs three contact slots.'})
  if(items.some(item => new Set(item.votes).size !== item.votes.length || Object.values(item.commitments).some(amount => !Number.isFinite(amount) || amount < 0 || amount > item.cost))) return res.status(400).json({message:'Invalid vote or commitment.'})
  if([...photos,...documents].some(file => !/^\/api\/files\/[a-f0-9-]+\.(pdf|txt|jpg|jpeg|png|webp)$/.test(file.url))) return res.status(400).json({message:'Invalid file reference.'})
  for(const activity of activities) { if(activity.lesson) validateLesson(activity.lesson) }
  const family = await Family.findOneAndUpdate({key:'family',revision},{$set:{events,items,vital,photos,documents,activities},$inc:{revision:1}},{new:true,runValidators:true})
  if(!family) return res.status(409).json({message:'Another parent saved changes. Your view has been refreshed; please try again.'})
  res.json(serialize(family))
 } catch(error) {next(error)}
})
const types = {'.pdf':'application/pdf','.txt':'text/plain','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'}
const upload = multer({storage:multer.diskStorage({destination:uploadPath,filename:(_req,file,done) => done(null,randomUUID()+extname(file.originalname).toLowerCase())}),limits:{fileSize:10*1024*1024,files:1},fileFilter:(_req,file,done) => {const type=types[extname(file.originalname).toLowerCase()];done(type && type === file.mimetype ? null : new Error('Unsupported file type.'),Boolean(type && type === file.mimetype))}})
app.post('/api/uploads',upload.single('file'),(req,res) => {if(!req.file) return res.status(400).json({message:'A file is required.'});res.status(201).json({url:'/api/files/'+req.file.filename})})
app.use('/api/files',(_req,res,next) => {res.set('X-Content-Type-Options','nosniff');res.set('Content-Security-Policy',"default-src 'none'; sandbox");next()},express.static(uploadPath))
let lastAlert = 0
app.post('/api/emergency',async (req,res) => {
 const {role,message} = req.body
 if(!['Mom','Dad'].includes(role) || typeof message !== 'string' || !message.trim() || message.length > 500) return res.status(400).json({message:'Enter a message of up to 500 characters.'})
 const required = ['SMTP_HOST','SMTP_USER','SMTP_PASS','ALERT_FROM','ALERT_EMAILS','TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM','ALERT_PHONES']
 if(required.some(key => !process.env[key])) return res.status(503).json({message:'Email and SMS providers are not configured. No alert was sent. Contact the other parent directly.'})
 if(Date.now()-lastAlert < 30000) return res.status(429).json({message:'An alert was just requested. Please wait 30 seconds before sending again.'})
 lastAlert = Date.now()
 const smtp = nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT || 587),secure:process.env.SMTP_PORT === '465',connectionTimeout:15000,greetingTimeout:15000,socketTimeout:15000,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})
 const text = `Urgent family alert from ${role}: ${message}`
 const results = await Promise.allSettled([
  smtp.sendMail({from:process.env.ALERT_FROM,to:process.env.ALERT_EMAILS,subject:'Urgent Bubbi Cafe family alert',text}),
  ...process.env.ALERT_PHONES.split(',').map(async phone => {const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,{method:'POST',headers:{Authorization:'Basic '+Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({To:phone.trim(),From:process.env.TWILIO_FROM,Body:text}),signal:AbortSignal.timeout(15000)});if(!response.ok) throw new Error('SMS provider rejected the request.')})
 ])
 const failed = results.filter(result => result.status === 'rejected').length
 res.status(failed ? 502 : 202).json({message:failed ? `${results.length-failed} of ${results.length} delivery requests accepted. Some channels failed; contact the other parent directly.` : 'Email and SMS providers accepted the alert. Delivery is not yet confirmed.'})
})
app.use('/api', (_req, res) => res.status(404).json({message:'API route not found.'}))
if (production) {
 const frontendPath = fileURLToPath(new URL('../dist/', import.meta.url))
 app.use(express.static(frontendPath))
 app.get('/{*path}', (_req, res) => res.sendFile('index.html', {root:frontendPath}))
}
app.use((error,_req,res,_next) => {res.status(error instanceof multer.MulterError || error.name === 'ValidationError' ? 400 : 500).json({message:error instanceof multer.MulterError ? 'Upload failed. Maximum file size is 10 MB.' : 'Unable to save this request. Check your input and try again.'})})
if(process.env.MONGODB_URI) {try {await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000}); const existing = await Family.findOne({key:'family'})
 if(existing && importedVital && !existing.vital.insuranceImports?.includes(importedVital.importId)) {
  await Family.updateOne({_id:existing._id,revision:existing.revision},{$set:{vital:mergeVitalImport(existing.vital.toObject(),importedVital)},$inc:{revision:1}},{runValidators:true})
 }
 console.log('MongoDB connected.')} catch {console.error('MongoDB connection failed. Check MONGODB_URI.')}} else console.log('MONGODB_URI is missing; API returns unavailable until configured.')
const port = Number(process.env.PORT || 3001)
const host = production ? '0.0.0.0' : '127.0.0.1'
app.listen(port, host, () => console.log(`Bubbi Cafe listening on ${host}:${port}`))
