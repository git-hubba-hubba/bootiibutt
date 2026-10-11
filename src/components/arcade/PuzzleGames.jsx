import { useEffect, useState } from 'react'
import { createMaze, mazeMove } from '../../games/puzzleRules'
export function TreasureMaze({ onFinish }) {
  const [cells]=useState(()=>createMaze())
  const [position,setPosition]=useState(0)
  const [moves,setMoves]=useState(0)
  const [visited,setVisited]=useState([0])
  function move(direction) {if(position===63)return;const next=mazeMove(cells,position,direction);if(next===position)return;setPosition(next);setMoves(current=>current+1);setVisited(current=>current.includes(next)?current:[...current,next]);if(next===63)onFinish(Math.max(20,200-moves),true)}
  return <div className="maze-game"><div className="arcade-scoreboard"><span>🗺️ Follow the open paths</span><span>{moves} steps</span></div><div className="maze-grid" tabIndex={0} aria-label="Maze. Use arrow keys to reach the treasure." onKeyDown={event=>{const direction={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}[event.key];if(direction!==undefined){event.preventDefault();move(direction)}}}>{cells.map((cell,i)=><div key={i} className={visited.includes(i)?'visited':''} style={{borderTop:cell.walls[0]?'3px solid #5e6788':'3px solid transparent',borderRight:cell.walls[1]?'3px solid #5e6788':'3px solid transparent',borderBottom:cell.walls[2]?'3px solid #5e6788':'3px solid transparent',borderLeft:cell.walls[3]?'3px solid #5e6788':'3px solid transparent'}}>{i===position?'🦊':i===63?'💎':visited.includes(i)?'·':''}</div>)}</div><div className="arcade-touch-controls"><button aria-label="Move left" onClick={()=>move(3)}>◀</button><button aria-label="Move up" onClick={()=>move(0)}>▲</button><button aria-label="Move down" onClick={()=>move(2)}>▼</button><button aria-label="Move right" onClick={()=>move(1)}>▶</button></div><p className="arcade-live-result" role="status">{position===63?'🏆 You found the treasure! Choose Play again for a new maze.':`Fox at row ${Math.floor(position/8)+1}, column ${position%8+1}. Treasure at row 8, column 8.`}</p></div>
}
const pads=[['❤️','Coral','#f67f9d'],['⭐','Gold','#f2c865'],['💧','Aqua','#77cbdc'],['🌿','Mint','#8dd5a9']]
export function RainbowBeats({ onFinish }) {
  const [sequence,setSequence]=useState([])
  const [phase,setPhase]=useState('ready')
  const [lit,setLit]=useState(-1)
  const [index,setIndex]=useState(0)
  useEffect(()=>{
    if(phase!=='watch')return
    const timers=[]
    sequence.forEach((pad,i)=>{timers.push(setTimeout(()=>setLit(pad),350+i*950));timers.push(setTimeout(()=>setLit(-1),950+i*950))})
    timers.push(setTimeout(()=>setPhase('input'),350+sequence.length*950))
    return()=>timers.forEach(clearTimeout)
  },[sequence,phase])
  function start() {setSequence([Math.floor(Math.random()*4)]);setIndex(0);setPhase('watch');setLit(-1)}
  function press(pad) {if(phase!=='input')return;if(sequence[index]!==pad){setPhase('lost');onFinish((sequence.length-1)*15,false);return}if(index===sequence.length-1){if(sequence.length===6){setPhase('won');onFinish(100,true)}else{setSequence(current=>[...current,Math.floor(Math.random()*4)]);setIndex(0);setPhase('watch')}}else setIndex(index+1)}
  return <div className="pattern-game"><div className="arcade-scoreboard"><span>🎵 Round {Math.min(sequence.length||1,6)}/6</span><span aria-live="polite">{phase==='watch'?(lit>=0?`Watch: ${pads[lit][1]}`:'Watch the lights…'):phase==='input'?`Your turn! ${index}/${sequence.length}`:phase==='won'?'Pattern champion!':phase==='lost'?'Good try!':'Ready to play?'}</span></div><div className="pattern-pads">{pads.map(([emoji,label,color],i)=><button key={label} style={{'--pad-color':color}} className={lit===i?'lit':''} disabled={phase!=='input'} onClick={()=>press(i)} aria-label={label}><span>{emoji}</span>{label}</button>)}</div>{['ready','lost','won'].includes(phase)&&<button className="arcade-button" onClick={start}>{phase==='ready'?'▶ Show me the pattern':'↻ Try a new pattern'}</button>}<p className="arcade-live-result" role="status">{phase==='won'?'🏆 Six patterns remembered!':phase==='lost'?'That was a different beat. You can try again.':phase==='watch'?'Watch carefully. Your turn comes after the lights.':phase==='input'?'Tap the pads in the order you saw them.':'The pattern grows a little longer each round.'}</p></div>
}
