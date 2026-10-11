import Icon from './Icon'
export default function VitalSummaryCard({ field, value, onEdit }) {
  const shown = value && field.type === 'date' ? new Date(`${value}T12:00:00`).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : value
  return <article className={`card vital-summary-card${value ? '' : ' vital-unfilled'}`}>
    <header><span className="vital-section-icon"><Icon name={field.icon}/></span><h3>{field.label}</h3><button type="button" className="vital-edit" onClick={onEdit} aria-label={`Edit ${field.label.toLowerCase()}`}>Edit</button></header>
    <p className={value ? 'vital-summary-value' : 'vital-placeholder'}>{shown || 'Not added yet'}</p>
  </article>
}
