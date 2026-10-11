import test from 'node:test'
import assert from 'node:assert/strict'
import { arcadeGames } from '../../src/data/arcade.js'
import { createGame, tick, act } from '../../src/games/arcadeEngine.js'
import { createMaze, mazeMove, stackOverlap, cityComplete, garageLayout } from '../../src/games/puzzleRules.js'
function seeded(seed=123) {return ()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646}}
test('14 distinct playable games include 12 additions to the originals',()=>{assert.equal(arcadeGames.length,14);assert.equal(new Set(arcadeGames.map(game=>game.id)).size,14);assert.equal(arcadeGames.filter(game=>!['memory','numbers'].includes(game.id)).length,12);assert.ok(arcadeGames.every(game=>game.controls&&game.goal))})
test('duck and bubble targets can be tagged, and each has a finish and timeout',()=>{
 for(const [id,goal] of [['ducks',12],['bubbles',20]]) {
  const game=createGame(id)
  for(let i=0;i<goal;i++){game.objects.push({x:100,y:100,r:30,hit:false});act(game,100,100)}
  assert.equal(game.score,goal);assert.equal(game.status,'won')
  const timeout=createGame(id);timeout.time=39.99;tick(timeout,.02,{},seeded());assert.equal(timeout.status,'lost')
 }
})
test('platform adventure is traversable using its real jump physics',()=>{
 const game=createGame('platform')
 for(let i=0;i<15000&&game.status==='playing';i++) tick(game,1/60,{right:true,jump:true})
 assert.equal(game.status,'won');assert.ok(game.player.x>2190)
})
test('platform falls consume a life and return to a checkpoint',()=>{
 const game=createGame('platform');game.player.y=570;tick(game,.016)
 assert.equal(game.lives,2);assert.equal(game.player.x,50);assert.equal(game.player.y,300)
})
test('racing has a reachable finish and collisions consume attempts',()=>{
 const game=createGame('race')
 for(let i=0;i<2500&&game.status==='playing';i++)tick(game,1/60,{},()=>0)
 assert.equal(game.status,'won');assert.ok(game.score>=400)
 const crash=createGame('race')
 for(let i=0;i<3;i++){crash.objects.push({x:450,y:405,w:48,h:50,v:0});tick(crash,.016)}
 assert.equal(crash.status,'lost');assert.equal(crash.lives,0)
})
test('catching stars wins and meteors consume attempts',()=>{
 const game=createGame('space')
 for(let i=0;i<15;i++){game.objects.push({x:450,y:435,w:32,h:32,v:0,good:true});tick(game,.016)}
 assert.equal(game.status,'won')
 const meteor=createGame('space');meteor.objects.push({x:450,y:435,w:32,h:32,v:0,good:false});tick(meteor,.016);assert.equal(meteor.lives,2)
})
test('brick collision scores and paddle collision returns the ball upward',()=>{
 const game=createGame('bricks'),brick=game.objects[0]
 game.ball={x:brick.x+40,y:brick.y+brick.h+11,vx:0,vy:-230,r:10};tick(game,.04)
 assert.equal(game.score,1);assert.equal(brick.alive,false)
 game.ball={x:450,y:445,vx:0,vy:200,r:10};tick(game,.03);assert.ok(game.ball.vy<0)
})
test('magnet fishing can retrieve eight treasures within the round',()=>{
 const game=createGame('fishing')
 game.objects=Array.from({length:8},()=>({x:450,y:180,vx:0,w:34,h:34,alive:true,emoji:'💎'}))
 for(let i=0;i<12000&&game.status==='playing';i++){if(!game.hook.active)act(game,450,180);tick(game,1/60)}
 assert.equal(game.score,8);assert.equal(game.status,'won')
})
test('tower overlap handles aligned, partial, and missed blocks',()=>{
 assert.deepEqual(stackOverlap({x:15,w:70},{x:15,w:70}),{x:15,w:70})
 assert.deepEqual(stackOverlap({x:15,w:70},{x:60,w:70}),{x:60,w:25})
 assert.equal(stackOverlap({x:15,w:20},{x:60,w:20}).w,0)
})
test('every generated maze has connected, consistent paths to the treasure',()=>{
 for(let seed=1;seed<=30;seed++){
  const cells=createMaze(8,seeded(seed)),seen=new Set([0]),queue=[0]
  while(queue.length){const i=queue.shift();for(let d=0;d<4;d++){const next=mazeMove(cells,i,d);if(next!==i){assert.ok(next>=0&&next<64);assert.equal(cells[next].walls[(d+2)%4],false);if(!seen.has(next)){seen.add(next);queue.push(next)}}}}
  assert.equal(seen.size,64);assert.ok(seen.has(63))
 }
})
test('garage flags are reachable around the barriers',()=>{
 const {width,height,start,barriers,flags}=garageLayout,seen=new Set([start]),queue=[start]
 while(queue.length){const cell=queue.shift(),x=cell%width,y=Math.floor(cell/width);for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=x+dx,ny=y+dy,next=ny*width+nx;if(nx>=0&&nx<width&&ny>=0&&ny<height&&!barriers.includes(next)&&!seen.has(next)){seen.add(next);queue.push(next)}}}
 assert.ok(flags.every(flag=>seen.has(flag)))
})
test('city goal requires the complete neighborhood',()=>{assert.equal(cityComplete(['🏠','🛣️','🌳']),false);assert.equal(cityComplete(['🏠','🏠','🏠','🛣️','🛣️','🛣️','🛣️','🌳','🌳']),true)})
