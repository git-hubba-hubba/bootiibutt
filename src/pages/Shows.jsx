import { useState } from 'react'
import Icon from '../components/Icon'
import ShowCard from '../components/ShowCard'
import { shows, matchingShows, youtubeSearch } from '../data/shows'
import './Shows.css'

export default function Shows() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [format, setFormat] = useState('episodes')
  const [error, setError] = useState('')
  const matches = matchingShows(query)
  const publisher = query && matches.length === 1 ? matches[0].publisher : ''
  const pbsMatch = matches.find(show => show.id === 'kratts')
  function search(value) {
    const trimmed = value.trim()
    if (!trimmed) { setError('Enter a character or show name to start.'); return }
    setInput(trimmed); setQuery(trimmed); setError('')
  }
  function reset() { setInput(''); setQuery(''); setError('') }
  return <section className="shows-page" aria-labelledby="shows-title">
    <header className="shows-hero">
      <div><p className="show-kicker">BUBBI CAFE / SCREEN ROOM</p><h1 id="shows-title">Your characters.<br/>Your next episode.</h1><p>Pick a favorite or search for someone new.</p></div>
      <div className="shows-hero-art" aria-hidden="true"><Icon name="video" size={72}/><span>PRESS PLAY</span></div>
    </header>
    <form className="shows-search" onSubmit={event => { event.preventDefault(); search(input) }}>
      <label htmlFor="show-character">Who do you want to watch?</label>
      <div className="shows-search-row"><div><Icon name="search"/><input id="show-character" type="search" value={input} onChange={event => setInput(event.target.value)} placeholder="Try Skipper, Bugs Bunny, or the Kratt brothers" maxLength={120} aria-invalid={!!error} aria-describedby={error ? 'shows-error' : 'shows-search-note'}/></div><button type="submit">Find videos <Icon name="arrow" size={18}/></button></div>
      <div className="shows-search-options"><fieldset><legend>Look for</legend>{[['episodes', 'Full episodes'], ['clips', 'Clips & highlights']].map(([value, label]) => <label key={value}><input type="radio" name="show-format" checked={format === value} onChange={() => setFormat(value)}/>{label}</label>)}</fieldset><p id="shows-search-note">Watch and search links open in a new tab.</p></div>
      {error && <p id="shows-error" role="alert" className="shows-error">{error}</p>}
    </form>
    {query && <section className="shows-discovery" aria-labelledby="shows-discovery-title">
      <div className="shows-section-heading"><div><p className="show-kicker">SEARCH DESTINATIONS</p><h2 id="shows-discovery-title">Explore “{query}”</h2></div><button onClick={reset}>Clear search <Icon name="close" size={16}/></button></div>
      <p role="status">{matches.length ? `${matches.length} matching ${matches.length === 1 ? 'show' : 'shows'} in your starter collection.` : 'A new character! Try the video searches below.'} Searches run on the video provider’s website.</p>
      <div className="shows-provider-grid">
        <a href={youtubeSearch(query, format, publisher)} target="_blank" rel="noopener noreferrer"><span className="shows-provider-symbol" aria-hidden="true">▶</span><div><h3>Search YouTube</h3><p>{format === 'episodes' ? 'Look for full episodes' : 'Look for clips and highlights'} featuring {query}.</p><small>{publisher ? `Includes ${publisher} in the search` : 'Includes “official” in the search'}</small></div><span aria-hidden="true">↗</span></a>
        <a href={pbsMatch ? pbsMatch.watch.url : youtubeSearch(query, format, 'PBS KIDS')} target="_blank" rel="noopener noreferrer"><span className="shows-provider-symbol pbs" aria-hidden="true">PBS</span><div><h3>{pbsMatch ? 'Watch Wild Kratts on PBS KIDS' : 'Search PBS KIDS on YouTube'}</h3><p>{pbsMatch ? 'Explore the current Wild Kratts episode collection.' : `Look for ${query} with PBS KIDS in the search.`}</p><small>{pbsMatch ? 'Opens PBS KIDS Videos' : 'Not every character has a PBS KIDS show'}</small></div><span aria-hidden="true">↗</span></a>
      </div>
      <p className="shows-availability">Search results may include unofficial uploads or clips. Full episodes depend on the publisher and your location.</p>
    </section>}
    <div className="shows-section-heading"><div><p className="show-kicker">{query ? 'FROM YOUR COLLECTION' : 'START WITH A FAVORITE'}</p><h2>{query ? 'Matching shows' : 'On your screen'}</h2></div>{query && <button onClick={reset}>Show all four</button>}</div>
    {matches.length ? <div className="shows-grid">{matches.map(show => <ShowCard key={show.id} show={show} onCharacter={search} format={format}/>)}</div> : <p className="shows-empty">No match in the starter collection. Use the search links above, or show all four favorites.</p>}
    <aside className="shows-pbs"><div><p className="show-kicker">MORE TO EXPLORE</p><h2>PBS KIDS video library</h2><p>Browse episodes and clips from PBS KIDS shows.</p></div><a href="https://pbskids.org/videos" target="_blank" rel="noopener noreferrer">Open PBS KIDS <span aria-hidden="true">↗</span></a></aside>
    <p className="shows-footnote">{shows.length} starter shows · Choose a character chip to search · Videos play on YouTube or PBS KIDS</p>
  </section>
}
