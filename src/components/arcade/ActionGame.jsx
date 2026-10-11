import { useEffect, useRef, useState } from 'react'
import { createGame, tick, act, WIDTH, HEIGHT } from '../../games/arcadeEngine'
import { drawGame } from '../../games/drawArcade'
export default function ActionGame({ game, onFinish }) {
  const canvasRef=useRef(null)
  const engineRef=useRef(null)
  const inputRef=useRef({})
  const pausedRef=useRef(false)
  const [paused,setPaused]=useState(false)
  const [started,setStarted]=useState(false)
  const [snapshot,setSnapshot]=useState({score:0,lives:3,time:0,status:'playing'})
  useEffect(()=>{pausedRef.current=paused||!started},[paused,started])
  useEffect(()=>{
    const canvas=canvasRef.current;const ctx=canvas.getContext('2d');const state=createGame(game.id);engineRef.current=state
    let frame,last=0,lastUpdate=0,reported=false
    function loop(now) {
      const dt=last?(now-last)/1000:0;last=now
      if(!pausedRef.current) tick(state,dt,inputRef.current)
      drawGame(ctx,state)
      if(now-lastUpdate>100) {setSnapshot({score:state.score,lives:state.lives,time:Math.floor(state.time),status:state.status});lastUpdate=now}
      if(state.status!=='playing'&&!reported) {reported=true;onFinish(state.score,state.status==='won')}
      frame=requestAnimationFrame(loop)
    }
    frame=requestAnimationFrame(loop)
    const visibility=()=>{if(document.hidden) {setPaused(true);inputRef.current={}}}
    document.addEventListener('visibilitychange',visibility)
    return ()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);engineRef.current=null;inputRef.current={}}
  },[game.id,onFinish])
  const keys={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'}
  function keyboard(event,down) {
    const key=keys[event.key]
    if(key) {event.preventDefault();inputRef.current[key]=down;if(key==='left'||key==='right')delete inputRef.current.pointerX;if(key==='up')inputRef.current.jump=down}
    if(event.code==='Space') {event.preventDefault();inputRef.current.jump=down;if(down&&!event.repeat&&!pausedRef.current&&engineRef.current)act(engineRef.current)}
  }
  function coords(event) {const box=canvasRef.current.getBoundingClientRect();return {x:(event.clientX-box.left)/box.width*WIDTH,y:(event.clientY-box.top)/box.height*HEIGHT}}
  function pointer(event) {
    if(pausedRef.current||!engineRef.current)return
    const {x,y}=coords(event);engineRef.current.aim={x,y}
    if(['space','bricks'].includes(game.id))inputRef.current.pointerX=x
    if(game.id==='platform') {inputRef.current.jump=true;setTimeout(()=>{inputRef.current.jump=false},160)}
    else act(engineRef.current,x,y)
    canvasRef.current.focus({preventScroll:true})
  }
  function control(name,value) {if(value&&pausedRef.current)return;inputRef.current[name]=value;delete inputRef.current.pointerX}
  const finished=snapshot.status!=='playing'
  return <div className="arcade-action-game"><div className="arcade-scoreboard"><span>⭐ <strong>{snapshot.score}</strong> points</span><span>{['platform','race','space','bricks'].includes(game.id)?`❤️ ${snapshot.lives} tries`:`⏱ ${snapshot.time}s`}</span><button onClick={()=>setPaused(value=>!value)} disabled={finished||!started}>{paused?'▶ Resume':'Ⅱ Pause'}</button></div><div className="arcade-canvas-wrap"><canvas width={WIDTH} height={HEIGHT} ref={canvasRef} tabIndex={0} aria-label={`${game.title}. ${game.controls}`} onKeyDown={event=>keyboard(event,true)} onKeyUp={event=>keyboard(event,false)} onBlur={()=>{inputRef.current={}}} onPointerDown={pointer} onPointerMove={event=>{if(['space','bricks'].includes(game.id)&&!pausedRef.current) inputRef.current.pointerX=coords(event).x}}/><div className="arcade-screen-hint" aria-hidden="true">{game.goal}</div>{(!started||paused||finished)&&<div className="arcade-game-overlay"><span aria-hidden="true">{!started?game.emoji:finished?(snapshot.status==='won'?'🏆':'🌟'):'⏸️'}</span><h3>{!started?'Ready, player one?':finished?(snapshot.status==='won'?'You did it!':'Nice adventure! Try again?'):'Taking a little break'}</h3><p>{!started?game.goal:`${snapshot.score} points · ${finished?'Use Play again below to start a new round.':'Your game is waiting right here.'}`}</p>{!finished&&<button className="arcade-button" onClick={()=>{setStarted(true);setPaused(false);canvasRef.current.focus({preventScroll:true})}}>{started?'Keep playing':'Let’s play!'}</button>}</div>}</div><div className="arcade-touch-controls">{['platform','race','space','bricks','fishing','ducks','bubbles'].includes(game.id)&&<><button aria-label="Move or aim left" onPointerDown={()=>control('left',true)} onPointerUp={()=>control('left',false)} onPointerLeave={()=>control('left',false)} onPointerCancel={()=>control('left',false)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();control('left',true)}}} onKeyUp={()=>control('left',false)} onBlur={()=>control('left',false)}>◀</button><button aria-label="Move or aim right" onPointerDown={()=>control('right',true)} onPointerUp={()=>control('right',false)} onPointerLeave={()=>control('right',false)} onPointerCancel={()=>control('right',false)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();control('right',true)}}} onKeyUp={()=>control('right',false)} onBlur={()=>control('right',false)}>▶</button></>}{['ducks','bubbles'].includes(game.id)&&<><button aria-label="Aim up" onPointerDown={()=>control('up',true)} onPointerUp={()=>control('up',false)} onPointerLeave={()=>control('up',false)} onPointerCancel={()=>control('up',false)}>▲</button><button aria-label="Aim down" onPointerDown={()=>control('down',true)} onPointerUp={()=>control('down',false)} onPointerLeave={()=>control('down',false)} onPointerCancel={()=>control('down',false)}>▼</button></>}{['platform','fishing','ducks','bubbles'].includes(game.id)&&<button className="arcade-control-action" onClick={()=>{if(pausedRef.current||!engineRef.current)return;if(game.id==='platform'){inputRef.current.jump=true;setTimeout(()=>{inputRef.current.jump=false},160)}else act(engineRef.current)}}>{game.id==='platform'?'Jump!':game.id==='fishing'?'Drop magnet':'Tag!'}</button>}</div><p className="arcade-live-result" role="status">{finished?`${snapshot.status==='won'?'Adventure complete!':'Round over.'} ${snapshot.score} points.`:paused?'Game paused.':''}</p></div>
}
