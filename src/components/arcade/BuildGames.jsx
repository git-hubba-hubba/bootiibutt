import { useEffect, useState } from 'react'
import { cityComplete, stackOverlap, garageLayout } from '../../games/puzzleRules'
export function BlockCity({ onFinish }) {
  const [tiles,setTiles]=useState(Array(48).fill(''))
  const [tool,setTool]=useState('🏠')
  const [history,setHistory]=useState([])
  const [won,setWon]=useState(false)
  const tools=[['🏠','Home'],['🛣️','Road'],['🌳','Park'],['🏫','School'],['🌊','Pond'],['🌻','Garden'],['','Eraser']]
  function build(i) {if(tiles[i]===tool)return;const next=[...tiles];next[i]=tool;setHistory(current=>[...current,tiles].slice(-40));setTiles(next);if(!won&&cityComplete(next)){setWon(true);onFinish(100,true)}}
  return <div className="city-builder"><div className="builder-tools" role="group" aria-label="Building tiles">{tools.map(([emoji,label])=><button key={label} aria-pressed={tool===emoji} className={tool===emoji?'selected':''} onClick={()=>setTool(emoji)}><span>{emoji||'⌫'}</span>{label}</button>)}</div><div className="city-goals">{[['🏠',3],['🛣️',4],['🌳',2]].map(([emoji,target])=><span key={emoji}>{emoji} {tiles.filter(tile=>tile===emoji).length}/{target}</span>)}<button disabled={!history.length} onClick={()=>{setTiles(history.at(-1));setHistory(current=>current.slice(0,-1))}}>↶ Undo</button></div><div className="city-grid">{tiles.map((tile,i)=><button key={i} onClick={()=>build(i)} aria-label={`${tile||'Empty lot'}, row ${Math.floor(i/8)+1}, column ${i%8+1}. Place ${tools.find(([emoji])=>emoji===tool)[1]}`}>{tile||<span>＋</span>}</button>)}</div><p className="arcade-live-result" role="status">{won?'🏡 Your neighborhood is ready! Keep building your dream city.':'Build 3 homes, 4 roads, and 2 parks. What else does your city need?'}</p></div>
}
export function SkyStacker({ onFinish }) {
  const [floors,setFloors]=useState([{x:15,w:70}])
  const [motion,setMotion]=useState({x:0,direction:1})
  const [status,setStatus]=useState('playing')
  const [paused,setPaused]=useState(false)
  const width=floors.at(-1).w
  useEffect(()=>{
    if(status!=='playing'||paused)return
    const timer=setInterval(()=>setMotion(current=>{let x=current.x+current.direction*(.5+floors.length*.12);let direction=current.direction;if(x<0||x>100-width){direction=-direction;x=Math.max(0,Math.min(100-width,x))}return {x,direction}}),25)
    return()=>clearInterval(timer)
  },[floors.length,width,status,paused])
  function drop() {if(status!=='playing'||paused)return;const next=stackOverlap(floors.at(-1),{x:motion.x,w:width});if(next.w<3){setStatus('lost');onFinish((floors.length-1)*10,false);return}setFloors(current=>[...current,next]);setMotion({x:0,direction:1});if(floors.length===10){setStatus('won');onFinish(100,true)}}
  return <div className="tower-game" tabIndex={0} onKeyDown={event=>{if(event.code==='Space'&&event.target===event.currentTarget){event.preventDefault();drop()}}}><div className="arcade-scoreboard"><span>🏙️ {floors.length-1}/10 floors</span><button onClick={()=>setPaused(value=>!value)} disabled={status!=='playing'}>{paused?'▶ Resume':'Ⅱ Pause'}</button></div><div className="tower-sky"><span className="tower-moon" aria-hidden="true">🌙</span>{floors.map((floor,i)=><div className="tower-floor" key={i} style={{left:`${floor.x}%`,width:`${floor.w}%`,bottom:30+i*29,background:['#7bdedc','#b69bf5','#ffb978','#f68cb5'][i%4]}}><span>▦ ▦ ▦</span></div>)}{status==='playing'&&<div className="tower-floor moving" style={{left:`${motion.x}%`,width:`${width}%`,bottom:30+floors.length*29}}><span>▦ ▦ ▦</span></div>}</div><button className="arcade-button" disabled={status!=='playing'||paused} onClick={drop}>⬇ Drop block!</button><p className="arcade-live-result" role="status">{status==='won'?'🏆 Ten floors! Your tower touches the sky!':status==='lost'?'That block missed. Try a new tower!':paused?'Stacking paused.':'Line up the block with the floor below.'}</p></div>
}
const {flags,barriers}=garageLayout
export function DreamGarage({ onFinish }) {
  const [paint,setPaint]=useState('#f477a1')
  const [body,setBody]=useState('Sport')
  const [wheels,setWheels]=useState('Classic')
  const [driving,setDriving]=useState(false)
  const [position,setPosition]=useState(garageLayout.start)
  const [collected,setCollected]=useState([])
  const [moves,setMoves]=useState(0)
  function move(dx,dy) {
    if(collected.length===5)return
    const x=position%8+dx,y=Math.floor(position/8)+dy,next=y*8+x
    if(x<0||x>=8||y<0||y>=5||barriers.includes(next))return
    setPosition(next);setMoves(current=>current+1)
    if(flags.includes(next)&&!collected.includes(next)){const found=[...collected,next];setCollected(found);if(found.length===5)onFinish(Math.max(50,200-moves),true)}
  }
  const car=<div className={'garage-car body-'+body.toLowerCase()+' wheels-'+wheels.toLowerCase()} style={{'--car-paint':paint}}><span className="car-window"/><span className="car-stripe"/><i/><i/></div>
  return <div className="garage-game">{!driving?<><div className="garage-preview">{car}<span className="garage-floor"/></div><div className="garage-options"><fieldset><legend>Paint your ride</legend>{['#f477a1','#7d9cf5','#67cfb4','#f7bd58','#b493ed'].map(color=><button key={color} className="paint-swatch" style={{background:color}} aria-label={`Paint ${color}`} aria-pressed={paint===color} onClick={()=>setPaint(color)}>{paint===color?'✓':''}</button>)}</fieldset><fieldset><legend>Body</legend>{['Sport','Truck','Buggy'].map(option=><button className={body===option?'selected':''} key={option} onClick={()=>setBody(option)}>{option}</button>)}</fieldset><fieldset><legend>Wheels</legend>{['Classic','Monster'].map(option=><button className={wheels===option?'selected':''} key={option} onClick={()=>setWheels(option)}>{option}</button>)}</fieldset></div><button className="arcade-button" onClick={()=>setDriving(true)}>🏁 Test drive my car!</button></>:<><div className="arcade-scoreboard"><span>🏁 {collected.length}/5 flags</span><span>{moves} moves</span><button onClick={()=>setDriving(false)}>Back to garage</button></div><div className="garage-track" tabIndex={0} aria-label="Test track. Arrow keys move your car." onKeyDown={event=>{const direction={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[event.key];if(direction){event.preventDefault();move(...direction)}}}>{Array.from({length:40},(_,i)=><div key={i} className={barriers.includes(i)?'barrier':''}>{i===position?car:barriers.includes(i)?'🚧':flags.includes(i)&&!collected.includes(i)?'🏁':''}</div>)}</div><div className="arcade-touch-controls"><button aria-label="Drive left" onClick={()=>move(-1,0)}>◀</button><button aria-label="Drive up" onClick={()=>move(0,-1)}>▲</button><button aria-label="Drive down" onClick={()=>move(0,1)}>▼</button><button aria-label="Drive right" onClick={()=>move(1,0)}>▶</button></div><p className="arcade-live-result" role="status">{collected.length===5?'🏆 All five flags! Your custom ride passed its test.':'Drive around the barriers and collect all five flags.'}</p></>}</div>
}
