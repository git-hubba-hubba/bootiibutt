export const WIDTH = 900
export const HEIGHT = 500
export const clamp = (n,min,max) => Math.max(min,Math.min(max,n))
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y
const random = (rng,min,max) => min+rng()*(max-min)
export function createGame(id,rng=Math.random) {
  const state = {id,status:'playing',score:0,lives:3,time:0,spawn:0,objects:[],aim:{x:450,y:250},message:'',camera:0}
  if(id === 'platform') {
    state.player={x:50,y:355,w:34,h:44,vx:0,vy:0,grounded:false}
    state.platforms=[{x:0,y:430,w:420,h:70},{x:490,y:425,w:350,h:75},{x:915,y:430,w:355,h:70},{x:1350,y:425,w:420,h:75},{x:1850,y:430,w:480,h:70},{x:230,y:335,w:125,h:20},{x:605,y:320,w:140,h:20},{x:1045,y:325,w:130,h:20},{x:1490,y:315,w:150,h:20},{x:1990,y:320,w:160,h:20}]
    state.coins=[280,650,1090,1540,2050].map((x,i)=>({x,y:270+(i%2)*15,w:23,h:23,collected:false}))
    state.checkpoint=50
  }
  if(id === 'race') state.player={x:450,y:405,w:48,h:70}
  if(id === 'space') state.player={x:450,y:435,w:65,h:35}
  if(id === 'bricks') {state.player={x:450,y:455,w:135,h:16};state.ball={x:450,y:405,vx:220,vy:-230,r:10};state.objects=Array.from({length:24},(_,i)=>({x:90+(i%8)*91,y:68+Math.floor(i/8)*34,w:81,h:23,color:i%6,alive:true}))}
  if(id === 'fishing') {state.player={x:450,y:60,w:65,h:35};state.hook={x:450,y:95,active:false,retract:false,treasure:null};state.objects=Array.from({length:10},(_,i)=>({id:i,x:random(rng,70,830),y:random(rng,235,445),vx:random(rng,-30,30),w:34,h:34,alive:true,emoji:['⭐','💎','🐚'][i%3]}))}
  return state
}
export function act(state,x=state.aim.x,y=state.aim.y) {
  if(state.status !== 'playing') return
  if(state.id === 'ducks' || state.id === 'bubbles') {
    const hit=state.objects.find(object=>!object.hit && Math.hypot(object.x-x,object.y-y)<object.r+12)
    if(hit) {hit.hit=true;state.score++;if(state.score >= (state.id === 'ducks'?12:20)) state.status='won'}
  }
  if(state.id === 'race') state.player.x=[300,450,600].reduce((closest,lane)=>Math.abs(lane-x)<Math.abs(closest-x)?lane:closest,450)
  if(state.id === 'fishing' && !state.hook.active) {state.player.x=clamp(x,60,840);state.hook={x:state.player.x,y:95,active:true,retract:false,treasure:null}}
}
export function tick(state,dt,input={},rng=Math.random) {
  if(state.status !== 'playing') return state
  dt=Math.min(dt,.04);state.time+=dt;state.spawn+=dt
  const direction=Number(Boolean(input.right))-Number(Boolean(input.left))
  if(state.id === 'ducks' || state.id === 'bubbles') {
    state.aim.x=clamp(state.aim.x+direction*390*dt,25,875)
    state.aim.y=clamp(state.aim.y+(Number(Boolean(input.down))-Number(Boolean(input.up)))*300*dt,30,460)
    if(state.spawn>.75) {state.spawn=0;const duck=state.id==='ducks';const side=rng()>.5;state.objects.push({x:duck?(side?-40:940):random(rng,70,830),y:duck?random(rng,85,330):540,r:duck?31:random(rng,24,39),vx:duck?(side?1:-1)*random(rng,95,165):random(rng,-15,15),vy:duck?random(rng,-12,12):-random(rng,50,95),color:Math.floor(rng()*5),hit:false})}
    state.objects.forEach(object=>{object.x+=object.vx*dt;object.y+=object.vy*dt})
    state.objects=state.objects.filter(object=>!object.hit && object.x>-100 && object.x<1000 && object.y>-60)
    if(state.time>=40 && state.status==='playing') state.status='lost'
  }
  if(state.id === 'platform') {
    const player=state.player;player.vx=direction*230
    if(input.jump && player.grounded) {player.vy=-490;player.grounded=false}
    const previousBottom=player.y+player.h
    player.vy+=1100*dt;player.x=clamp(player.x+player.vx*dt,0,2290);player.y+=player.vy*dt;player.grounded=false
    for(const platform of state.platforms) if(player.vy>=0 && previousBottom<=platform.y+4 && player.y+player.h>=platform.y && player.x+player.w>platform.x && player.x<platform.x+platform.w) {player.y=platform.y-player.h;player.vy=0;player.grounded=true;if(platform.y>=420) state.checkpoint=platform.x+20}
    for(const coin of state.coins) if(!coin.collected && overlap(player,coin)) {coin.collected=true;state.score++}
    if(player.y>560) {state.lives--;if(state.lives<=0) state.status='lost';else {player.x=state.checkpoint;player.y=300;player.vy=0}}
    state.camera=clamp(player.x-280,0,1450)
    if(player.x>2190) state.status='won'
  }
  if(state.id === 'race' || state.id === 'space') {
    const race=state.id==='race';const player=state.player
    player.x=clamp(player.x+direction*(race?320:410)*dt,race?270:40,race?630:860)
    if(input.pointerX != null) player.x=clamp(input.pointerX,race?270:40,race?630:860)
    if(state.spawn>(race ? .95 : .6)) {state.spawn=0;state.objects.push({x:race?[300,450,600][Math.floor(rng()*3)]:random(rng,45,855),y:-40,w:race?48:32,h:race?50:32,good:!race&&rng()>.3,v:race?185+state.time*2:135+state.time,color:Math.floor(rng()*5)})}
    for(const object of state.objects) {object.y+=object.v*dt;if(!object.hit && overlap({x:player.x-player.w/2,y:player.y,w:player.w,h:player.h},{...object,x:object.x-object.w/2})) {object.hit=true;if(object.good) state.score++;else state.lives--}}
    state.objects=state.objects.filter(object=>!object.hit&&object.y<550)
    if(state.lives<=0) state.status='lost';else if(race&&state.time>=40 || !race&&state.score>=15) state.status='won'
    if(!race&&state.time>=65&&state.status==='playing') state.status='lost'
    if(race) state.score=Math.floor(state.time*10)
  }
  if(state.id === 'bricks') {
    const paddle=state.player;const ball=state.ball;paddle.x=clamp(input.pointerX ?? paddle.x+direction*500*dt,paddle.w/2,WIDTH-paddle.w/2)
    const oldY=ball.y;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt
    if(ball.x<ball.r) {ball.x=ball.r;ball.vx=Math.abs(ball.vx)}
    if(ball.x>WIDTH-ball.r) {ball.x=WIDTH-ball.r;ball.vx=-Math.abs(ball.vx)}
    if(ball.y<ball.r) {ball.y=ball.r;ball.vy=Math.abs(ball.vy)}
    if(ball.vy>0&&oldY+ball.r<=paddle.y&&ball.y+ball.r>=paddle.y&&Math.abs(ball.x-paddle.x)<paddle.w/2+ball.r) {ball.vy=-Math.abs(ball.vy);ball.vx=(ball.x-paddle.x)*4.5;ball.y=paddle.y-ball.r}
    for(const brick of state.objects) if(brick.alive&&overlap({x:ball.x-ball.r,y:ball.y-ball.r,w:ball.r*2,h:ball.r*2},brick)) {brick.alive=false;ball.vy=-ball.vy;state.score++;break}
    if(ball.y>520) {state.lives--;ball.x=paddle.x;ball.y=400;ball.vx=220;ball.vy=-230}
    if(state.lives<=0) state.status='lost';else if(state.score===24) state.status='won'
  }
  if(state.id === 'fishing') {
    const hook=state.hook
    if(!hook.active) {state.player.x=clamp(state.player.x+direction*300*dt,60,840);hook.x=state.player.x}
    for(const object of state.objects) {object.x+=object.vx*dt;if(object.x<30||object.x>870) object.vx=-object.vx}
    if(hook.active) {
      hook.y+=(hook.retract?-245:210)*dt
      if(!hook.retract) {const treasure=state.objects.find(object=>object.alive&&Math.hypot(object.x-hook.x,object.y-hook.y)<32);if(treasure) {treasure.alive=false;hook.treasure=treasure.emoji;hook.retract=true}}
      if(hook.y>465) hook.retract=true
      if(hook.y<=95) {if(hook.treasure) state.score++;hook.active=false;hook.y=95;hook.treasure=null}
    }
    if(state.score>=8) state.status='won'
    else if(state.time>=60) state.status='lost'
  }
  return state
}
