import Icon from './Icon'
import { youtubeSearch } from '../data/shows'

export default function ShowCard({ show, onCharacter, format }) {
  return <article className="show-card" style={{ '--show-accent': show.accent }}>
    <div className="show-poster" aria-hidden="true"><span>{show.badge}</span><strong>{show.mark}</strong><span>BUBBI CAFE / WATCHLIST</span></div>
    <div className="show-card-body">
      <p className="show-kicker">{show.publisher}</p>
      <h3>{show.title}</h3><p>{show.description}</p>
      <div className="show-characters" role="group" aria-label={`Search characters from ${show.title}`}>
        {show.characters.map(character => <button key={character} onClick={() => onCharacter(character)}>{character}</button>)}
      </div>
      <div className="show-card-actions">
        {show.watch && <><a className="show-watch" href={show.watch.url} target="_blank" rel="noopener noreferrer"><Icon name="video" size={18}/>{show.watch.label}<span aria-hidden="true">↗</span></a><small>{show.watch.detail}</small></>}
        <a className={show.watch ? 'show-search-link' : 'show-watch'} href={youtubeSearch(show.title, format, show.publisher)} target="_blank" rel="noopener noreferrer"><Icon name="search" size={17}/>Search YouTube {format}<span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </article>
}
