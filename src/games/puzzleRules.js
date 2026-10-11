export function stackOverlap(previous,moving) {
  const x=Math.max(previous.x,moving.x)
  const right=Math.min(previous.x+previous.w,moving.x+moving.w)
  return {x,w:Math.max(0,right-x)}
}
export function createMaze(size=8,rng=Math.random) {
  const cells=Array.from({length:size*size},()=>({walls:[true,true,true,true],visited:false}))
  const stack=[0];cells[0].visited=true
  while(stack.length) {
    const index=stack.at(-1),x=index%size,y=Math.floor(index/size)
    const neighbors=[[x,y-1,0,2],[x+1,y,1,3],[x,y+1,2,0],[x-1,y,3,1]].filter(([nx,ny])=>nx>=0&&ny>=0&&nx<size&&ny<size&&!cells[ny*size+nx].visited)
    if(!neighbors.length){stack.pop();continue}
    const [nx,ny,wall,opposite]=neighbors[Math.floor(rng()*neighbors.length)],next=ny*size+nx
    cells[index].walls[wall]=false;cells[next].walls[opposite]=false;cells[next].visited=true;stack.push(next)
  }
  return cells
}
export function mazeMove(cells,index,direction,size=8) {if(cells[index].walls[direction])return index;return index+[-size,1,size,-1][direction]}
export function cityComplete(tiles) {return tiles.filter(tile=>tile==='🏠').length>=3&&tiles.filter(tile=>tile==='🛣️').length>=4&&tiles.filter(tile=>tile==='🌳').length>=2}
export const garageLayout={width:8,height:5,start:32,flags:[7,15,20,30,35],barriers:[9,10,18,26,5,22]}
