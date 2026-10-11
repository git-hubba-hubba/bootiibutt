import Icon from './Icon'
export function SectionHeading({ eyebrow, title, children }) { return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{children}</div> }
export function Empty({ icon = 'heart', title, children }) { return <div className="empty"><Icon name={icon} size={32}/><h3>{title}</h3><p>{children}</p></div> }
export function Modal({ title, children, close }) { return <div className="modal-backdrop" onClick={close}><section role="dialog" aria-modal="true" aria-label={title} className="modal" onClick={e => e.stopPropagation()}><div className="section-heading"><h2>{title}</h2><button className="icon-button" aria-label="Close" onClick={close}><Icon name="close"/></button></div>{children}</section></div> }
export function Field({ label, ...props }) { return <label className="field">{label}<input {...props}/></label> }
