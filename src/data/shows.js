// Publisher watch links checked October 11, 2026. Search links are discovery
// shortcuts, not a claim that every result is official or a full episode.
export const shows = [
  {
    id: 'knd', title: 'Codename: Kids Next Door', badge: 'SECTOR V', accent: '#d4a568', mark: '05',
    description: 'Secret missions with Numbuh 1 and the Sector V team.',
    characters: ['Numbuh 1', 'Numbuh 2', 'Numbuh 3', 'Numbuh 4', 'Numbuh 5'],
    aliases: ['codename kids next door', 'code name kids next door', 'knd', 'nigel uno'],
    publisher: 'Cartoon Network',
    watch: { url: 'https://www.youtube.com/watch?v=ZcLhESBgLfo', label: 'Watch Operation: I.-S.C.R.E.A.M.', detail: 'Full episode · Cartoon Network on YouTube' },
  },
  {
    id: 'kratts', title: 'Wild Kratts', badge: 'CREATURE POWER', accent: '#8fbb8b', mark: 'WK',
    description: 'Animal adventures with Chris and Martin Kratt.',
    characters: ['Chris Kratt', 'Martin Kratt', 'Aviva', 'Koki', 'Jimmy Z'],
    aliases: ['kratt brothers', 'kratts brothers', 'kratz brothers', 'wild kratts', 'chris', 'martin'],
    publisher: 'Wild Kratts',
    watch: { url: 'https://pbskids.org/videos/wild-kratts', label: 'Watch on PBS KIDS', detail: 'PBS KIDS · Rotating episodes and clips' },
  },
  {
    id: 'penguins', title: 'The Penguins of Madagascar', badge: 'MISSION READY', accent: '#89b9d1', mark: 'PM',
    description: 'Skipper and his crew turn zoo life into a covert operation.',
    characters: ['Skipper', 'Kowalski', 'Rico', 'Private', 'King Julien'],
    aliases: ['penguins of madagascar', 'penguins', 'madagascar'], publisher: 'Nickelodeon',
  },
  {
    id: 'looney', title: 'Looney Tunes', badge: 'CLASSIC CARTOONS', accent: '#d99478', mark: 'LT',
    description: 'Bugs, Daffy, and the crew bring the cartoon chaos.',
    characters: ['Bugs Bunny', 'Daffy Duck', 'Tweety', 'Sylvester', 'Road Runner', 'Wile E. Coyote'],
    aliases: ['looney tunes', 'looney toons', 'loony tunes', 'taz', 'porky pig'], publisher: 'WB Kids',
  },
]

export function youtubeSearch(character, format = 'episodes', publisher = '') {
  const query = [character.trim(), format === 'episodes' ? 'full episodes' : 'clips', publisher, 'official'].filter(Boolean).join(' ')
  return `https://www.youtube.com/results?${new URLSearchParams({ search_query: query })}`
}

export function matchingShows(query) {
  const normalize = value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const needle = normalize(query)
  if (!needle) return shows
  return shows.filter(show => [show.title, ...show.characters, ...show.aliases].some(name => normalize(name).includes(needle)))
}
