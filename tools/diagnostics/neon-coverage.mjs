import { createServer } from 'vite';
import * as THREE from 'three';
import { writeFileSync } from 'node:fs';
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
  writeFileSync(process.argv[2]??'/tmp/neon-deletions.json',JSON.stringify(report,null,2));
  process.stdout.write(JSON.stringify({retainedFaces:report.retainedFaces,removedFaces:rows.length,clusters},null,2)+'\n');
  geometry.dispose();
} finally {await server.close();}
