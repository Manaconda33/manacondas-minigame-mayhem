import {createServer} from 'vite';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {writeFileSync} from 'node:fs';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 await RAPIER.init();
 const {NeonGrid}=await server.ssrLoadModule('/src/game/track/NeonGrid.ts');
 const {createNeonGridColliders}=await server.ssrLoadModule('/src/game/track/NeonGridCollision.ts');
 const {KartController}=await server.ssrLoadModule('/src/game/physics/KartController.ts');
 const {AiDriver}=await server.ssrLoadModule('/src/game/ai/AiDriver.ts');
 const {createKartTuning}=await server.ssrLoadModule('/src/config/kartTuning.ts');
 const {characterById}=await server.ssrLoadModule('/src/characters/manifest.ts');
 const {guardrailContact}=await server.ssrLoadModule('/src/game/track/GuardrailSystem.ts');
 const {crossesForwardCheckpointGate}=await server.ssrLoadModule('/src/game/race/CheckpointGate.ts');
 const reports=[];
 for(const spec of [{name:"current",handles:0,a:.1112341368367766,b:.17852464824355127,width:6},{name:"candidate",handles:12}]){
  const {handles}=spec,a=spec.a??.101,b=spec.b??.215;
  const track=new NeonGrid(),c=track.curve,L=c.getLength();
  const start=c.getPointAt(a),end=c.getPointAt(b);
  const curve=handles===0?new THREE.LineCurve3(start,end):new THREE.CubicBezierCurve3(start,start.clone().addScaledVector(c.getTangentAt(a),handles),end.clone().addScaledVector(c.getTangentAt(b),-handles),end);
  curve.arcLengthDivisions=512;curve.updateArcLengths();const length=curve.getLength(),halfWidth=spec.width??4;
  const samples=Array.from({length:129},(_,i)=>curve.getPointAt(i/128));
  function project(pos){let best=Infinity,frac=0,point;for(let i=0;i<128;i++){const s=samples[i],d=samples[i+1].clone().sub(s),f=THREE.MathUtils.clamp(pos.clone().sub(s).dot(d)/d.lengthSq(),0,1),p=s.clone().addScaledVector(d,f),dist=pos.distanceToSquared(p);if(dist<best){best=dist;frac=(i+f)/128;point=p;}}const tangent=curve.getTangentAt(frac),right=new THREE.Vector3(tangent.z,0,-tangent.x).normalize(),offset=pos.clone().sub(point).dot(right),progress=THREE.MathUtils.lerp(a,b,frac);return {index:Math.floor(progress*384),progress,point,tangent,lateralOffset:offset,lateralDistance:Math.abs(offset),surface:'asphalt',pathId:'billboard-gap',frac};}
  let mouth=null,clearance=null;
  for(let d=2;d<length-15;d+=.5){const p=curve.getPointAt(d/length),t=curve.getTangentAt(d/length),right=new THREE.Vector3(t.z,0,-t.x).normalize();const edges=[-4.15,4.15].map(v=>track.projectMain(p.clone().addScaledVector(right,v)).lateralDistance-6);if(Math.min(...edges)>=.5){mouth=d;clearance=Math.min(...edges);break;}}
  if(spec.name==='current')mouth=7;
  const geometry={name:spec.name,handles,pathLength:+length.toFixed(2),distanceSaved:+((b-a)*L-length).toFixed(2),mouthDistance:mouth,minimumFrameMainClearance:clearance===null?null:+clearance.toFixed(2),entry:a,rejoin:b,rejoinGate3Meters:+((.222-b)*L).toFixed(2),gate3Gate4Meters:+((88/384-.222)*L).toFixed(2)};
  for(const character of ['aa-01','aa-09'])for(const approachSpeed of [12,22,30])for(const mode of ['main','off','on']){
   if(mode==='main'&&spec.name!=='current')continue;
   const world=new RAPIER.World({x:0,y:-18,z:0}),cleanup=createNeonGridColliders(world,track);
   // Remove the current, accepted straight plaza only in this throwaway world.
   const old=[];world.colliders.forEach(x=>old.push(x));world.removeCollider(old.at(-1),true);
   if(mode!=='main'){
    const verts=[],tri=[];for(let i=0;i<=128;i++){const p=samples[i],t=curve.getTangentAt(i/128),r=new THREE.Vector3(t.z,0,-t.x).normalize();for(const lane of [-halfWidth,halfWidth])verts.push(...p.clone().addScaledVector(r,lane).toArray());if(i<128){const k=i*2;tri.push(k,k+2,k+1,k+1,k+2,k+3);}}
    world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(verts),new Uint32Array(tri),RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES|RAPIER.TriMeshFlags.ORIENTED).setFriction(1));
   }
   const route=Object.create(track);let active=false,finishedBranch=false,events=0,entered=false,contacts=0,maxLateral=0,minHeightGap=Infinity;
   route.prepareAiRoute=()=>{};
   route.project=pos=>active?project(pos):track.projectMain(pos);
   route.projectSurface=route.project;
   route.boundaryHalfWidthAt=p=>{
    if(mode!=='main'&&!finishedBranch){const g=project(p.point.clone().addScaledVector(new THREE.Vector3(p.tangent.z,0,-p.tangent.x).normalize(),p.lateralOffset));if(g.lateralDistance<=halfWidth+1&&(g.frac*length<Math.max(35,(mouth??20)+8)||g.frac*length>length-25))return null;}
    return active?halfWidth:track.halfWidthAt(p.progress);
   };
   route.navigationAt=(pos,d)=>{
    const p=track.projectMain(pos);
    if(mode!=='main'&&!finishedBranch&&(active||p.progress>=a-20/L)){const g=project(pos),dist=g.frac*length+d;if(dist<=length)return {point:curve.getPointAt(dist/length),tangent:curve.getTangentAt(dist/length),halfWidth,pathId:'billboard-gap'};return {point:c.getPointAt(b+(dist-length)/L),tangent:c.getTangentAt(b+(dist-length)/L),halfWidth:6};}
    const i=(p.index+Math.max(1,Math.round(d/track.sampleSpacing)))%384;return {point:track.samples[i].clone(),tangent:track.tangents[i].clone(),halfWidth:6};
   };
   const stats=characterById(character).stats,tuning=createKartTuning(stats),spawn=.07,p=c.getPointAt(spawn),t=c.getTangentAt(spawn),kart=new KartController(world,tuning,stats,p,Math.atan2(t.x,t.z)),driver=new AiDriver(route,{laneOffset:0,pace:.6,aggression:.6},tuning.maxSpeed);
   for(let i=0;i<60;i++)world.step();kart.body.setLinvel({x:t.x*approachSpeed,y:0,z:t.z*approachSpeed},true);
   const target=.236,gates=[c.getPointAt(.222),c.getTangentAt(.222)];let gate3=false,endSeconds=null,minSpeed=Infinity;const gateSequence=[];
   const probeGates=[{id:2,p:.087},{id:3,p:.222},{id:4,p:88/384}];
   for(let i=0;i<60*30;i++){
    const before=kart.position();kart.update(driver.input(before,kart.forward(),kart.speedMetersPerSecond()),route.project(before).surface,1/60);world.step();const after=kart.position();
    if(mode!=='main'&&!finishedBranch){
     const f=(mouth??20)/length,mp=curve.getPointAt(f),mt=curve.getTangentAt(f).setY(0).normalize(),br=before.clone().sub(mp).dot(mt),ar=after.clone().sub(mp).dot(mt);
     if(!active&&br<0&&ar>=0&&project(after).lateralDistance<=halfWidth&&Math.abs(after.y-project(after).point.y)<1.5){active=true;entered=true;}
     const et=curve.getTangentAt(1).setY(0).normalize();if(active&&before.clone().sub(end).dot(et)<0&&after.clone().sub(end).dot(et)>=0&&track.projectMain(after).lateralDistance<=6){active=false;finishedBranch=true;events++;if(mode==='on')kart.retainPlanarVelocity(.82);}
    }
    if(active){const g=project(after);maxLateral=Math.max(maxLateral,g.lateralDistance);minHeightGap=Math.min(minHeightGap,after.y-g.point.y);}
    const contact=guardrailContact(route,after,1.15);if(contact){contacts++;kart.resolveStaticBarrierCollision(contact.inwardNormal,contact.penetration,.82,.22);}
    minSpeed=Math.min(minSpeed,kart.speedMetersPerSecond());
    if(crossesForwardCheckpointGate(before,after,gates[0],gates[1],13,1.5))gate3=true;
    for(const gate of probeGates)if(crossesForwardCheckpointGate(before,after,c.getPointAt(gate.p),c.getTangentAt(gate.p),13,1.5))gateSequence.push(gate.id);
    const q=c.getPointAt(target),qt=c.getTangentAt(target).setY(0).normalize();if(before.clone().sub(q).dot(qt)<0&&after.clone().sub(q).dot(qt)>=0&&track.projectMain(after).lateralDistance<=6){endSeconds=(i+1)/60;break;}
   }
   reports.push({...geometry,character,approachSpeed,mode,seconds:endSeconds,entered,events,gate3,gateSequence,contacts,maxLateral:+maxLateral.toFixed(2),minHeightGap:Number.isFinite(minHeightGap)?+minHeightGap.toFixed(2):null,minSpeed:+minSpeed.toFixed(2)});world.free();
  }
 }
 const result={method:'Throwaway curved-route probe: unchanged real KartController/Rapier/AiDriver, aa-01/aa-09, 12/22/30 m/s at progress .07, no items/pack or body correction. Temporary preselected route adapter, curved support, mouth and once-only exit; proposed gate2=.087, gate3=.222, accepted gate4=88/384. No test of original live choice/traversal or full checkpoint footprint separation. Not the live RacerTrack, full lap, gameplay savings or owner acceptance.',reports};
 writeFileSync('/tmp/billboard-relocation-probe.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await server.close();}
