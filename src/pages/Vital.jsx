import { useState } from 'react'
import { SectionHeading } from '../components/UI'
import InsuranceCard from '../components/InsuranceCard'
import VitalSummaryCard from '../components/VitalSummaryCard'
import TrustedContacts from '../components/TrustedContacts'
import VitalEditor from '../components/VitalEditor'
import { vitalFields } from '../data/vitalFields'
import './Vital.css'

export default function Vital({ data, update, status }) {
  const [editor, setEditor] = useState(null)
  const [message, setMessage] = useState('')
  const vital = data.vital
  function edit(next) { setMessage(''); setEditor(next) }
  async function save(patch) {
    const next = { ...vital }
    if(editor.kind === 'field') next[editor.field.key] = patch
    else if(editor.kind === 'contact') {
      next.contacts = {...vital.contacts, [editor.parent]:[0,1,2].map(index => index === editor.index ? patch : vital.contacts?.[editor.parent]?.[index] || {name:'',phone:'',email:''})}
    } else next.insurance = vital.insurance.map(record => record.id === editor.value.id ? patch : record)
    if(!await update({...data,vital:next})) return false
    setMessage(status === 'MongoDB connected' ? 'Changes saved.' : 'Changes updated for this session. MongoDB is not connected.')
    return true
  }
  return <div className="vital-dashboard">
    <SectionHeading eyebrow="CARE STARTS WITH KNOWING" title="Julian’s vital information"><span className="vital-dashboard-label">CARE AT A GLANCE</span></SectionHeading>
    <p className="vital-dashboard-intro">The details that help you care for Julian, together. Edit any section when something changes.</p>
    <p className="vital-save-message" role="status">{message}</p>
    <section aria-labelledby="vital-essentials-title"><h2 className="vital-group-title" id="vital-essentials-title">Everyday essentials</h2><div className="vital-summary-grid">{vitalFields.slice(0,5).map(field => <VitalSummaryCard key={field.key} field={field} value={vital[field.key]} onEdit={() => edit({kind:'field',field,value:vital[field.key]})}/>)}</div></section>
    <section aria-labelledby="vital-care-title"><h2 className="vital-group-title" id="vital-care-title">Providers &amp; care</h2><div className="vital-summary-grid vital-providers-grid">{vitalFields.slice(5).map(field => <VitalSummaryCard key={field.key} field={field} value={vital[field.key]} onEdit={() => edit({kind:'field',field,value:vital[field.key]})}/>)}</div></section>
    <section aria-labelledby="vital-contacts-title"><h2 className="vital-group-title" id="vital-contacts-title">People to call</h2><div className="detail-columns">{['Mom','Dad'].map(parent => <TrustedContacts key={parent} parent={parent} contacts={vital.contacts?.[parent]} onEdit={index => edit({kind:'contact',parent,index,value:vital.contacts?.[parent]?.[index] || {}})}/>)}</div></section>
    <section className="insurance-section" aria-labelledby="insurance-heading"><h2 className="vital-group-title" id="insurance-heading">Insurance &amp; coverage cards</h2><p className="muted">Cardholders and dependent relationships are listed as shown on each card. Expand a card for contacts, benefits, and the original document.</p>{vital.insurance?.length ? <div className="insurance-grid">{vital.insurance.map(record => <InsuranceCard key={record.id} record={record} compact onEdit={() => edit({kind:'insurance',value:record})}/>)}</div> : <div className="card vital-insurance-empty">No insurance cards have been added yet.</div>}</section>
    {editor && <VitalEditor editor={editor} onSave={save} onClose={() => setEditor(null)}/>}
  </div>
}
