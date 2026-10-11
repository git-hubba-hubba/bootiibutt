export const initial = {
  events: [
    { id: 'e1', title: 'A little adventure outside', type: 'Family time', owner: 'Mom', start: '2026-10-12T16:00', end: '2026-10-12T17:00', location: 'Neighborhood park' },
    { id: 'e2', title: 'Dental checkup', type: 'Health', owner: 'Dad', start: '2026-10-13T10:00', end: '2026-10-13T11:00', location: 'Family dental clinic' },
  ],
  items: [{ id: 'b1', name: 'A new bike for new adventures', cost: 180, votes: ['Mom'], commitments: { Mom: 60, Dad: 40 } }, { id: 'b2', name: 'Art supplies & a little imagination', cost: 45, votes: ['Mom', 'Dad'], commitments: { Mom: 25, Dad: 0 } }],
  vital: { birthday: '', allergies: '', diet: '', health: '', behavioral: '', medical: '', dental: '', vision: '', insurance: [], insuranceImports: [], contacts: { Mom: [{ name: '', phone: '', email: '' }, { name: '', phone: '', email: '' }, { name: '', phone: '', email: '' }], Dad: [{ name: '', phone: '', email: '' }, { name: '', phone: '', email: '' }, { name: '', phone: '', email: '' }] } },
  photos: [], documents: [], activities: [],
}
export const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
export function conflicts(events) { return events.filter((event, i) => events.some((other, j) => i !== j && event.start < other.end && other.start < event.end)) }
