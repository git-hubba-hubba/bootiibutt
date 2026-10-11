import { useState } from 'react'

const details = [
  ['coveredPerson', 'Cardholder'], ['relationship', 'Relationship'], ['subscriber', 'Subscriber'],
  ['groupNumber', 'Group number'], ['plan', 'Plan'], ['network', 'Network'],
  ['effectiveDate', 'Coverage effective date'], ['asOfDate', 'Card as of'], ['dentalOffice', 'Dental office on card'],
]
const displayDate = value => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
export default function InsuranceCard({ record, compact = false, onEdit }) {
  const [reveal, setReveal] = useState(false)
  const extended = <>
    {record.services?.length > 0 && <div className="insurance-services"><h4>Plan contacts</h4>{record.services.map(service => <div key={service.label}><span>{service.label}</span>{service.kind === 'phone' ? <a href={`tel:${service.value.replace(/[^+\d]/g, '')}`}>{service.value}</a> : service.kind === 'website' && /^https:\/\//.test(service.value) ? <a href={service.value} target="_blank" rel="noopener noreferrer">{service.value.replace('https://','')} ↗</a> : <span>{service.value}</span>}</div>)}</div>}
    {record.costs?.length > 0 && <div className="insurance-costs"><table><caption>Cost information printed on the card</caption><thead><tr><th scope="col">Benefit</th><th scope="col">In network</th><th scope="col">Out of network</th></tr></thead><tbody>{record.costs.map(cost => <tr key={cost.label}><th scope="row">{cost.label}</th><td>{cost.inNetwork}</td><td>{cost.outOfNetwork}</td></tr>)}</tbody></table></div>}
    {record.claimsAddress && <div className="insurance-claims"><h4>Send dental claims to</h4><p>{record.claimsAddress}</p></div>}
    {record.notes && <p className="insurance-notes">{record.notes}</p>}
    {/^\/api\/vital-cards\/[a-z-]+\.(pdf|png)$/.test(record.sourceUrl || '') && <a className="insurance-source" href={record.sourceUrl} target="_blank" rel="noopener noreferrer">View source card · {record.sourceName} ↗</a>}
  </>
  return <article className="card insurance-card">
    <div className="insurance-card-heading"><div><p className="eyebrow">{record.category} · {record.relationship}</p><h3>{record.carrier}</h3></div><div className="insurance-heading-actions"><span className="insurance-person">{record.coveredPerson}</span>{onEdit && <button type="button" className="vital-edit" onClick={onEdit} aria-label={`Edit ${record.coveredPerson} ${record.category.toLowerCase()} insurance`}>Edit</button>}</div></div>
    <dl className="insurance-details">
      <div><dt>Member / identification number</dt><dd><span>{reveal ? record.memberId : `•••• ${record.memberId.slice(-4)}`}</span><button type="button" onClick={() => setReveal(!reveal)} aria-pressed={reveal} aria-label={`${reveal ? 'Hide' : 'Show'} member number for ${record.coveredPerson}, ${record.category}`}>{reveal ? 'Hide' : 'Show'}</button></dd></div>
      {details.filter(([key]) => record[key]).map(([key,label]) => <div key={key}><dt>{label}</dt><dd>{key.endsWith('Date') ? displayDate(record[key]) : record[key]}</dd></div>)}
    </dl>
    {compact ? <details className="insurance-more"><summary>Plan contacts, benefits &amp; source card</summary>{extended}</details> : extended}
  </article>
}
