"""Design-only centripetal Catmull-Rom layout; not runtime/gameplay code.

Run with Python 3 and numpy. Writes layout.json, layout.svg and layout.png.
Dense arc length is reported separately from Three.js's default 200-division
curve length and 384 equally spaced race samples.
"""
from pathlib import Path
import json
import math
import numpy as np

ROOT = Path(__file__).resolve().parent
RAW = np.array([
    [0,14,-180], [130,14,-180], [230,14,-175], [280,14,-130],
    [285,14,-60], [275,10,-10], [230,2,25],
    [200,0,25], [160,0,25], [142,0,43], [160,0,61],
    [200,0,61], [235,0,61], [253,0,79], [235,0,97],
    [200,0,97], [160,0,97], [142,0,115], [160,0,133],
    [200,0,133], [255,0,139], [285,0,177], [260,0,215],
    [100,0,215], [-80,0,215], [-190,1,205], [-230,3,155],
    [-225,6,85], [-250,8,63], [-225,9,37], [-210,10,-5],
    [-190,12,-90], [-145,14,-150],
    [-70,14,-178],
], dtype=float)

def point_at(points, t):
    # Barry-Goldman interpolation, closed centripetal parameterization.
    n = len(points)
    f = (t % 1) * n
    i = math.floor(f)
    u = f-i
    p = [points[(i+j)%n] for j in (-1,0,1,2)]
    knots = [0.0]
    for a,b in zip(p,p[1:]):
        knots.append(knots[-1] + np.linalg.norm(b-a)**0.5)
    t0,t1,t2,t3 = knots
    q = t1 + u*(t2-t1)
    def mix(a,b,lo,hi):
        return (hi-q)/(hi-lo)*a + (q-lo)/(hi-lo)*b
    a1=mix(p[0],p[1],t0,t1)
    a2=mix(p[1],p[2],t1,t2)
    a3=mix(p[2],p[3],t2,t3)
    b1=mix(a1,a2,t0,t2)
    b2=mix(a2,a3,t1,t3)
    return mix(b1,b2,t1,t2)

def sample(points, count):
    return np.array([point_at(points,i/count) for i in range(count+1)])

def length(points, count):
    return np.linalg.norm(np.diff(sample(points,count),axis=0),axis=1).sum()

points=RAW.copy()
lo,hi=0.5,1.5
for _ in range(40):
    scale=(lo+hi)/2
    points[:,[0,2]]=RAW[:,[0,2]]*scale
    if length(points,4096)<1450: lo=scale
    else: hi=scale
points[:,[0,2]]=RAW[:,[0,2]]*((lo+hi)/2)
points=np.round(points,3)
dense=sample(points,4096)
arc=np.concatenate(([0.0],np.cumsum(np.linalg.norm(np.diff(dense,axis=0),axis=1))))
total=float(arc[-1])
def at(progress):
    t=np.interp(progress*total,arc,np.linspace(0,1,len(arc)))
    return point_at(points,float(t))
def progress_of_control(i):
    return float(arc[round(i/len(points)*4096)]/total)

# Feature anchors are tied to realized geometry, not old oval percentages.
shortcuts=[]
for id,a,b,width in [('billboard-gap',2,4,6),('service-tunnel',7,20,3.2),('waterfall-dive',27,29,6)]:
    start=progress_of_control(a)
    end=progress_of_control(b)
    route=np.array([at(start),at(end)])
    chord=float(np.linalg.norm(route[1]-route[0]))
    if id=='service-tunnel':
        a,b=route
        route=np.array([a,a+(b-a)*.22,b-(b-a)*.22,b])
        route[1:3,1]=-4
    shortcuts.append(dict(id=id,entryProgress=[start,start+0.005],exitProgress=end,
                          halfWidth=width,points=route.round(3).tolist(),
                          mainDistance=round((end-start)*total,3),
                          chordDistance=round(chord,3),
                          pathPolylineDistance=round(float(np.linalg.norm(np.diff(route,axis=0),axis=1).sum()),3)))

# Common-road checkpoint sites, avoiding all shortcut intervals.
b,t,d=shortcuts
gate_p=[22/total,0.075,b['entryProgress'][0]-0.015,
        b['exitProgress']+0.015,t['entryProgress'][0]-0.015,
        t['exitProgress']+0.015,0.59,0.66,
        d['entryProgress'][0]-0.015,d['exitProgress']+0.015,0.90,0.96]
assert all(a<b for a,b in zip(gate_p,gate_p[1:])), gate_p
gates=[]
for i,p in enumerate(gate_p):
    if i: p=math.floor(p*384)/384
    pos=at(p)
    delta=at((p+0.0001)%1)-at((p-0.0001)%1)
    delta/=np.linalg.norm(delta)
    gates.append(dict(index=i,progress=round(p,8),sampleIndex=math.floor(p*384),
                      position=pos.round(3).tolist(),tangent=delta.round(6).tolist()))
for s in shortcuts:
    assert s['exitProgress']>s['entryProgress'][1]
    assert not any(s['entryProgress'][0]<=g['progress']<=s['exitProgress'] for g in gates)

# Check the entire geometric main curve against every gate footprint, not just
# normalized positions. Future runtime uses the same vertical tolerance.
extra_crossings=[]
for gate in gates:
    center=np.array(gate['position']); tangent=np.array(gate['tangent']);tangent[1]=0;tangent/=np.linalg.norm(tangent)
    offsets=dense-center
    along=offsets@tangent
    for j in np.flatnonzero((along[:-1]<=0)&(along[1:]>0)):
        fraction=-along[j]/(along[j+1]-along[j])
        pos=dense[j]+fraction*(dense[j+1]-dense[j])
        lateral=pos-center;vertical=lateral[1];lateral[1]=0
        lateral-=np.dot(lateral,tangent)*tangent
        progress=float((arc[j]+fraction*(arc[j+1]-arc[j]))/total)
        if np.linalg.norm(lateral)<=13 and abs(vertical)<=1.5:
            delta=abs(progress-gate['progress']);delta=min(delta,1-delta)
            if delta>.01: extra_crossings.append(dict(gate=gate['index'],progress=progress))
assert not extra_crossings, extra_crossings

def crosses(a,b,gate):
    center=np.array(gate['position']);tangent=np.array(gate['tangent']);tangent[1]=0;tangent/=np.linalg.norm(tangent)
    before=float((a-center)@tangent);after=float((b-center)@tangent)
    if before>0 or after<=0 or after<=before:return False
    pos=a+(-before/(after-before))*(b-a)
    offset=pos-center;vertical=offset[1];offset[1]=0
    offset-=np.dot(offset,tangent)*tangent
    return np.linalg.norm(offset)<=13 and abs(vertical)<=1.5

combination_results=[]
for mask in range(8):
    chosen=[s for i,s in enumerate(shortcuts) if mask&(1<<i)]
    path=[];cursor=gate_p[0]+.002
    for shortcut in chosen:
        path.extend(at(p) for p in np.linspace(cursor,shortcut['entryProgress'][0],600))
        for a,b in zip(shortcut['points'],shortcut['points'][1:]):
            path.extend(np.array(a)*(1-f)+np.array(b)*f for f in np.linspace(0,1,80))
        cursor=shortcut['exitProgress']
    path.extend(at(p) for p in np.linspace(cursor,1,1400))
    path.extend(at(p) for p in np.linspace(0,gate_p[0]+.002,80))
    next_gate=1;sequence=[]
    for a,b in zip(path,path[1:]):
        if crosses(np.array(a),np.array(b),gates[next_gate]):
            sequence.append(next_gate);next_gate=(next_gate+1)%12
    assert sequence==list(range(1,12))+[0], (mask,sequence)
    combination_results.append(dict(mask=mask,shortcuts=[s['id'] for s in chosen],gateSequence=sequence))

# Seven sample centers (~26 m) guard entry/rejoin trigger placement.
clearance=[]
for s in shortcuts:
    before=max((g for g in gates if g['progress']<s['entryProgress'][0]),key=lambda g:g['progress'])
    after=min((g for g in gates if g['progress']>s['exitProgress']),key=lambda g:g['progress'])
    clearance.append(dict(shortcut=s['id'],before=before['index'],after=after['index'],
        entryMeters=round((s['entryProgress'][0]-before['progress'])*total,2),
        rejoinMeters=round((after['progress']-s['exitProgress'])*total,2)))

sectors=[dict(id=1,name='Skyline Straight',start=0,end=progress_of_control(7),halfWidth=6,color='#37e6ff'),
         dict(id=2,name='The Undercity',start=progress_of_control(7),end=progress_of_control(20),halfWidth=4.5,color='#ff4fd8'),
         dict(id=3,name='Falls Run',start=progress_of_control(20),end=1,halfWidth=6,color='#ffc63f')]
pads=[.035,.060,.085,.730]
tokens=[dict(id='skyline-line',mainProgress=.095),dict(id='billboard',pathId='billboard-gap',pathProgress=.5),
        dict(id='tunnel',pathId='service-tunnel',pathProgress=.5),
        dict(id='pre-dive',mainProgress=.745),dict(id='finish-reward',mainProgress=.025)]
data=dict(status='proposed design geometry; owner review pending',
          mainLengthDense=round(total,3),mainLength200Divisions=round(float(length(points,200)),3),
          sampleCount=384,sampleSpacing=round(total/384,4),controlPoints=points.tolist(),
          checkpointIndices=[0]+[g['sampleIndex'] for g in gates[1:]],
          sectors=sectors,shortcuts=shortcuts,checkpoints=gates,clearance=clearance,
          boostPadCenters=pads,tokens=tokens,
          validation=dict(lengthInRange=1400<total<1500,orderedDistinctGates=True,
                          noGateSkippedByShortcut=True,higherRejoinProgress=True,
                          unintendedMainCurveGateCrossings=extra_crossings,
                          geometricShortcutCombinations=combination_results,
                          physicalGateCollisionAndLapTests='not yet run; runtime stage'))
(ROOT/'layout.json').write_text(json.dumps(data,indent=2)+'\n')

# A precise geometric figure, with a panel that explicitly states evidence limits.
from matplotlib import pyplot as plt
fig,ax=plt.subplots(figsize=(12,10),facecolor='#080f1d')
ax.set_facecolor('#080f1d')
for sec in sectors:
    curve=np.array([at(p) for p in np.linspace(sec['start'],sec['end'],600)])
    ax.plot(curve[:,0],curve[:,2],color=sec['color'],linewidth=8 if sec['id']!=2 else 6,alpha=.7)
    ax.plot(curve[:,0],curve[:,2],color='#f1f5ff',linewidth=.7,alpha=.6)
for s in shortcuts:
    p=np.array(s['points'])
    ax.plot(p[:,0],p[:,2],color='#f7f0a3',linewidth=2,linestyle='--')
    mid=p.mean(axis=0)
    offset=(-105,-7) if s['id']=='service-tunnel' else (-15,28) if s['id']=='billboard-gap' else (18,0)
    ax.annotate(s['id'].replace('-',' ').upper(),(mid[0],mid[2]),xytext=offset,
                textcoords='offset points',color='#f7f0a3',fontsize=9,
                arrowprops=dict(arrowstyle='-',color='#f7f0a3'))
for g in gates:
    pos=np.array(g['position']); tan=np.array(g['tangent']); right=np.array([tan[2],0,-tan[0]])
    a=pos-right*13; b=pos+right*13
    ax.plot([a[0],b[0]],[a[2],b[2]],color='#f1f5ff',linewidth=1.5)
    ax.text(pos[0],pos[2]-8,str(g['index']),ha='center',va='bottom',fontsize=8,
            color='#ffffff',bbox=dict(boxstyle='round,pad=.2',fc='#172942',ec='none'))
for p in [0.05,0.32,0.65,0.91]:
    a=at(p); b=at(p+.018)
    ax.annotate('',(b[0],b[2]),(a[0],a[2]),arrowprops=dict(arrowstyle='->',color='white',lw=1.3))
for p in pads:
    pos=at(p);ax.scatter([pos[0]],[pos[2]],s=55,marker='s',color='#37e6ff',edgecolor='#071326',zorder=5)
for token in tokens:
    if 'mainProgress' in token:pos=at(token['mainProgress'])
    else:
        s=next(s for s in shortcuts if s['id']==token['pathId'])
        pos=(np.array(s['points'][0])+np.array(s['points'][-1]))/2
    ax.scatter([pos[0]],[pos[2]],s=60,marker='o',color='#ffe29c',edgecolor='#ad8223',zorder=6)
for txt,p in [('SKYLINE\n14 m deck',.10),('UNDERCITY\n0 m street',.43),('FALLS RUN\nclimb to 14 m',.70)]:
    pos=at(p)
    ax.text(pos[0]-30,pos[2]-38 if p!=.43 else pos[2]+22,txt,color='#d2e3fa',fontsize=10,ha='center')
ax.text(0,35,'NEON GRID\nCIRCUIT 02',color='#eaf4ff',ha='center',fontsize=22,fontweight='bold')
ax.text(0,83,'1,450 m design curve\n12 common-road checkpoints\nDashed: shortcuts / squares: boost / circles: tokens',
        color='#abc3de',ha='center',fontsize=11,linespacing=1.5)
ax.set_aspect('equal');ax.invert_yaxis();ax.set_xlabel('x / meters',color='#91a8c1');ax.set_ylabel('z / meters',color='#91a8c1')
ax.tick_params(colors='#91a8c1');ax.grid(alpha=.12,color='#91a8c1')
for spine in ax.spines.values():spine.set_color('#30445d')
fig.suptitle('NEON GRID — REFINED COURSE SHAPE / STAGE 1 REVIEW',color='#dbeeff',fontsize=15,y=.97)
fig.text(.5,.025,'Geometric design only. Road width is exaggerated in this drawing. Driving, colliders, lap gates and jump feasibility remain untested.',
         ha='center',color='#91a8c1',fontsize=9)
fig.tight_layout(rect=[0,.05,1,.94]);fig.savefig(ROOT/'layout.svg',facecolor=fig.get_facecolor());fig.savefig(ROOT/'layout.png',dpi=150,facecolor=fig.get_facecolor())
print(json.dumps({k:data[k] for k in ['mainLengthDense','mainLength200Divisions','sampleSpacing','sectors','clearance','validation']},indent=2))
print(json.dumps(shortcuts,indent=2))
