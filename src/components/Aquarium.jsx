import { useEffect, useState } from 'react'
import { aquariumLimit, createAnimal, seaAnimals, swimAnimal } from '../data/aquarium'
import Icon from './Icon'
import './Aquarium.css'
const starterTank = () => ['octopus', 'squid', 'fish', 'turtle'].map(createAnimal)
export default function Aquarium() {
  const [animals, setAnimals] = useState(starterTank)
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [food, setFood] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [message, setMessage] = useState('Your ocean friends are ready to play!')
  const selected = animals.find(animal => animal.id === selectedId)
  const species = selected && seaAnimals.find(animal => animal.type === selected.type)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => setAnimals(current => current.map(animal => swimAnimal(animal, food))), 60)
    return () => clearInterval(timer)
  }, [paused, food])
  useEffect(() => {
    if (!food) return
    const timer = setTimeout(() => setFood(null), 4500)
    return () => clearTimeout(timer)
  }, [food])

  function addAnimal(type) {
    if (animals.length >= aquariumLimit) { setMessage('Your tank is full! Send a friend home to make room.'); return }
    const animal = createAnimal(type)
    setAnimals(current => [...current, animal])
    setSelectedId(animal.id)
    setMessage(`${animal.name} joined your aquarium!`)
  }
  function feed(x = 50, y = 45) {
    setFood({ x, y, id: crypto.randomUUID() })
    setMessage(paused ? 'Food is ready. Press Play to watch your friends swim over!' : 'Snack time in our pretend ocean! Watch your friends swim over.')
  }
  function tapWater(event) {
    if (event.target.closest('button')) return
    const rect = event.currentTarget.getBoundingClientRect()
    feed(Math.max(8, Math.min(92, (event.clientX - rect.left) / rect.width * 100)), Math.max(15, Math.min(85, (event.clientY - rect.top) / rect.height * 100)))
  }
  function reset() {
    setAnimals(starterTank()); setSelectedId(null); setFood(null); setPaused(false)
    setMessage('A fresh little ocean, ready for new adventures.')
  }

  return (
    <section className="aquarium" aria-label="Julian’s interactive aquarium">
      <div className="aquarium-heading"><div><p className="eyebrow">MARINE HABITAT / SANDBOX</p><h2>Julian’s aquarium <span aria-hidden="true">🫧</span></h2><p>Tap the water to feed. Select an animal to customize it.</p></div><span className="aquarium-count">{animals.length} / {aquariumLimit} friends</span></div>
      <div className="aquarium-layout">
        <div className="aquarium-play-area">
          <div className={'aquarium-tank ' + (paused ? 'is-paused' : '')} onPointerDown={tapWater} aria-label="Aquarium tank. Use the snack time button to call your animals over.">
            <div className="tank-rays" aria-hidden="true"/>
            <div className="tank-surface" aria-hidden="true"/>
            {[12, 29, 56, 73, 89].map((left, i) => <span key={left} className="tank-bubbles" style={{ left: `${left}%`, animationDelay: `${i * -2}s` }} aria-hidden="true">○<br/>◦<br/>○</span>)}
            <div className="tank-sand" aria-hidden="true"/>
            <div className="tank-reef reef-left" aria-hidden="true">🌿<span>🪸</span>🌿</div>
            <div className="tank-reef reef-right" aria-hidden="true">🪸<span>🌿</span></div>
            <span className="tank-shell" aria-hidden="true">🐚</span>
            {food && <div key={food.id} className="tank-food" style={{ left: `${food.x}%`, top: `${food.y}%` }} aria-hidden="true"><i/><i/><i/><span>Snack time!</span></div>}
            {animals.map(animal => {
              const kind = seaAnimals.find(item => item.type === animal.type)
              return <button key={animal.id} className={'tank-animal ' + (animal.id === selectedId ? 'is-selected' : '')} style={{ left: `${animal.x}%`, top: `${animal.y}%`, '--animal-size': `${kind.size}px` }} onClick={() => { setSelectedId(animal.id); setMessage(`Hello, ${animal.name}!`) }} aria-label={`Say hello to ${animal.name}`} aria-pressed={animal.id === selectedId}><span className="animal-emoji" style={{ transform: `scaleX(${animal.vx > 0 ? -1 : 1})` }} aria-hidden="true">{kind.emoji}</span><span className="animal-name">{animal.name}</span></button>
            })}
            {!animals.length && <p className="tank-empty">Your ocean is waiting.<br/>Add a species to get started! 🐙</p>}
            <span className="tank-label" aria-hidden="true">Build. Observe. Explore.</span>
          </div>
          <div className="aquarium-controls"><button className="primary" onClick={() => feed()}>🍪 Snack time</button><button className="secondary" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? '▶ Play' : 'Ⅱ Pause'}</button><button className="secondary" onClick={reset}>↻ Start fresh</button></div>
          <p className="aquarium-status" role="status">{message}</p>
          {selected && <div className="aquarium-friend"><span className="friend-portrait" aria-hidden="true">{species.emoji}</span><div className="friend-details"><label className="field">Name this {species.name.toLowerCase()}<input value={selected.name} maxLength={24} onChange={event => {const name = event.target.value;setAnimals(current => current.map(animal => animal.id === selected.id ? { ...animal, name } : animal))}}/></label><p>{species.hint}</p></div><button className="secondary" onClick={() => {setAnimals(current => current.filter(animal => animal.id !== selected.id));setSelectedId(null);setMessage(`${selected.name || species.name} went home. There’s room for a new friend!`)}}>Remove</button></div>}
        </div>
        <aside className="aquarium-animal-picker" aria-label="Add sea animals"><div className="picker-heading"><Icon name="plus" size={19}/><h3>Add a species</h3></div><p>Choose your tank inhabitants.</p><div className="picker-animals">{seaAnimals.map(animal => <button key={animal.type} onClick={() => addAnimal(animal.type)} disabled={animals.length >= aquariumLimit} aria-label={`Add a ${animal.name.toLowerCase()} to the aquarium`}><span className={'picker-emoji ' + animal.color} aria-hidden="true">{animal.emoji}</span><span>{animal.name}</span><Icon name="plus" size={16}/></button>)}</div><p className="picker-note">An imagination tank! These friends can play together here.</p></aside>
      </div>
    </section>
  )
}
