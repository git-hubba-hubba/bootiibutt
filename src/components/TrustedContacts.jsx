export default function TrustedContacts({ parent, contacts = [], onEdit }) {
  return <section className="card vital-contacts"><header><div><p className="eyebrow">TRUSTED CONTACTS</p><h3>{parent}’s support circle</h3></div><span className="vital-contact-count">{contacts.filter(contact => contact?.name || contact?.phone || contact?.email).length} / 3 added</span></header>
    {[0,1,2].map(index => {
      const contact = contacts[index] || {}
      const populated = contact.name || contact.phone || contact.email
      return <article className="vital-contact-row" key={index}><span className="vital-contact-avatar" aria-hidden="true">{contact.name?.trim()[0]?.toUpperCase() || index + 1}</span><div><h4>{contact.name || `Contact ${index + 1}`}</h4>{!populated && <p>Not added yet</p>}{contact.phone && <a href={`tel:${contact.phone.replace(/[^+\d]/g,'')}`}>{contact.phone}</a>}{contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}</div><button type="button" className="vital-edit" onClick={() => onEdit(index)} aria-label={`Edit ${parent} contact ${index+1}${contact.name ? `, ${contact.name}` : ''}`}>Edit</button></article>
    })}
  </section>
}
