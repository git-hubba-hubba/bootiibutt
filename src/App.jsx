import { useState } from 'react'
import './App.css'
import './themes.css'
import Nav from './components/Nav'
import Icon from './components/Icon'
import Emergency from './components/Emergency'
import Overview from './pages/Overview'
import Calendar from './pages/Calendar'
import Budget from './pages/Budget'
import Vital from './pages/Vital'
import Files from './pages/Files'
import Learn from './pages/Learn'
import Games from './pages/Games'
import OceanVideos from './pages/OceanVideos'
import Shows from './pages/Shows'
import AdventureMap from './pages/AdventureMap'
import { useFamily } from './hooks/useFamily'
import './older-kid.css'
import './responsive.css'

function App() {
  const [role, setRole] = useState('Mom')
  const [page, setPage] = useState('Overview')
  const [foundStars, setFoundStars] = useState([])
  const [learningHistory, setLearningHistory] = useState([])
  const family = useFamily()
  const parentMode = role === 'Mom' || role === 'Dad'
  const childMode = !parentMode
  const props = { ...family, role, setPage }
  return <div className={'app-shell ' + (childMode ? 'child-mode' : 'parent-mode')} data-page={page}>
    <Nav page={page} setPage={setPage} role={role} setRole={setRole}/>
    <div className="main-shell">
      {parentMode && <header className="topbar"><div className="breadcrumb">Our family <span>/</span><strong>{page === 'Overview' ? 'Family home' : page}</strong></div><div className="header-actions"><span className="together"><span/>Better, together</span><Emergency role={role}/><span className={'avatar avatar-'+(role === 'Mom' ? 0 : 1)}>{role[0]}</span></div></header>}
      <main>
        <div className="greeting"><div><p className="eyebrow">{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }).toUpperCase()}</p><h2>{childMode ? 'Choose your next challenge.' : `Welcome home, ${role}.`}<span className="greeting-sun"><Icon name="sun" size={24}/></span></h2><p>{childMode ? 'Build skills. Explore deeper. Set a new best.' : 'Let’s make a little more time for each other.'}</p></div>{childMode ? <span className="child-welcome-art" aria-hidden="true">🚀<span>⭐</span><i>🪐</i></span> : <span className="connection-status" title={family.status}><span/>{family.status}</span>}</div>
        {family.error && <p role="alert" className="notice warning">{family.error}</p>}
        {page === 'Adventure map' && <AdventureMap setPage={setPage} stars={foundStars} setStars={setFoundStars}/>}
        {parentMode && page === 'Overview' && <Overview {...props}/>}
        {parentMode && page === 'Family calendar' && <Calendar {...props}/>}
        {parentMode && page === 'Shared budget' && <Budget {...props}/>}
        {parentMode && page === 'Vital information' && <Vital {...props}/>}
        {page === 'Family gallery' && <Files key="photos" {...props} kind="photos"/>}
        {parentMode && page === 'Documents' && <Files key="documents" {...props} kind="documents"/>}
        {page === 'Learning time' && <Learn {...props} learningHistory={learningHistory} setLearningHistory={setLearningHistory}/>}
        {page === 'Play & discover' && <Games/>}
        {page === 'Squid & octopus' && <OceanVideos/>}
        {page === 'Shows' && <Shows/>}
      </main>
    </div>
  </div>
}
export default App
