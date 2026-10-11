import Icon from './Icon'
const destinations = [
  ['Adventure map', 'home', 'Base camp'],
  ['Learning time', 'book', 'Discover'],
  ['Play & discover', 'game', 'Arcade'],
  ['Squid & octopus', 'video', 'Ocean'],
  ['Shows', 'video', 'Shows'],
  ['Family gallery', 'photo', 'Memories'],
]
export default function ChildNav({ page, setPage, setRole }) {
  return <header className="explorer-header">
    <button className="explorer-logo" onClick={() => setPage('Adventure map')}><span aria-hidden="true">🦑</span><span>Bubbi Cafe<small>JULIAN · EXPLORE / BUILD / PLAY</small></span></button>
    <nav aria-label="Julian’s adventures">{destinations.map(([target, icon, label]) => <button key={target} className={page === target ? 'selected' : ''} aria-current={page === target ? 'page' : undefined} onClick={() => setPage(target)}><Icon name={icon}/><span>{label}</span></button>)}</nav>
    <div className="explorer-family" role="group" aria-label="Choose a family space">{['Mom','Dad','Julian'].map((role,i) => <button key={role} className={role === 'Julian' ? 'selected' : ''} aria-pressed={role === 'Julian'} onClick={() => {setRole(role);setPage(role === 'Julian' ? 'Adventure map' : 'Overview')}}><span className={'avatar avatar-'+i}>{role[0]}</span><span>{role}</span></button>)}</div>
  </header>
}
