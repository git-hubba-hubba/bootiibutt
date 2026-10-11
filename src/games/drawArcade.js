import { WIDTH, HEIGHT } from './arcadeEngine'
const palette=['#ffce70','#ff79ae','#7ee0de','#b59aff','#90e8aa','#83baf9']
const rect=(ctx,x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
const circle=(ctx,x,y,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
const emoji=(ctx,text,x,y,size=40)=>{ctx.font=`${size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x,y)}
export function drawGame(ctx,state) {
  const {id}=state
  const dark=['space','bricks'].includes(id)
  const gradient=ctx.createLinearGradient(0,0,0,HEIGHT);gradient.addColorStop(0,dark?'#171c4b':id==='fishing'?'#9ce9fa':'#aeeaff');gradient.addColorStop(1,dark?'#342b65':id==='fishing'?'#247eac':'#e9fff0');ctx.fillStyle=gradient;ctx.fillRect(0,0,WIDTH,HEIGHT)
  if(dark) {for(let i=0;i<45;i++) circle(ctx,(i*137)%900,(i*79)%500,i%3===0?2:1,'#ffffff66')}
  else {circle(ctx,790,70,35,'#fff3ac');for(let i=0;i<3;i++) {const x=130+i*270;circle(ctx,x,75,27,'#fffdf4');circle(ctx,x+30,65,35,'#fffdf4');rect(ctx,x-18,75,92,20,'#fffdf4')}}
  if(id==='ducks') {rect(ctx,0,390,900,110,'#84c876');rect(ctx,0,445,900,55,'#69b9d6');for(let i=0;i<8;i++) emoji(ctx,'🌿',30+i*120,405,50)}
  if(id==='bubbles') {rect(ctx,0,465,900,35,'#d5e5c3');emoji(ctx,'🪸',100,453,68);emoji(ctx,'🪸',800,453,65)}
  if(id==='ducks'||id==='bubbles') {
    for(const object of state.objects) {if(id==='ducks') {ctx.save();ctx.translate(object.x,object.y);if(object.vx<0)ctx.scale(-1,1);emoji(ctx,'🦆',0,0,55);ctx.restore()} else {circle(ctx,object.x,object.y,object.r,palette[object.color]);circle(ctx,object.x-8,object.y-10,object.r*.23,'#ffffffaa');ctx.strokeStyle='#ffffffa0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(object.x,object.y,object.r,0,Math.PI*2);ctx.stroke()}}
    ctx.strokeStyle='#ffffffdd';ctx.lineWidth=2;ctx.beginPath();ctx.arc(state.aim.x,state.aim.y,19,0,Math.PI*2);ctx.moveTo(state.aim.x-27,state.aim.y);ctx.lineTo(state.aim.x+27,state.aim.y);ctx.moveTo(state.aim.x,state.aim.y-27);ctx.lineTo(state.aim.x,state.aim.y+27);ctx.stroke()
  }
  if(id==='platform') {
    ctx.save();ctx.translate(-state.camera,0)
    for(const platform of state.platforms) {rect(ctx,platform.x,platform.y,platform.w,platform.h,'#ba8d66');rect(ctx,platform.x,platform.y,platform.w,9,'#71be76');for(let x=platform.x+12;x<platform.x+platform.w;x+=32) rect(ctx,x,platform.y+20,15,5,'#a87856')}
    for(const coin of state.coins) if(!coin.collected) {circle(ctx,coin.x+11,coin.y+11,12,'#ffca47');circle(ctx,coin.x+11,coin.y+11,7,'#ffe78a')}
    rect(ctx,2220,270,7,160,'#fffdf0');ctx.fillStyle='#ffc55f';ctx.beginPath();ctx.moveTo(2227,270);ctx.lineTo(2290,292);ctx.lineTo(2227,317);ctx.fill()
    const p=state.player;emoji(ctx,'🦊',p.x+p.w/2,p.y+p.h/2,42)
    emoji(ctx,'🍄',370,416,32);emoji(ctx,'🌻',1670,405,42);ctx.restore()
  }
  if(id==='race') {
    rect(ctx,0,170,900,330,'#88bd7a');rect(ctx,220,0,460,500,'#41465c');rect(ctx,225,0,7,500,'#f9f2da');rect(ctx,668,0,7,500,'#f9f2da')
    for(let lane=0;lane<2;lane++) for(let y=-70;y<550;y+=100) rect(ctx,373+lane*150,(y+state.time*190)%600-50,6,45,'#e3dfbc')
    for(const object of state.objects) emoji(ctx,'🚧',object.x,object.y+25,53)
    drawCar(ctx,state.player.x,state.player.y+25)
  }
  if(id==='space') {for(const object of state.objects) emoji(ctx,object.good?'⭐':'☄️',object.x,object.y+16,38);emoji(ctx,'🛸',state.player.x,state.player.y+15,68);emoji(ctx,'🪐',765,92,65)}
  if(id==='bricks') {for(const brick of state.objects) if(brick.alive) {rect(ctx,brick.x,brick.y,brick.w,brick.h,palette[brick.color]);rect(ctx,brick.x+3,brick.y+3,brick.w-6,4,'#ffffff44')};rect(ctx,state.player.x-state.player.w/2,state.player.y,state.player.w,state.player.h,'#7ee4df');circle(ctx,state.ball.x,state.ball.y,state.ball.r,'#ffec9d')}
  if(id==='fishing') {
    rect(ctx,0,125,900,375,'#2e91bd');rect(ctx,0,125,900,9,'#90dce8');for(let i=0;i<7;i++) emoji(ctx,'🌿',50+i*145,480,45)
    for(const object of state.objects) if(object.alive) emoji(ctx,object.emoji,object.x,object.y,35)
    emoji(ctx,'🛶',state.player.x,95,75)
    ctx.strokeStyle='#ffe6a6';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(state.hook.x,95);ctx.lineTo(state.hook.x,state.hook.y);ctx.stroke();emoji(ctx,state.hook.treasure||'🧲',state.hook.x,state.hook.y,29)
  }
}
function drawCar(ctx,x,y) {rect(ctx,x-22,y-35,44,70,'#ff6f91');rect(ctx,x-16,y-21,32,23,'#b2ecff');rect(ctx,x-29,y-24,8,20,'#25304c');rect(ctx,x+21,y-24,8,20,'#25304c');rect(ctx,x-29,y+15,8,20,'#25304c');rect(ctx,x+21,y+15,8,20,'#25304c');rect(ctx,x-10,y+11,20,21,'#e95079')}
