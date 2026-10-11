import Icon from './Icon'
const primary = [
  ['Adventure map', 'home', 'Explore'],
  ['Learning time', 'book', 'Learn'],
  ['Play & discover', 'game', 'Arcade'],
]
const more = [
  ['Squid & octopus', 'video', 'Ocean'],
  ['Shows', 'video', 'Shows'],
  ['Family gallery', 'photo', 'Memories'],
]
export default function ChildNav({ page, setPage, setRole }) {
  function link([target, icon, label]) {
    return <button key={target} className={page === target ? 'selected' : ''} aria-current={page === target ? 'page' : undefined} onClick={event => {setPage(target); const group = event.currentTarget.closest('details'); if (group) group.open = false}}><Icon name={icon}/><span>{label}</span></button>
  }
  const moreActive = more.find(([target]) => target === page)
  return <header className="explorer-header managed-child-nav">
    <button className="explorer-logo" onClick={() => setPage('Adventure map')}><span aria-hidden="true">🦑</span><span>Bubbi Cafe<small>JULIAN’S SPACE</small></span></button>
    <label className="space-picker">Family space<select value="Julian" onChange={event => {const role = event.target.value;setRole(role);setPage(role === 'Julian' ? 'Adventure map' : 'Overview')}}>{['Mom', 'Dad', 'Julian'].map(role => <option key={role}>{role}</option>)}</select></label>
    <nav aria-label="Julian’s adventures">
      {primary.map(link)}
      <details className="child-more" key={page}><summary className={moreActive ? 'selected' : ''}>{moreActive ? moreActive[2] : 'More'}<span aria-hidden="true">⌄</span></summary><div>{more.map(link)}</div></details>
    </nav>
  </header>
}
