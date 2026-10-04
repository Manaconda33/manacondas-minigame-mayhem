// Opt-in constrained polygon triangulation experiment. No runtime mutation.
import {createServer} from 'vite';
import * as THREE from 'three';
import {writeFileSync} from 'node:fs';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {NeonGrid}=await server.ssrLoadModule('/src/game/track/NeonGrid.ts');
 const {neonGridRibbon}=await server.ssrLoadModule('/src/game/track/NeonGridGeometry.ts');
 const g=neonGridRibbon(new NeonGrid()),v=g.getAttribute('position').array,ind=Array.from(g.index.array);
 const triangles=[];
 // Extract the patch inside half by its vertex set (centers 3074..3124,
 // boundary even original vertices, appended grade vertices >=3125).
 for(let i=0;i<ind.length;i+=3){const f=ind.slice(i,i+3);if(f.every(k=>k>=3074||(k%2===0&&k>=2440&&k<=2540)))triangles.push(f);}
 const edges=new Map();for(const face of triangles)for(let j=0;j<3;j++){const a=face[j],b=face[(j+1)%3],key=[a,b].sort((a,b)=>a-b).join(',');const old=edges.get(key);edges.set(key,old?{...old,n:old.n+1}:{a,b,n:1});}
 const perimeter=[...edges.values()].filter(e=>e.n===1),next=new Map(perimeter.map(e=>[e.a,e.b]));
 let first=perimeter[0].a,i=first;const contour=[];do{contour.push(i);i=next.get(i);if(i===undefined)throw Error('open contour');}while(i!==first);
 // Restore every authored centerline row, including vertices Earcut omitted.
 for(let j=0;j<contour.length;j++){const a=contour[j],b=contour[(j+1)%contour.length];if(a>=3074&&a<=3124&&b>=3074&&b<=3124&&a-b>1){const missing=[];for(let k=a-1;k>b;k--)missing.push(k);contour.splice(j+1,0,...missing);j+=missing.length;}}
 const p=contour.map(k=>new THREE.Vector3().fromArray(v,k*3)),n=p.length;
 const cross=(a,b,c)=>(b.z-a.z)*(c.x-a.x)-(b.x-a.x)*(c.z-a.z);
 const inside=(x,z)=>{let yes=false;for(let i=0,j=n-1;i<n;j=i++){const a=p[i],b=p[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)yes=!yes;}return yes;};
 const diagonal=Array.from({length:n},()=>Array(n).fill(false));
 for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){let valid=b===a+1||(a===0&&b===n-1);if(!valid){valid=inside((p[a].x+p[b].x)/2,(p[a].z+p[b].z)/2);for(let c=0;c<n&&valid;c++){const d=(c+1)%n;if([c,d].includes(a)||[c,d].includes(b))continue;if(cross(p[a],p[b],p[c])*cross(p[a],p[b],p[d])<0&&cross(p[c],p[d],p[a])*cross(p[c],p[d],p[b])<0)valid=false;}}diagonal[a][b]=diagonal[b][a]=valid;}
 const cost=Array.from({length:n},()=>Array(n).fill(Infinity)),split=Array.from({length:n},()=>Array(n).fill(-1));
 for(let i=0;i<n-1;i++)cost[i][i+1]=0;
 for(let span=2;span<n;span++)for(let a=0;a+span<n;a++){const b=a+span;if(!diagonal[a][b])continue;for(let k=a+1;k<b;k++){if(!diagonal[a][k]||!diagonal[k][b]||cross(p[a],p[k],p[b])<=1e-8)continue;const normal=p[k].clone().sub(p[a]).cross(p[b].clone().sub(p[a]));const slope=Math.acos(THREE.MathUtils.clamp(normal.y/normal.length(),-1,1))*180/Math.PI;const candidate=Math.max(slope,cost[a][k],cost[k][b]);if(candidate<cost[a][b]){cost[a][b]=candidate;split[a][b]=k;}}}
 const faces=[];const recover=(a,b)=>{if(b<=a+1)return;const k=split[a][b];if(k<0)throw Error('No triangulation');faces.push([contour[a],contour[k],contour[b]]);recover(a,k);recover(k,b);};recover(0,n-1);
 const report={n,maxSlope:cost[0][n-1],contour,faces};writeFileSync(process.argv[2]??'/tmp/neon-triangulation.json',JSON.stringify(report));console.log({n,maxSlope:report.maxSlope,faces:faces.length});g.dispose();
}finally{await server.close();}
