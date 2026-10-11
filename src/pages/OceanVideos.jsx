import { useState } from 'react'
import { SectionHeading } from '../components/UI'
import VideoCard from '../components/VideoCard'
import Aquarium from '../components/Aquarium'
import { oceanVideos } from '../data/oceanVideos'
const filters = ['All videos', 'Squid', 'Octopus', 'Documentaries']
export default function OceanVideos() {
  const [filter, setFilter] = useState('All videos')
  const videos = oceanVideos.filter(video => filter === 'All videos' || video.animal === filter || (filter === 'Documentaries' && video.format.toLowerCase().includes('documentary')))
  return (
    <>
      <SectionHeading eyebrow="DIVE INTO SOMETHING AMAZING" title="Squid & octopus"/>
      <section className="ocean-banner">
        <div><p className="eyebrow">DEEP SEA / FIELD STATION</p><h1>Explore beneath the surface.</h1><p>Build a marine habitat, observe sea creatures, and explore real ocean documentaries.</p></div>
        <span aria-hidden="true">🦑 🐙</span>
      </section>
      <Aquarium/>
      <SectionHeading eyebrow="WATCH & WONDER" title="Ocean video adventures"/>
      <div className="ocean-filters" role="group" aria-label="Filter ocean videos">
        {filters.map(label => <button key={label} className={filter === label ? 'selected' : ''} aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}</button>)}
      </div>
      <p className="ocean-link-note">Videos open directly on YouTube in a new tab. Try a quick discovery or watch a documentary together.</p>
      <div className="ocean-video-grid">{videos.map(video => <VideoCard key={video.id} video={video}/>)}</div>
    </>
  )
}
