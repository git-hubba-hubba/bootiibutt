import { useState } from 'react'
import { Field, Modal } from './UI'
import Icon from './Icon'
import './FamilyMoments.css'
export default function FamilyMoments({ data, update, role, setPage }) {
  const [photoIndex,setPhotoIndex] = useState(0)
  const [mode,setMode] = useState(null)
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)
  const photo = data.photos.length ? data.photos[photoIndex % data.photos.length] : null
  async function save(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    let next
    if(mode === 'plan') {
      const plan = Object.fromEntries(form)
      if(plan.end <= plan.start) {setMessage('Choose an end time after the start.');return}
      next = { ...data, events:[...data.events,{...plan,id:crypto.randomUUID(),owner:role,type:'Family time'}].sort((a,b) => a.start.localeCompare(b.start)) }
    } else next = { ...data, items:[...data.items,{id:crypto.randomUUID(),name:form.get('name'),cost:Number(form.get('cost')),votes:[role],commitments:{Mom:0,Dad:0}}] }
    setBusy(true)
    try {if(await update(next)) {setMode(null);setMessage(mode === 'plan' ? 'A new moment to look forward to. Your plan is shared.' : 'Your wish is shared. The other parent can vote on it.')} else setMessage('We couldn’t save that yet. Please try again.')} finally {setBusy(false)}
  }
  return <>
    <section className="family-moments"><div className="family-moments-copy"><p className="eyebrow">THIS IS WHAT IT’S ALL FOR</p><h1>More time for<br/>the good stuff.</h1><p>The little outings. The big belly laughs.<br/>The everyday magic of being a family.</p><div className="moment-actions"><button onClick={() => {setMode('plan');setMessage('')}}><Icon name="calendar"/><span>Plan a moment<small>Give us something to look forward to</small></span><Icon name="arrow" size={17}/></button><button onClick={() => {setMode('wish');setMessage('')}}><Icon name="heart"/><span>Dream up a little wish<small>Choose Julian’s next adventure together</small></span><Icon name="arrow" size={17}/></button><button onClick={() => setPage('Family gallery')}><Icon name="photo"/><span>Keep a memory<small>Add a photo to our family story</small></span><Icon name="arrow" size={17}/></button></div></div>
      <div className={'family-memory-scene '+(photo?'has-photo':'')}>
        {photo ? <button className="family-featured-photo" onClick={() => setPage('Family gallery')} aria-label={`Open family gallery: ${photo.name}`}><img src={photo.url} alt={photo.name}/></button> : <div className="family-garden" aria-label="An illustrated family garden"><span className="garden-sun" aria-hidden="true">☀</span><span className="garden-cloud" aria-hidden="true">☁</span><div className="garden-hill hill-a"/><div className="garden-hill hill-b"/><button className="garden-house" onClick={() => {setMode('plan');setMessage('')}} aria-label="Plan a family moment"><span aria-hidden="true">🏡</span><small>Let’s make a day of it</small></button><button className="garden-camera" onClick={() => setPage('Family gallery')} aria-label="Add a family photo"><span aria-hidden="true">📷</span><small>Save our story</small></button><span className="garden-flower" aria-hidden="true">🌼</span><span className="garden-tree" aria-hidden="true">🌳</span></div>}
        <div className="family-memory-caption"><div><small>OUR FAMILY STORY</small><strong>{photo ? photo.name : 'The best moments start with us.'}</strong></div>{data.photos.length > 1 && <div className="moment-photo-controls"><button aria-label="Previous memory" onClick={() => setPhotoIndex(current => (current-1+data.photos.length)%data.photos.length)}>←</button><span>{photoIndex%data.photos.length+1}/{data.photos.length}</span><button aria-label="Next memory" onClick={() => setPhotoIndex(current => (current+1)%data.photos.length)}>→</button></div>}</div>
      </div>
    </section>
    {message && !mode && <p className="form-message" role="status">{message}</p>}
    {mode && <Modal title={mode === 'plan' ? 'Let’s make a little plan' : 'A little wish for Julian'} close={() => setMode(null)}><form onSubmit={save}>{mode === 'plan' ? <><Field label="What shall we do?" name="title" placeholder="A picnic, a bike ride, a beach day…" maxLength={120} required/><div className="form-row"><Field label="Starts" name="start" type="datetime-local" required/><Field label="Ends" name="end" type="datetime-local" required/></div><Field label="Where?" name="location" maxLength={200}/></> : <><Field label="What are we dreaming of?" name="name" placeholder="A first bike, a telescope, art supplies…" maxLength={120} required/><Field label="What will it cost? ($)" name="cost" type="number" min="1" max="1000000" step="0.01" required/><p className="muted">Your vote is included. Once you both agree, you can each pledge funds in the shared budget.</p></>}<button className="primary" disabled={busy}>{busy?'Sharing…':'Share with our family'}</button><p className="form-message" role="status">{message}</p></form></Modal>}
  </>
}
