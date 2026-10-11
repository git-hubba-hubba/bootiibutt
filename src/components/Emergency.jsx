import { useState } from 'react'
import { Modal, Field } from './UI'
import Icon from './Icon'
export default function Emergency({ role }) {
 const [open,setOpen] = useState(false); const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false)
 async function send(e) { e.preventDefault(); setBusy(true); setMessage('Sending…'); try { const response = await fetch('/api/emergency', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role,message:new FormData(e.currentTarget).get('message')})}); const result = await response.json(); setMessage(result.message || 'Unable to send.'); } catch {setMessage('Emergency services are not connected. No alert was sent. Contact the other parent directly.')} finally {setBusy(false)} }
 return <><button className="emergency-button" onClick={() => setOpen(true)}><Icon name="shield" size={16}/> Emergency alert</button>{open && <Modal title="Alert your family" close={() => setOpen(false)}><p>This sends an urgent email and SMS to the configured parent contacts. Delivery depends on the providers.</p><form onSubmit={send}><Field label="What should the other parent know?" name="message" required maxLength={500} placeholder="Please call me about Julian immediately."/><button className="danger" disabled={busy}>{busy?'Sending…':'Send emergency alert'}</button><p className="notice" role="status">{message || 'This does not contact emergency responders.'}</p></form></Modal>}</>
}
