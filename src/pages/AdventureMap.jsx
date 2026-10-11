import { useRef, useState } from 'react'
import './AdventureMap.css'
import Icon from '../components/Icon'
const destinations = [
  { page:'Learning time', title:'Discovery lab', subtitle:'Learn a big idea in a new way', emoji:'🌳', icon:'book', className:'treehouse', sign:'LAUNCH LAB', color:'#8dc35a' },
  { page:'Play & discover', title:'Game zone', subtitle:'Pick a cabinet. Play your next adventure.', emoji:'🕹️', icon:'game', className:'rocket', sign:'ENTER ARCADE', color:'#b397eb' },
  { page:'Squid & octopus', title:'Ocean station', subtitle:'Build a habitat. Explore marine life.', emoji:'🐙', icon:'video', className:'lagoon', sign:'EXPLORE OCEAN', color:'#4bc6de' },
  { page:'Family gallery', title:'Photo archive', subtitle:'Your family’s photos and highlights.', emoji:'📸', icon:'photo', className:'meadow', sign:'OPEN ARCHIVE', color:'#f8b86a' },
]
const relics = [0, 1, 2, 3, 4]
const tips = ['Five relics are hidden across the destination cards. Find them all to complete the expedition.', 'Ocean station: build your aquarium and explore squid and octopus documentaries.', 'The arcade has 14 games! Build a city, race your car, or jump to a golden flag.', 'Discovery lab: take on an AI learning challenge and approach a concept from a new angle.']
export default function AdventureMap({ setPage, stars, setStars }) {
  const [tip,setTip] = useState(0)
  const [active, setActive] = useState(0)
  const track = useRef(null)
  const slides = useRef([])
  function goTo(index) {
    const next = (index + destinations.length) % destinations.length
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.current.scrollTo({left: slides.current[next].offsetLeft - slides.current[0].offsetLeft, behavior: reduced ? 'instant' : 'smooth'})
  }
  function syncSlide() {
    const container = track.current
    const distances = slides.current.map(slide => Math.abs(slide.offsetLeft - slides.current[0].offsetLeft - container.scrollLeft))
    setActive(distances.indexOf(Math.min(...distances)))
  }
  const [message,setMessage] = useState('Select a zone to enter. Your expedition starts here.')
  function collect(index) {setStars(current => current.includes(index) ? current : [...current,index]);setMessage(stars.length === 4 ? 'Expedition complete. All five relics recovered.' : 'Relic recovered. Keep exploring the destination cards.')}
  return <section className="adventure-world" aria-label="Interactive adventure carousel">
    <div className="adventure-intro"><div><p className="eyebrow">BUBBI CAFE / EXPEDITION 01</p><h1>Your next move, Julian.</h1><p>Swipe through your destinations. Choose a challenge. Make it your own.</p></div><div className="adventure-star-count" aria-label={`${stars.length} of 5 hidden relics found`}><span aria-hidden="true">◈</span><strong>{stars.length}<small> / 5</small></strong><span>Relics found</span></div></div>
    <div className="adventure-landscape">
      <svg className="adventure-scenery" viewBox="0 0 1100 670" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient id="adventure-sky" x2="0" y2="1"><stop stopColor="#17374b"/><stop offset="1" stopColor="#406077"/></linearGradient><linearGradient id="adventure-land" x2="0" y2="1"><stop stopColor="#527766"/><stop offset="1" stopColor="#314f46"/></linearGradient><linearGradient id="adventure-water" x2="0" y2="1"><stop stopColor="#237c92"/><stop offset="1" stopColor="#1c4965"/></linearGradient></defs>
        <rect width="1100" height="670" fill="url(#adventure-sky)"/>
        <circle cx="930" cy="92" r="44" fill="#c9ad79"/><circle cx="930" cy="92" r="60" fill="#d1b88c" opacity=".3"/>
        <g fill="#fff" opacity=".85"><ellipse cx="170" cy="84" rx="72" ry="19"/><circle cx="148" cy="66" r="25"/><circle cx="182" cy="59" r="32"/><ellipse cx="620" cy="77" rx="76" ry="19"/><circle cx="596" cy="60" r="27"/><circle cx="634" cy="54" r="33"/></g>
        <path d="M-40 330Q130 100 320 270Q510 102 710 275Q915 130 1140 300V670H-40Z" fill="#4b6a72"/>
        <path d="M-20 365Q170 208 370 336Q590 195 790 320Q970 245 1120 340V670H-20Z" fill="#3d6060"/>
        <path d="M-30 420Q190 240 450 374Q680 265 1130 390V700H-30Z" fill="url(#adventure-land)"/>
        <path d="M-20 536Q240 405 490 505T1120 535V700H-20Z" fill="#355b4a"/>
        <path d="M283 334C360 377 452 354 488 421S369 538 473 700" fill="none" stroke="#899580" strokeWidth="47" strokeLinecap="round"/>
        <path d="M283 334C360 377 452 354 488 421S369 538 473 700" fill="none" stroke="#a9ab8e" strokeWidth="32" strokeLinecap="round"/>
        <ellipse cx="814" cy="493" rx="226" ry="131" fill="#899482"/>
        <ellipse cx="814" cy="493" rx="208" ry="115" fill="url(#adventure-water)"/>
        <g fill="none" stroke="#83c1c8" strokeWidth="5" opacity=".65"><path d="M675 510q32 14 64 0m65 30q32 14 64 0m-30-122q32 14 64 0m-23 88q32 14 64 0"/></g>
        <g fill="#315649"><ellipse cx="129" cy="590" rx="110" ry="37"/><ellipse cx="323" cy="283" rx="72" ry="22"/><ellipse cx="873" cy="291" rx="90" ry="24"/></g>
        <g fill="#cbb27b"><circle cx="62" cy="480" r="5"/><circle cx="104" cy="501" r="4"/><circle cx="344" cy="591" r="5"/><circle cx="544" cy="561" r="5"/><circle cx="1008" cy="351" r="5"/></g>
      </svg>
      <div className="destination-carousel" role="region" aria-roledescription="carousel" aria-label="Adventure destinations">
        <div className="destination-track" ref={track} onScroll={syncSlide} onKeyDown={event => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault();goTo(active + (event.key === 'ArrowRight' ? 1 : -1))}
        }} tabIndex={0} aria-label="Swipe destinations or use left and right arrow keys">
          {destinations.map((destination, index) => <article key={destination.page} ref={element => {slides.current[index] = element}} className={'destination-slide '+destination.className} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${destinations.length}: ${destination.title}`}>
            <span className="carousel-zone">ZONE 0{index + 1} / EXPEDITION 01</span>
            <span className="carousel-art" aria-hidden="true"><Icon name={destination.icon} size={64}/></span>
            <p className="eyebrow">{destination.sign}</p>
            <h2>{destination.title}</h2>
            <p className="carousel-description">{destination.subtitle}</p>
            <button className="primary" onClick={() => setPage(destination.page)}>Enter {destination.title}<span aria-hidden="true"> →</span></button>
            <div className="carousel-relics" aria-label="Relics in this zone">
              {relics.filter(relic => relic % destinations.length === index).map(relic => <button key={relic} disabled={stars.includes(relic)} aria-label={stars.includes(relic) ? `Relic ${relic + 1} recovered` : `Collect hidden relic ${relic + 1}`} onClick={() => collect(relic)}><span aria-hidden="true">{stars.includes(relic) ? '✓' : '◈'}</span>{stars.includes(relic) ? 'Recovered' : 'Collect relic'}</button>)}
            </div>
          </article>)}
        </div>
        <div className="carousel-controls">
          <button className="secondary" aria-label="Previous destination" onClick={() => goTo(active - 1)}>←</button>
          <div className="carousel-dots">{destinations.map((destination,index) => <button key={destination.page} aria-label={`Show ${destination.title}`} aria-current={active === index ? 'true' : undefined} onClick={() => goTo(index)}><span/></button>)}</div>
          <button className="secondary" aria-label="Next destination" onClick={() => goTo(active + 1)}>→</button>
        </div>
        <p className="carousel-position" aria-live="polite">{active + 1} / {destinations.length} · {destinations[active].title}</p>
      </div>
      <div className="world-guide"><button aria-label="Get expedition intel" onClick={() => setTip(current => (current+1)%tips.length)}><span aria-hidden="true">🧭</span></button><p>{tips[tip]}<small>NEXT INTEL → TAP THE COMPASS</small></p></div>
    </div>
    <div className="adventure-bottom"><p role="status">{message}</p><button className="primary" onClick={() => setPage(destinations[Math.floor(Math.random()*destinations.length)].page)}>🎲 Random destination</button>{stars.length === 5 && <button className="secondary" onClick={() => {setStars([]);setMessage('New expedition ready. Find all five relics.')}}>Reset expedition</button>}</div>
  </section>
}
