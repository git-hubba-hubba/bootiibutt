import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { Field, SectionHeading } from '../components/UI'
import LessonPlayer from '../components/learning/LessonPlayer'
import { gameKinds, gameLabels, gameEmoji, nextKind, sampleLesson } from '../data/learning'
import './Learn.css'
export default function Learn({ data, update, role, learningHistory, setLearningHistory }) {
  const [selected,setSelected] = useState(null)
  const [configured,setConfigured] = useState(null)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [draft,setDraft] = useState(false)
  const [finished,setFinished] = useState(false)
  const parent = role === 'Mom' || role === 'Dad'
  const library = data.activities.filter(activity => activity.approved && activity.lesson)
  useEffect(() => {let active = true;fetch('/api/learning/status').then(async response => {if(!response.ok) throw new Error();const result=await response.json();if(active) setConfigured(result.configured)}).catch(() => {if(active) setConfigured(false)});return () => {active=false}},[])
  function remember(lesson) {setLearningHistory(current => [...current,{title:lesson.title,kind:lesson.kind,topic:lesson.topic}].slice(-20))}
  function playSample() {
    const lesson = sampleLesson(nextKind(learningHistory.filter(item => item.topic === 'Ocean animals')))
    setSelected(lesson);setDraft(false);setFinished(false);setError('');setNotice('Sample activity · no AI request was made.');remember(lesson)
  }
  async function generate(topic, aid = '') {
    setBusy(true);setError('');setNotice('Bubbi is researching the topic and creating a new way to learn. This can take a minute.')
    try {
      const previous = [...data.activities.filter(activity => activity.lesson).map(activity => ({topic:activity.topic,title:activity.lesson.title,kind:activity.lesson.kind})), ...learningHistory]
      const history = previous.filter(item => item.topic.toLowerCase() === topic.toLowerCase()).slice(-8).map(({title,kind}) => ({title,kind}))
      const response = await fetch('/api/learning/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic,aid,history}),signal:AbortSignal.timeout(160000)})
      const result = await response.json()
      if(!response.ok) throw new Error(result.message || 'The AI tutor couldn’t make an adventure. Try again.')
      setSelected(result);setDraft(parent);setFinished(false);remember(result);setNotice(parent ? 'Preview this adventure, then add it to Julian’s library.' : 'Your new adventure is ready!')
    } catch(err) {setNotice('');setError(err.name === 'TimeoutError' ? 'That took too long. Please try again.' : err.message)} finally {setBusy(false)}
  }
  async function save() {
    if(!selected) return
    const activity = {id:crypto.randomUUID(),topic:selected.topic,aid:selected.aid || '',lesson:selected,approved:true}
    if(await update({...data,activities:[...data.activities,activity]})) {setDraft(false);setNotice('Added to Julian’s learning library.')}
  }
  function complete() {setFinished(true)}
  function remix() {if(selected.origin === 'sample') playSample();else generate(selected.topic,selected.aid)}
  return <>
    <SectionHeading eyebrow="DISCOVERY LAB / NEW PERSPECTIVES" title="Learning time"><span className="badge"><Icon name="spark" size={16}/> Bubbi AI · Learning lab</span></SectionHeading>
    <section className="tutor-welcome"><span aria-hidden="true">🦑</span><div><h2>{parent ? 'A topic becomes a whole adventure.' : 'Learn it. Test it. Master it.'}</h2><p>{parent ? 'Bubbi researches the topic, teaches the big idea, and creates a new kind of game each time. Preview it here before sharing with Julian.' : 'Pick an adventure. Sort it, connect it, build its story, or solve a mystery. There’s more than one way to learn!'}</p></div></section>
    {parent && <section className="card tutor-create"><form onSubmit={event => {event.preventDefault();const form=new FormData(event.currentTarget);generate(String(form.get('topic')).trim(),String(form.get('aid')).trim())}}><Field label="What concept or theme should Bubbi teach?" name="topic" placeholder="Fractions, the water cycle, ocean animals…" required maxLength={100}/><label className="field">Optional learning aid<textarea name="aid" placeholder="Add teaching notes or a concept to focus on. Use lesson content only; don’t include personal details." maxLength={3000} rows={3}/></label><button className="primary" disabled={busy || configured === false}>{busy ? '🔎 Creating your adventure…' : '✨ Find a new way to learn'}</button></form>{configured === false && <p className="notice">AI is not connected yet. Set OPENAI_API_KEY in the server’s .env to create activities for any topic. Sample ocean adventures work now.</p>}</section>}
    <div className="tutor-library"><button className="tutor-topic sample-topic" onClick={playSample} disabled={busy}><span aria-hidden="true">🐙</span><strong>Ocean animals<small>Try a sample adventure</small></strong><Icon name="arrow"/></button>{library.map(activity => <button key={activity.id} className="tutor-topic" disabled={busy} onClick={() => {setSelected(activity.lesson);setDraft(false);setFinished(false);setError('');setNotice('');remember(activity.lesson)}}><span aria-hidden="true">{gameEmoji[activity.lesson.kind]}</span><strong>{activity.topic}<small>{gameLabels[activity.lesson.kind]}</small></strong><Icon name="arrow"/></button>)}</div>
    <div className="tutor-variety" aria-label="Four ways to learn">{gameKinds.map(kind => <span className={selected?.kind === kind ? 'active' : ''} key={kind}>{gameEmoji[kind]} {gameLabels[kind]}</span>)}</div>
    {busy && <div className="tutor-loading" role="status"><span aria-hidden="true">🔎</span><p>Finding the big idea. Building a fresh adventure…</p></div>}
    {notice && !busy && <p className="form-message" role="status">{notice}</p>}{error && <p className="notice warning" role="alert">{error}</p>}
    {selected ? <><LessonPlayer key={selected.id} lesson={selected} onComplete={complete} onRemix={remix} busy={busy}/><div className="tutor-parent-actions">{parent && draft && <button className="primary" disabled={busy} onClick={save}>✓ Approve & add to Julian’s library</button>}{!finished && <button className="secondary" disabled={busy} onClick={remix}>🎲 Try this topic another way</button>}</div></> : <section className="card tutor-start"><span aria-hidden="true">🧩</span><h2>One idea. A new adventure every time.</h2><p>{parent ? 'Start with a topic above, or try the ocean sample to explore all four game types.' : library.length ? 'Choose one of your adventures above!' : 'Try the ocean adventure! Mom or Dad can add more topics to your library.'}</p><button className="primary" onClick={playSample}>Explore ocean animals</button></section>}
    {parent && data.activities.some(activity => !activity.lesson) && <p className="muted">Your earlier learning notes are still saved. Enter their topic and notes above to create a new concept-based activity.</p>}
  </>
}
