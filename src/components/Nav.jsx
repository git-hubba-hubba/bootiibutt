import Icon from './Icon'
import ChildNav from './ChildNav'
const familyLinks = [
  ['Overview', 'home', 'Family home'],
  ['Family calendar', 'calendar', 'Family calendar'],
  ['Shared budget', 'wallet', 'Shared budget'],
  ['Vital information', 'heart', 'Vital information'],
  ['Family gallery', 'photo', 'Family gallery'],
  ['Documents', 'file', 'Documents'],
]
const childLinks = [
  ['Adventure map', 'spark', 'Explore his world'],
  ['Learning time', 'book', 'Learning time'],
  ['Play & discover', 'game', 'Bubbi’s arcade'],
  ['Squid & octopus', 'video', 'Squid & octopus'],
  ['Shows', 'video', 'Shows'],
]
export default function Nav({ page, setPage, role, setRole }) {
  const parentMode = role === 'Mom' || role === 'Dad'
  if (!parentMode) return <ChildNav page={page} setPage={setPage} setRole={setRole}/>
  function renderLink([target, icon, label]) {
    return <button key={target} className={page === target ? 'active' : ''} data-nav={icon} aria-current={page === target ? 'page' : undefined} onClick={() => setPage(target)}><Icon name={icon}/>{label}{page === target && <span className="active-dot"/>}</button>
  }
  return <aside className="sidebar">
    <a className="brand" href="#" onClick={event => {event.preventDefault();setPage('Overview')}}><span className="brand-icon">✳</span>Bubbi Cafe<span className="brand-dot">.</span></a>
    <p className="brand-sub">Your family, thoughtfully connected.</p>
    <div className="family-label">OUR FAMILY SPACE</div>
    <div className="family-switch" role="group" aria-label="Choose a family space">{['Mom','Dad','Julian'].map((name,i) => <button key={name} className={role === name ? 'selected' : ''} aria-pressed={role === name} onClick={() => {setRole(name);setPage(name === 'Julian' ? 'Adventure map' : 'Overview')}}><span className={'avatar avatar-'+i}>{name[0]}</span>{name}</button>)}</div>
    <div className="nav-label">OUR LIFE TOGETHER</div>
    <nav aria-label="Family pages">{familyLinks.map(renderLink)}</nav>
    <div className="nav-label">JULIAN’S LITTLE WORLD</div>
    <nav aria-label="Julian’s adventures">{childLinks.map(renderLink)}</nav>
    <div className="sidebar-note"><span>🌱</span><strong>Growing together</strong><p>Little moments today.<br/>Beautiful memories tomorrow.</p></div>
    <div className="sidebar-footer"><span className={'avatar avatar-'+(role === 'Mom' ? 0 : 1)}>{role[0]}</span><div><strong>{role}’s space</strong><small>Our little family</small></div><Icon name="heart" size={17}/></div>
  </aside>
}
