import { createServer } from 'vite';
import * as THREE from 'three';
import { writeFileSync } from 'node:fs';
import RAPIER from '@dimforge/rapier3d-compat';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { NeonGrid } = await server.ssrLoadModule('/src/game/track/NeonGrid.ts');
  const { neonGridRibbon } = await server.ssrLoadModule('/src/game/track/NeonGridGeometry.ts');
  const track = new NeonGrid(), count = 1536;
  const geometry = neonGridRibbon(track), vertices = geometry.getAttribute('position').array;
  const retained = new Set();
  const indices = geometry.index.array;
  for (let i=0;i<indices.length;i+=3) retained.add([indices[i],indices[i+1],indices[i+2]].join(','));
  const rows = [], clusters = [];
  for (let span=0;span<count;span++) for (const face of [[span*2,span*2+2,span*2+1],[span*2+1,span*2+2,span*2+3]]) {
    // Independently reconstruct in double precision before Float32 conversion,
    // because the production filter evaluates doubles before setting attributes.
    const points = face.map(index => {
      const progress = Math.floor(index/2)/count, p = track.curve.getPointAt(progress), t = track.curve.getTangentAt(progress);
      return p.addScaledVector(new THREE.Vector3(t.z,0,-t.x).normalize(), (index%2===0?-1:1)*track.halfWidthAt(progress));
    });
    const [a,b,c]=points;
    const normal = b.clone().sub(a).cross(c.clone().sub(a));
    const removed = !retained.has(face.join(','));
    if (removed !== (normal.y<=0)) throw Error('Independent filter parity mismatch at '+span);
    if (!removed) continue;
    const row={ span, progress:span/count, endProgress:(span+1)/count, face, normal:normal.toArray(), doublePositions:points.map(p=>p.toArray()), colliderPositions:face.map(index=>Array.from(vertices.slice(index*3,index*3+3))) };
    rows.push(row);
    let cluster=clusters.at(-1);
    if(!cluster || span>cluster.lastSpan+1){cluster={firstSpan:span,lastSpan:span,faces:0};clusters.push(cluster);}
    cluster.lastSpan=span;cluster.faces++;
  }
  for(const cluster of clusters){
    cluster.progress=[cluster.firstSpan/count,(cluster.lastSpan+1)/count];
    cluster.centerlineLongitudinalSpan=(cluster.progress[1]-cluster.progress[0])*track.curve.getLength();
    const member=rows.filter(r=>r.span>=cluster.firstSpan&&r.span<=cluster.lastSpan);
    const pts=member.flatMap(r=>r.colliderPositions);
    cluster.bounds={min:[0,1,2].map(i=>Math.min(...pts.map(p=>p[i]))),max:[0,1,2].map(i=>Math.max(...pts.map(p=>p[i])))};
  }
  const report={ count, widthAuthority:'track.halfWidthAt', windingOracle:'independent cross product in pre-Float32 coordinates; parity with exact retained production indices', retainedFaces:indices.length/3, removedFaces:rows.length, clusters, rows };
  if (process.argv.includes('--probe')) {
    const { createNeonGridColliders } = await server.ssrLoadModule('/src/game/track/NeonGridCollision.ts');
    await RAPIER.init();
    const world = new RAPIER.World({x:0,y:-18,z:0});
    const cleanup = createNeonGridColliders(world,track); world.step();
    const hitAt = (point) => {
      // Road-only world: no kart/rival collider can be mistaken for support.
      const hit = world.castRayAndGetNormal(new RAPIER.Ray({x:point.x,y:point.y+5,z:point.z},{x:0,y:-1,z:0}),10,true);
      return hit ? {y:point.y+5-hit.timeOfImpact, normal:[hit.normal.x,hit.normal.y,hit.normal.z], featureId:hit.featureId, collider:hit.collider.handle} : null;
    };
    const coverage=[];
    for (const cluster of clusters) {
      const from=cluster.progress[0]-0.005,to=cluster.progress[1]+0.005;
      const steps=Math.ceil((to-from)*track.curve.getLength()/0.1);
      const probes=[],misses=[],excluded=[],footprintMisses=[];
      let footprintProbeCount=0;
      for(let i=0;i<=steps;i++){
        const progress=from+(to-from)*i/steps,p=track.curve.getPointAt(progress),t=track.curve.getTangentAt(progress).setY(0).normalize(),right=new THREE.Vector3(t.z,0,-t.x);
        const half=track.halfWidthAt(progress);
        for(let j=0;j<=Math.round(half*2/0.1);j++){
          const offset=-half+j*0.1,point=p.clone().addScaledVector(right,offset),pr=track.project(point);
          const legal=Math.abs(pr.lateralOffset)<=track.halfWidthAt(pr.progress)+0.0001;
          if(!legal){excluded.push([progress,offset]);continue;}
          const hit=hitAt(point),row=[progress,offset,point.x,point.z,p.y,hit?.y??null];
          probes.push(row);if(!hit)misses.push(row);
        }
        for(const lane of [-3,0,3]) for(const [lx,lz] of [[-0.72,-1.18],[-0.72,1.18],[0.72,-1.18],[0.72,1.18],[-0.55,0.72],[0.55,0.72],[-0.55,-0.72],[0.55,-0.72],[0,0]]){
          const point=p.clone().addScaledVector(right,lane+lx).addScaledVector(t,lz),pr=track.project(point);
          if(Math.abs(pr.lateralOffset)>track.halfWidthAt(pr.progress)+0.0001)continue;
          footprintProbeCount++;
          const hit=hitAt(point);
          if(!hit)footprintMisses.push({progress,lane,lx,lz,point:point.toArray(),localProjection:pr.progress});
        }
      }
      // Refine any misses in world X/Z by +/-0.1m at 0.02m increments. None is inferred from removed faces.
      const refined=[];
      for(const miss of misses)for(let ix=-5;ix<=5;ix++)for(let iz=-5;iz<=5;iz++){
        const point=new THREE.Vector3(miss[2]+ix*0.02,miss[4],miss[3]+iz*0.02),pr=track.project(point);
        if(Math.abs(pr.lateralOffset)>track.halfWidthAt(pr.progress)+0.0001)continue;
        if(!hitAt(point))refined.push(point.toArray());
      }
      const perimeterRefinement=misses.map(miss=>{
        const p=track.curve.getPointAt(miss[0]),t=track.curve.getTangentAt(miss[0]).setY(0).normalize(),right=new THREE.Vector3(t.z,0,-t.x);
        const inwardDistances=[0.001,0.002,0.005,0.01,0.02,0.05,0.1];
        const supportedWithin=inwardDistances.find(d=>hitAt(p.clone().addScaledVector(right,miss[1]-Math.sign(miss[1])*d)))??null;
        return {progress:miss[0],offset:miss[1],supportedWithin};
      });
      const drivableMisses=misses.filter(m=>Math.abs(m[1])<=track.halfWidthAt(m[0])-1.15);
      const heightDeltas=probes.filter(r=>r[5]!==null).map(r=>r[5]-r[4]);
      coverage.push({cluster:cluster.progress,from,to,stepMeters:0.1,probeCount:probes.length,footprintProbeCount,drivableMisses,perimeterRefinement,misses,footprintMisses,refined,excludedCount:excluded.length,minHeightDelta:Math.min(...heightDeltas),maxHeightDelta:Math.max(...heightDeltas),probes});
    }
    report.coverage=coverage;report.rayParameters={originLocalYPlus:5,distance:10,direction:[0,-1,0],world:'production road only, no self or other collider',legal:'exact project lateralOffset within halfWidth',footprint:'center +/-3m lines; cuboid corners and four wheel offsets at local tangent yaw'};
    cleanup();world.free();
  }
  const rounded = x => typeof x==='number'?Math.round(x*1e6)/1e6:Array.isArray(x)?x.map(rounded):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,rounded(v)])):x;
  writeFileSync(process.argv[2]??'/tmp/neon-deletions.json',JSON.stringify(rounded(report)));
  process.stdout.write(JSON.stringify({coverage:report.coverage?.map(({probes,...rest})=>rest),retainedFaces:report.retainedFaces,removedFaces:rows.length,clusters},null,2)+'\n');
  geometry.dispose();
} finally {await server.close();}
