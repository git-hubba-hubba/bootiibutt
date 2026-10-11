import { useState } from 'react'
import Icon from '../components/Icon'
import FamilyMoments from '../components/FamilyMoments'
import { conflicts, money } from '../data/initial'
export default function Overview({ data, update, role, setPage }) {
  const [conversation,setConversation] = useState('moment')
  const [index,setIndex] = useState(0)
  const entries = conversation === 'moment' ? data.events : data.items
  const entry = entries.length ? entries[index % entries.length] : null
  const overlaps = conflicts(data.events)
  async function vote() {
    if(!entry) return
    const votes = entry.votes.includes(role) ? entry.votes.filter(parent => parent !== role) : [...entry.votes,role]
    await update({...data,items:data.items.map(item => item.id === entry.id ? {...item,votes} : item)})
  }
  return <>
    <FamilyMoments data={data} update={update} role={role} setPage={setPage}/>
    <section className="family-conversation">
      <div className="conversation-tabs" role="group" aria-label="Choose a family conversation"><button aria-pressed={conversation === 'moment'} className={conversation === 'moment'?'selected':''} onClick={() => {setConversation('moment');setIndex(0)}}><Icon name="calendar"/>Our next moments</button><button aria-pressed={conversation === 'wish'} className={conversation === 'wish'?'selected':''} onClick={() => {setConversation('wish');setIndex(0)}}><Icon name="heart"/>Little wishes</button></div>
      <div className="conversation-content">
        <div className="conversation-symbol" aria-hidden="true">{conversation === 'moment' ? '☀' : '♡'}</div>
        {entry ? <div className="conversation-story" key={entry.id}><p className="eyebrow">{conversation === 'moment' ? `${entry.owner} MADE A LITTLE PLAN` : 'SOMETHING TO DECIDE TOGETHER'}</p><h2>{entry.title || entry.name}</h2>{conversation === 'moment' ? <><p>{new Date(entry.start).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · {new Date(entry.start).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}{entry.location ? ` · ${entry.location}` : ''}</p>{overlaps.some(event => event.id === entry.id) && <p className="notice warning" role="status">This overlaps another plan. Check the calendar together.</p>}<button className="text-button" onClick={() => setPage('Family calendar')}>Make room for this moment <Icon name="arrow" size={16}/></button></> : <><p>{money(entry.cost)} · {entry.votes.length === 2 ? 'You both said yes!' : `${entry.votes.length} of 2 parents have said yes`}</p><div className="conversation-vote"><button className="primary" onClick={vote}>{entry.votes.includes(role) ? '✓ You said yes · undo' : '♡ I love this idea'}</button><button className="text-button" onClick={() => setPage('Shared budget')}>Plan our contributions <Icon name="arrow" size={16}/></button></div></>}</div> : <div className="conversation-story"><h2>{conversation === 'moment' ? 'What shall we do together?' : 'What’s Julian dreaming of?'}</h2><p>Use the family actions above to start something lovely.</p></div>}
        {entries.length > 1 && <div className="conversation-paging"><button className="secondary" aria-label="Previous family story" onClick={() => setIndex(current => (current-1+entries.length)%entries.length)}>←</button><span>{index%entries.length+1} of {entries.length}</span><button className="secondary" aria-label="Next family story" onClick={() => setIndex(current => (current+1)%entries.length)}>→</button></div>}
      </div>
    </section>
    <button className="family-play-invite" onClick={() => setPage('Adventure map')}><span aria-hidden="true">🪐</span><div><p className="eyebrow">COME SEE WHAT HE’S DISCOVERING</p><h2>Step into Julian’s world</h2><p>A treehouse, an arcade, and a lagoon full of sea friends.</p></div><Icon name="arrow" size={25}/></button>
    <footer className="main-footer"><span>A shared life, made of little moments.</span><span>Bubbi Cafe ♡</span></footer>
  </>
}
