import { createServer } from 'vite';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { readFileSync, writeFileSync } from 'node:fs';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {NeonGrid}=await server.ssrLoadModule('/src/game/track/NeonGrid.ts');
 const {neonGridRibbon}=await server.ssrLoadModule('/src/game/track/NeonGridGeometry.ts');
 const {createNeonGridColliders}=await server.ssrLoadModule('/src/game/track/NeonGridCollision.ts');
 const track=new NeonGrid(),g=neonGridRibbon(track),v=g.getAttribute('position').array,ind=g.index.array;
 const triangles=[];
 for(let i=0;i<ind.length;i+=3){const face=Array.from(ind.slice(i,i+3)),points=face.map(k=>new THREE.Vector3().fromArray(v,k*3));const normal=points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).normalize();triangles.push({triangle:i/3,span:Math.floor(Math.min(...face)/2),face,points,normal,slopeDegrees:Math.acos(THREE.MathUtils.clamp(normal.y,-1,1))*180/Math.PI});}
 const originalFaces=new Set();
 for(let row=0;row<1536;row++){const a=row*2,b=a+2;for(const face of [[a,b,a+1],[a+1,b,b+1]])originalFaces.add([...face].sort((a,b)=>a-b).join(','));}
 // Identity against all authored triples catches contour ears and faces whose
 // vertices were appended beyond the original 3,074-vertex ribbon.
 for(const triangle of triangles) triangle.patched=!originalFaces.has([...triangle.face].sort((a,b)=>a-b).join(','));
 const local=triangles.filter(t=>t.patched||(t.span>=1220&&t.span<=1270));
 const steep=local.filter(t=>t.slopeDegrees>20).map(t=>({triangle:t.triangle,span:t.span,progress:track.project(t.points[0].clone().add(t.points[1]).add(t.points[2]).multiplyScalar(1/3)).progress,patched:t.patched,face:t.face,positions:t.points.map(p=>p.toArray()),normal:t.normal.toArray(),slopeDegrees:t.slopeDegrees}));
 const raw=JSON.parse(readFileSync('docs/evidence/2026-10-03-neon-road-contact/reproduction-1.2.json','utf8'));
 const run=raw.reports.find(r=>r.start===0.81);
 await RAPIER.init();const world=new RAPIER.World({x:0,y:-18,z:0}),cleanup=createNeonGridColliders(world,track);world.step();
 const raySamples=[];
 const allHits=(x,z)=>{
  const ray=new THREE.Ray(new THREE.Vector3(x,25,z),new THREE.Vector3(0,-1,0));const hits=[];
  for(const tri of triangles){const hit=ray.intersectTriangle(...tri.points,false,new THREE.Vector3());if(hit)hits.push({triangle:tri.triangle,span:tri.span,y:hit.y,normal:tri.normal.toArray(),slopeDegrees:tri.slopeDegrees});}
  return hits.sort((a,b)=>b.y-a.y);
 };
 for(const row of run.rows.filter(r=>r.i>=10&&r.i<=21)){
  for(const stage of ['before','native']){
   const p=row[stage].position,hits=allHits(p[0],p[2]);
   const native=world.castRayAndGetNormal(new RAPIER.Ray({x:p[0],y:25,z:p[2]},{x:0,y:-1,z:0}),30,true);
   raySamples.push({i:row.i,stage,point:p,progress:track.project(new THREE.Vector3(...p)).progress,hits,native:native?{height:25-native.timeOfImpact,normal:[native.normal.x,native.normal.y,native.normal.z],featureId:native.featureId}:null});
  }
 }
 // Along the actual approach heading and its body/wheel width: spatial samples 0.02m.
 const onset=run.rows.find(r=>r.i===15),center=new THREE.Vector3(...onset.before.position),velocity=new THREE.Vector3(...onset.controller.velocity).setY(0).normalize(),right=new THREE.Vector3(velocity.z,0,-velocity.x);
 const crossSections=[];
 for(const lateral of [-0.72,0,0.72])for(let j=-100;j<=100;j++){
  const along=j*0.02,p=center.clone().addScaledVector(velocity,along).addScaledVector(right,lateral),hits=allHits(p.x,p.z);
  const pr=track.project(p);
  crossSections.push({along,lateral,x:p.x,z:p.z,roadY:pr.point.y,heights:hits.map(h=>h.y),triangles:hits.map(h=>h.triangle),normals:hits.map(h=>h.normal)});
 }
 const grade=[];for(let i=0;i<=120;i++){const progress=0.803+i*0.0001,t=track.curve.getTangentAt(progress);grade.push({progress,y:track.curve.getPointAt(progress).y,gradeDegrees:Math.asin(t.y)*180/Math.PI});}
 const report={source:'current exact Float32 ribbon',inventory:{allFaces:triangles.length,patchedFaces:triangles.filter(t=>t.patched).length,localFaces:local.length,local:local.map(t=>({triangle:t.triangle,face:t.face,patched:t.patched,slopeDegrees:t.slopeDegrees,positions:t.points.map(p=>p.toArray())}))},sampleParameters:{spans:[1220,1270],crossSectionStep:0.02,bodyHalfWidth:0.72,bodyHalfLength:1.18},steep,raySamples,crossSections,grade};
 const rounded=x=>typeof x==='number'?Math.round(x*1e6)/1e6:Array.isArray(x)?x.map(rounded):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,rounded(v)])):x;
 writeFileSync(process.argv[2]??'/tmp/neon-shape.json',JSON.stringify(rounded(report)));
 process.stdout.write(JSON.stringify({steep,incident:raySamples.filter(r=>r.i===15)},null,2)+'\n');
 cleanup();world.free();g.dispose();
}finally{await server.close();}
