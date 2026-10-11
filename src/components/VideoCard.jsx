import Icon from './Icon'
export default function VideoCard({ video }) {
  return (
    <article className="card ocean-video-card">
      <a
        className="ocean-video-link"
        href={`https://www.youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch ${video.title} by ${video.publisher} on YouTube (opens in a new tab)`}
      >
        <div className="ocean-video-thumbnail">
          <span className="ocean-video-fallback" aria-hidden="true">{video.animal === 'Squid' ? '🦑' : '🐙'}</span>
          <img
            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={event => { event.currentTarget.hidden = true }}
          />
          <span className="ocean-play" aria-hidden="true">▶</span>
          <span className="ocean-format">{video.format}</span>
        </div>
        <div className="ocean-video-content">
          <p className="eyebrow">{video.animal} · {video.publisher}</p>
          <h3>{video.title}</h3>
          <p>{video.description}</p>
          <span className="primary">Watch on YouTube <Icon name="arrow" size={18}/></span>
        </div>
      </a>
      <div className="ocean-discussion"><strong>After you watch…</strong><p>{video.prompt}</p></div>
    </article>
  )
}
