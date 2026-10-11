import { useEffect, useRef, useState } from 'react'
import { Field } from './UI'
import Icon from './Icon'
import { insuranceFields } from '../data/vitalFields'

export default function VitalEditor({ editor, onSave, onClose }) {
  const dialog = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { kind, value } = editor
  const title = kind === 'field' ? `Edit ${editor.field.label.toLowerCase()}` : kind === 'contact' ? `Edit ${editor.parent}’s contact ${editor.index+1}` : `Edit ${value.coveredPerson}’s ${value.category.toLowerCase()} card`
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    element.showModal()
    element.querySelector('input, textarea')?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus() }
  }, [])
  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    let patch
    if(kind === 'field') patch = form.get('value')
    else if(kind === 'contact') patch = Object.fromEntries(['name','phone','email'].map(key => [key,form.get(key).trim()]))
    else patch = {
      ...value,
      ...Object.fromEntries(insuranceFields.map(([key]) => [key,form.get(key).trim()])),
      notes: form.get('notes').trim(), claimsAddress: form.get('claimsAddress').trim(),
      services: (value.services || []).map((service,index) => ({...service,label:form.get(`service-${index}-label`).trim(),value:form.get(`service-${index}-value`).trim()})),
      costs: (value.costs || []).map((cost,index) => ({...cost,...Object.fromEntries(['label','inNetwork','outOfNetwork'].map(key => [key,form.get(`cost-${index}-${key}`).trim()]))})),
    }
    setBusy(true); setError('')
    try { if(await onSave(patch)) onClose(); else setError('Your changes could not be saved. Please review the latest information and try again.') }
    catch { setError('Unable to save. Please try again.') }
    finally { setBusy(false) }
  }
  return <dialog ref={dialog} className="vital-editor" aria-labelledby="vital-editor-title" onCancel={event => {event.preventDefault();if(!busy) onClose()}} onClick={event => {if(event.target === event.currentTarget && !busy) onClose()}}>
    <div className="vital-editor-content"><header><h2 id="vital-editor-title">{title}</h2><button type="button" className="icon-button" aria-label="Cancel editing" disabled={busy} onClick={onClose}><Icon name="close"/></button></header>
      <form onSubmit={submit}><fieldset disabled={busy}>
        {kind === 'field' && (editor.field.type === 'date' ? <Field label={editor.field.label} name="value" type="date" defaultValue={value || ''}/> : <label className="field">{editor.field.label}<textarea name="value" rows={6} maxLength={3000} defaultValue={value || ''}/></label>)}
        {kind === 'contact' && <>{['name','phone','email'].map(key => <Field key={key} label={key[0].toUpperCase()+key.slice(1)} name={key} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} maxLength={200} defaultValue={value[key] || ''}/>)}</>}
        {kind === 'insurance' && <><p className="vital-editor-note">Edit this record’s details. The original source card stays unchanged.</p><div className="vital-editor-fields">{insuranceFields.map(([key,label,type]) => <Field key={key} label={label} name={key} type={type || 'text'} required={['carrier','category','coveredPerson','memberId'].includes(key)} maxLength={200} defaultValue={value[key] || ''}/>)}</div><details className="vital-editor-extra"><summary>Plan contacts &amp; benefits</summary>{(value.services || []).map((service,index) => <div className="vital-editor-fields" key={index}><Field label="Contact / service" name={`service-${index}-label`} defaultValue={service.label} maxLength={200}/><Field label={service.kind === 'phone' ? 'Phone' : 'Website / details'} name={`service-${index}-value`} type={service.kind === 'phone' ? 'tel' : service.kind === 'website' ? 'url' : 'text'} defaultValue={service.value} maxLength={500}/></div>)}{(value.costs || []).map((cost,index) => <div className="vital-editor-benefit" key={index}>{[['label','Benefit'],['inNetwork','In network'],['outOfNetwork','Out of network']].map(([key,label]) => <Field key={key} label={label} name={`cost-${index}-${key}`} defaultValue={cost[key]} maxLength={200}/>)}</div>)}</details><label className="field">Claims address<textarea name="claimsAddress" rows={3} maxLength={1000} defaultValue={value.claimsAddress || ''}/></label><label className="field">Coverage notes<textarea name="notes" rows={4} maxLength={3000} defaultValue={value.notes || ''}/></label></>}
      </fieldset>{error && <p className="notice warning" role="alert">{error}</p>}<footer><button type="button" className="vital-edit" disabled={busy} onClick={onClose}>Cancel</button><button className="primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></footer></form>
    </div>
  </dialog>
}
