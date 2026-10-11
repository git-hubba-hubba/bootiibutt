import { useState } from 'react'
import Icon from './Icon'
import ChildNav from './ChildNav'
const groups = [
  { title: 'Family essentials', links: [
    ['Family calendar', 'calendar', 'Calendar'],
    ['Shared budget', 'wallet', 'Budget'],
    ['Vital information', 'heart', 'Vital info'],
  ] },
  { title: 'Photos & files', links: [
    ['Family gallery', 'photo', 'Gallery'],
    ['Documents', 'file', 'Documents'],
  ] },
  { title: 'Julian’s activities', links: [
    ['Adventure map', 'spark', 'Explore'],
    ['Learning time', 'book', 'Learning'],
    ['Play & discover', 'game', 'Arcade'],
    ['Squid & octopus', 'video', 'Ocean'],
    ['Shows', 'video', 'Shows'],
  ] },
]
export default function Nav({ page, setPage, role, setRole }) {
  const [menuOpen, setMenuOpen] = useState(false)
  if (role === 'Julian') return <ChildNav page={page} setPage={setPage} setRole={setRole}/>
  function navigate(target) { setPage(target); setMenuOpen(false) }
  function renderLink([target, icon, label]) {
    return <button key={target} className={page === target ? 'active' : ''} aria-current={page === target ? 'page' : undefined} onClick={() => navigate(target)}><Icon name={icon}/><span>{label}</span></button>
  }
  return <aside className="sidebar managed-sidebar">
    <div className="nav-brand-row"><a className="brand" href="#" onClick={event => {event.preventDefault();navigate('Overview')}}><span className="brand-icon">✳</span>Bubbi Cafe<span className="brand-dot">.</span></a><button className="nav-menu-toggle" aria-expanded={menuOpen} aria-controls="family-navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? 'Close' : 'Menu'}<span aria-hidden="true">{menuOpen ? '×' : '☰'}</span></button></div>
    <label className="space-picker">Family space<select value={role} onChange={event => {const name = event.target.value;setRole(name);navigate(name === 'Julian' ? 'Adventure map' : 'Overview')}}>{['Mom', 'Dad', 'Julian'].map(name => <option key={name}>{name}</option>)}</select></label>
    <div className="nav-current-page">{page === 'Overview' ? 'Family home' : page}</div>
    <nav id="family-navigation" className={menuOpen ? 'managed-navigation is-open' : 'managed-navigation'} aria-label="Family navigation">
      {renderLink(['Overview', 'home', 'Home'])}
      {groups.map(group => <details key={`${group.title}-${page}`} className="nav-group" open={group.links.some(([target]) => target === page) || (page === 'Overview' && group.title === 'Family essentials')}><summary>{group.title}<span aria-hidden="true">⌄</span></summary><div>{group.links.map(renderLink)}</div></details>)}
    </nav>
  </aside>
}
