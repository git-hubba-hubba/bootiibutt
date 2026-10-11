import { useState } from 'react'
import GameInputs from './GameInputs'
import { gameLabels, gameEmoji, isCorrect } from '../../data/learning'
export default function LessonPlayer({ lesson, onComplete, onRemix, busy }) {
  const [index,setIndex] = useState(0)
  const [answer,setAnswer] = useState([])
  const [attempts,setAttempts] = useState(0)
  const [firstTry,setFirstTry] = useState(0)
  const [feedback,setFeedback] = useState('')
  const [solved,setSolved] = useState(false)
  const [hint,setHint] = useState(false)
  const [done,setDone] = useState(false)
  const round = lesson.rounds[index]
  const completeAnswer = lesson.kind === 'quiz' ? answer.length === 1 : answer.length === round.cards.length && answer.every(value => value >= 0)
  function check() {
    if(isCorrect(round,answer)) {setSolved(true);setFeedback('You made the connection!');if(attempts === 0) setFirstTry(current => current+1)}
    else {setAttempts(current => current+1);setFeedback('Let’s look at it another way. '+round.hint);setHint(true)}
  }
  function advance() {
    if(index === lesson.rounds.length-1) {setDone(true);onComplete({title:lesson.title,kind:lesson.kind,correct:firstTry,total:lesson.rounds.length});return}
    setIndex(index+1);setAnswer([]);setAttempts(0);setSolved(false);setFeedback('');setHint(false)
  }
  return <section className={'card tutor-player game-'+lesson.kind} aria-label={lesson.title}>
    <div className="tutor-player-heading"><span className="tutor-game-icon" aria-hidden="true">{gameEmoji[lesson.kind]}</span><div><p className="eyebrow">{gameLabels[lesson.kind]} · {lesson.origin === 'ai' ? 'AI-created adventure' : 'Sample adventure'}</p><h2>{lesson.title}</h2></div><span className="badge">{done ? 'Adventure complete!' : `${index+1} / ${lesson.rounds.length}`}</span></div>
    <div className="tutor-teach"><strong>Here’s the big idea</strong><p>{lesson.intro}</p></div>
    {done ? <div className="tutor-finish"><span aria-hidden="true">🌟</span><h2>Look what you discovered!</h2><p>{lesson.concept}</p><p>You explored {lesson.rounds.length} challenges. Let’s try this idea in a different way.</p><button className="primary" disabled={busy} onClick={onRemix}>{busy ? 'Creating an adventure…' : '🎲 Teach me another way'}</button></div> : <div className="tutor-round" key={index}><h3>{round.prompt}</h3><GameInputs kind={lesson.kind} round={round} answer={answer} setAnswer={setAnswer} locked={solved}/><div className="tutor-round-actions">{!solved && <><button className="primary" disabled={!completeAnswer} onClick={check}>Check my idea</button><button className="secondary" onClick={() => setHint(value => !value)}>{hint ? 'Hide hint' : '💡 A little hint'}</button>{attempts > 0 && <button className="text-button" onClick={() => {setAnswer(round.solution);setSolved(true);setFeedback('Let’s learn this one together.')}}>Show me & explain</button>}</>}{solved && <button className="primary" onClick={advance}>{index === lesson.rounds.length-1 ? 'Finish this adventure' : 'Next discovery →'}</button>}</div>{hint && !solved && <p className="tutor-hint">💡 {round.hint}</p>}<p className="tutor-feedback" role="status">{feedback}</p>{solved && <div className="tutor-explanation"><strong>Why it works</strong><p>{round.explanation}</p></div>}</div>}
    {!!lesson.sources?.length && <details className="tutor-sources"><summary>Learning sources</summary><ul>{lesson.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul></details>}
  </section>
}
