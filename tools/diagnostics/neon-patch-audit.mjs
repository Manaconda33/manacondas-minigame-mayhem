// Independent invariant audit; no runtime mutations or test threshold changes.
import {createServer} from 'vite';
import * as THREE from 'three';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {NeonGrid}=await server.ssrLoadModule('/src/game/track/NeonGrid.ts');
 const {neonGridRibbon}=await server.ssrLoadModule('/src/game/track/NeonGridGeometry.ts');
 const track=new NeonGrid(),g=neonGridRibbon(track),v=g.getAttribute('position'),ind=Array.from(g.index.array);
 const key=f=>[...f].sort((a,b)=>a-b).join(',');
 const current=new Set();const edges=new Map();const faces=[];
 for(let i=0;i<ind.length;i+=3){const f=ind.slice(i,i+3);faces.push(f);current.add(key(f));for(let j=0;j<3;j++){const e=key([f[j],f[(j+1)%3]]);edges.set(e,(edges.get(e)||0)+1);}}
 let originalVerticesExact=0,unchangedOutsideFaces=0;
 for(let row=0;row<=1536;row++){
  const p=track.curve.getPointAt(row/1536),t=track.curve.getTangentAt(row/1536),right=new THREE.Vector3(t.z,0,-t.x).normalize();
  for(const side of [-1,1]){const expected=p.clone().addScaledVector(right,side*track.halfWidthAt(row/1536)),actual=new THREE.Vector3().fromBufferAttribute(v,row*2+(side===1?1:0));assert.deepEqual(actual.toArray(),expected.toArray().map(Math.fround));originalVerticesExact++;}
  if(row>=1536||row>=1219&&row<=1270)continue;
  const a=row*2,b=a+2;
  for(const f of [[a,b,a+1],[a+1,b,b+1]]){
   const ps=f.map(k=>{const q=track.curve.getPointAt(Math.floor(k/2)/1536),t=track.curve.getTangentAt(Math.floor(k/2)/1536);return q.addScaledVector(new THREE.Vector3(t.z,0,-t.x).normalize(),(k%2===0?-1:1)*track.halfWidthAt(Math.floor(k/2)/1536));});
   if(ps[1].clone().sub(ps[0]).cross(ps[2].clone().sub(ps[0])).y>0){assert(current.has(key(f)));unchangedOutsideFaces++;}
   else assert(!current.has(key(f)));
  }
 }
 // Exact authored centerline positions AND every adjacent edge remain shared
 // by inside/outside support (two faces), including patch end joins.
 let centerlineEdges=0,maxCenterlineError=0;
 for(let row=1220;row<=1270;row++){
  const k=3074+row-1220,expected=track.curve.getPointAt(row/1536),actual=new THREE.Vector3().fromBufferAttribute(v,k);
  assert.deepEqual(actual.toArray(),expected.toArray().map(Math.fround));maxCenterlineError=Math.max(maxCenterlineError,actual.distanceTo(expected));
  if(row<1270){assert.equal(edges.get(key([k,k+1])),2);centerlineEdges++;}
 }
 // Constrained inside polygon partitions one surface: every internal edge
 // has two incident triangles, and projected area equals polygon area.
 const insideFaces=faces.filter(f=>f.every(k=>k>=3074||(k%2===0&&k>=2440&&k<=2540)));
 const localEdges=new Map();for(const f of insideFaces)for(let j=0;j<3;j++){const e=key([f[j],f[(j+1)%3]]);localEdges.set(e,(localEdges.get(e)||0)+1);}
 assert([...localEdges.values()].every(n=>n===1||n===2));
 const boundary=[...localEdges].filter(([,n])=>n===1).map(([k])=>k.split(',').map(Number));
 const adjacency=new Map();for(const [a,b] of boundary){adjacency.set(a,[...(adjacency.get(a)||[]),b]);adjacency.set(b,[...(adjacency.get(b)||[]),a]);}
 assert([...adjacency.values()].every(a=>a.length===2));
 const contour=[],first=boundary[0][0];let previous=-1,node=first;do{contour.push(node);const next=adjacency.get(node).find(k=>k!==previous);previous=node;node=next;}while(node!==first&&contour.length<=boundary.length);
 assert.equal(contour.length,boundary.length);
 const p=k=>new THREE.Vector3().fromBufferAttribute(v,k);
 const polygonArea=Math.abs(contour.reduce((s,k,i)=>{const a=p(k),b=p(contour[(i+1)%contour.length]);return s+a.x*b.z-b.x*a.z;},0))/2;
 let maxInsideSlope=0;
 const triangleArea=insideFaces.reduce((s,f)=>{const [a,b,c]=f.map(p),normal=b.clone().sub(a).cross(c.clone().sub(a));assert(normal.y>0);maxInsideSlope=Math.max(maxInsideSlope,Math.acos(normal.y/normal.length())*180/Math.PI);return s+normal.y/2;},0);
 assert(Math.abs(polygonArea-triangleArea)<1e-6);
 assert.equal(insideFaces.length,contour.length-2);
 const report={originalVerticesExact,unchangedOutsideFaces,centerlineEdges,maxCenterlineError,insideFaces:insideFaces.length,boundaryVertices:contour.length,polygonArea,triangleArea,maxInsideSlope,allChecksPassed:true};
 writeFileSync(process.argv[2]??'/tmp/neon-patch-audit.json',JSON.stringify(report,null,2)+'\n');console.log(report);g.dispose();
}finally{await server.close();}
