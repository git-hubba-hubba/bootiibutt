import CalendarMonth from '../components/CalendarMonth'
import { useState } from 'react'
import { Field, SectionHeading, Empty } from '../components/UI'
import { conflicts } from '../data/initial'
export default function Calendar({ data, update, role }) {
 const [message, setMessage] = useState('')
 const overlaps = conflicts(data.events)
 async function add(e) {
  e.preventDefault(); const form = new FormData(e.currentTarget); const event = Object.fromEntries(form)
  if (event.end <= event.start) { setMessage('End time must be after the start.'); return }
  const next = { ...event, id: crypto.randomUUID(), owner: role }
  if (await update({ ...data, events: [...data.events, next].sort((a,b) => a.start.localeCompare(b.start)) })) { e.target.reset(); setMessage(conflicts([...data.events,next]).length ? 'Plan added. Overlapping plans need your attention.' : 'Your family plan is saved.') }
 }
 function exportCalendar() {
  const stamp = value => new Date(value).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'
  const escape = value => String(value).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Bubbi Cafe//Family//EN',...data.events.flatMap(event => ['BEGIN:VEVENT',`UID:${event.id}@bubbi-cafe`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(event.start)}`,`DTEND:${stamp(event.end)}`,`SUMMARY:${escape(event.title)}`,`LOCATION:${escape(event.location)}`,'END:VEVENT']),'END:VCALENDAR']
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type:'text/calendar' })); const link = document.createElement('a'); link.href = url; link.download = 'family-calendar.ics'; link.click(); URL.revokeObjectURL(url)
 }
 return <><SectionHeading eyebrow="SAME TEAM. SHARED PLANS." title="The family calendar"><button className="secondary" onClick={exportCalendar}>Export calendar</button></SectionHeading><p className="notice">Mom and Dad share this calendar automatically in connected mode. Export to your calendar app; automatic Google / Apple calendar sync is not connected.</p>{overlaps.length > 0 && <div role="alert" className="notice warning">Schedule conflict: {overlaps.map(e => e.title).join(' & ')}. These plans overlap.</div>}<CalendarMonth events={data.events}/><div className="detail-columns"><section className="card"><h2>Make a little plan</h2><form onSubmit={add}><Field label="What’s happening?" name="title" required maxLength={120}/><div className="form-row"><Field label="Starts" name="start" type="datetime-local" required/><Field label="Ends" name="end" type="datetime-local" required/></div><Field label="Location" name="location" maxLength={200}/><label className="field">Type<select name="type"><option>Family time</option><option>Health</option><option>School</option><option>Pickup</option></select></label><button className="primary">Add family plan</button><p role="status" className="form-message">{message}</p></form></section><section className="card"><h2>Our plans</h2>{!data.events.length && <Empty title="Room for something lovely">Add your first plan.</Empty>}{data.events.map(event => <article className={'list-item '+(overlaps.some(e => e.id === event.id) ? 'conflict' : '')} key={event.id}><span className="event-type">{event.type} · {event.owner}</span><h3>{event.title}</h3><p>{new Date(event.start).toLocaleString()} – {new Date(event.end).toLocaleTimeString()}</p><p>{event.location}</p><button className="text-button" onClick={() => update({ ...data, events: data.events.filter(e => e.id !== event.id) })}>Remove plan</button></article>)}</section></div></>
}
