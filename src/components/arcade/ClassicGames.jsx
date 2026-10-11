import { useState } from 'react'
const symbols=['🐙','🦑','🐢','🐬','🐳','🦀','🐠','🦈']
function shuffled(list){const result=[...list];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
export function Memory({ count, onFinish }) {
  const [cards]=useState(()=>shuffled([...symbols.slice(0,count),...symbols.slice(0,count)]))
  const [open,setOpen]=useState([])
  const [matched,setMatched]=useState([])
  const [moves,setMoves]=useState(0)
  function flip(i){if(open.includes(i)||matched.includes(i))return;const current=open.length===2?[]:open;const next=[...current,i];setOpen(next);if(next.length===2){setMoves(moves+1);if(cards[next[0]]===cards[next[1]]){const found=[...matched,...next];setMatched(found);setOpen([]);if(found.length===cards.length)onFinish(Math.max(20,count*30-(moves+1)*3),true)}}}
  return <div className="reef-memory"><div className="arcade-scoreboard"><span>{moves} flips</span><span>🐙 {matched.length/2}/{count} pairs</span></div><div className="arcade-memory-board">{cards.map((card,i)=><button key={i} className={matched.includes(i)?'matched':''} onClick={()=>flip(i)} disabled={matched.includes(i)} aria-label={open.includes(i)||matched.includes(i)?card:`Hidden card ${i+1}`}>{open.includes(i)||matched.includes(i)?card:'?'}</button>)}</div><p className="arcade-live-result" role="status">{matched.length===cards.length?'🏆 You found every sea friend!':'Tap two cards. Find matching friends!'}</p></div>
}
function question(){const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*10)+1,sum=a+b;return {a,b,choices:shuffled([sum,sum+1,Math.max(0,sum-1),sum+3])}}
export function Numbers({ onFinish }) {
  const [puzzle,setPuzzle]=useState(question)
  const [score,setScore]=useState(0)
  const [answer,setAnswer]=useState('')
  const [feedback,setFeedback]=useState('')
  function check(value){if(score>=10)return;if(Number(value)===puzzle.a+puzzle.b){const next=score+1;setScore(next);setPuzzle(question());setAnswer('');setFeedback('Blast off! Another star!');if(next===10)onFinish(100,true)}else setFeedback('Almost! Count it out and give it another try.')}
  return <div className="number-launch"><span className="number-rocket" aria-hidden="true">{score>=10?'🌟':'🚀'}</span><div className="rocket-progress">{Array.from({length:10},(_,i)=><span key={i} className={i<score?'collected':''}>★</span>)}</div>{score>=10?<h3>Ten stars! Your rocket is ready for the universe!</h3>:<><div className="arcade-math">{puzzle.a} + {puzzle.b} = ?</div><div className="number-choices">{puzzle.choices.map(choice=><button key={choice} onClick={()=>check(choice)}>{choice}</button>)}</div><form onSubmit={event=>{event.preventDefault();check(answer)}}><label>Your answer<input type="number" min="0" value={answer} onChange={event=>setAnswer(event.target.value)} required/></label><button className="arcade-button">Launch!</button></form></>}<p className="arcade-live-result" role="status">{feedback}</p></div>
}
