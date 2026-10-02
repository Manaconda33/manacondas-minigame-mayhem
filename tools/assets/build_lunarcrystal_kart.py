"""Deterministic Moonlit Carriage candidate: -Z nose, real celestial geometry."""
import json
import math
import os
from pathlib import Path
import numpy as np
import build_manaconda_wayfinder as base
import build_keeg_mycelial_majesty as shared

LOD = os.environ.get('LUNAR_KART_LOD', 'LOD0')
SEG, TUBE, LIMIT = {'LOD0': (24, 10, 25000), 'LOD1': (16, 6, 12000),
                    'LOD2': (8, 3, 5000)}[LOD]
ROOT = Path(__file__).resolve().parent
OUT = Path(os.environ.get('LUNAR_KART_OUT', ROOT/'candidates/lunarcrystal-kart-candidate-1-lod0.glb'))
PREVIEW = Path(os.environ.get('LUNAR_KART_PREVIEW', ROOT/'candidates/lunarcrystal-kart-candidate-1-review.png'))
PURPLE = [0.20, 0.027, 0.38, 1]
PLUM = [0.085, 0.012, 0.15, 1]
GOLD = [0.92, 0.57, 0.13, 1]
LIGHT_GOLD = [1.0, 0.76, 0.26, 1]
DARK = [0.027, 0.021, 0.046, 1]
METAL = [0.13, 0.10, 0.19, 1]
VIOLET = [0.63, 0.065, 1.0, 1]
AMBER = [1.0, 0.50, 0.07, 1]
TRANSLATIONS = {
    'Chassis': [0,0,0], 'AccentMesh': [0,0,0], 'SteeringWheel': [0,1.22,-0.12],
    'Wheel_FL': [-1.18,0.46,-0.97], 'Wheel_FR': [1.18,0.46,-0.97],
    'Wheel_RL': [-1.18,0.46,1.01], 'Wheel_RR': [1.18,0.46,1.01],
    'Exhaust_L': [-0.45,0.80,1.53], 'Exhaust_R': [0.45,0.80,1.53],
    'DriverMount': [0,1.40,0.28], 'ItemMountRear': [0,1.12,1.99],
    'ItemMountForward': [0,0.79,-2.02],
}


def box(g, size, at, color, rotation=None):
    g.add(base.transform(base.box(size, color), at, rotation))


def cyl(g, radius, length, at, axis, color):
    g.add(base.transform(base.cylinder(radius, length, SEG, axis, color), at))


def tube(g, start, end, radius, color):
    a,b = np.asarray(start,float), np.asarray(end,float)
    d=b-a; length=np.linalg.norm(d)
    if length < 1e-8: return
    direction=d/length
    axis=np.cross([0,1,0],direction); dot=np.clip(direction[1],-1,1)
    if np.linalg.norm(axis)<1e-8:
        rot=np.eye(3) if dot>0 else base.rot_x(math.pi)
    else:
        axis/=np.linalg.norm(axis); x,y,z=axis
        k=np.array([[0,-z,y],[z,0,-x],[-y,x,0]])
        angle=math.acos(dot)
        rot=np.eye(3)+math.sin(angle)*k+(1-math.cos(angle))*(k@k)
    g.add(base.transform(base.cylinder(radius,length,TUBE,'y',color),(a+b)/2,rot))


def line(g, points, radius, color):
    for a,b in zip(points,points[1:]): tube(g,a,b,radius,color)


def surface(g, vertices, faces, color):
    p,n,idx=[],[],[]
    for face in faces:
        tri=np.array([vertices[i] for i in face],float)
        normal=np.cross(tri[1]-tri[0],tri[2]-tri[0])
        length=np.linalg.norm(normal)
        if length<1e-9: continue
        normal/=length; offset=len(p)
        p.extend(tri);n.extend([normal]*3);idx.extend([offset,offset+1,offset+2])
    g.add((p,n,color,idx))


def hood(x,z):
    # Dome rising toward dashboard, with curved transverse shoulders.
    return (x, 0.86+0.28*(z+1.82)/1.44-0.18*x*x, z)


def star(g, center, radius, axis='y', color=GOLD, thickness=0.028):
    c=np.array(center,float)
    normal=np.array([0,1,0] if axis=='y' else [1,0,0],float)
    u=np.array([1,0,0] if axis=='y' else [0,0,1],float)
    v=np.array([0,0,1] if axis=='y' else [0,1,0],float)
    points=[]
    for i in range(10):
        a=math.pi/2+i*math.pi/5; r=radius if i%2==0 else radius*0.43
        points.append(c+u*r*math.cos(a)+v*r*math.sin(a))
    vertices=[c+normal*thickness,*[p+normal*thickness for p in points],c,*points]
    faces=[]
    for i in range(10):
        j=(i+1)%10
        faces.extend([(0,1+i,1+j),(11,12+j,12+i),
                      (1+i,12+i,12+j),(1+i,12+j,1+j)])
    surface(g,vertices,faces,color)


def crescent(g):
    # Filled crescent strip, extruded and seated on the dome. No floating decal.
    steps={'LOD0':28,'LOD1':18,'LOD2':10}[LOD]
    outer=[];inner=[]
    for t in np.linspace(0,1,steps+1):
        angle=math.radians(55)+t*math.radians(250)
        outer.append(np.array([0.43*math.cos(angle),-1.10+0.43*math.sin(angle)]))
        inner.append(np.array([0.16+0.29*math.cos(angle),-1.10+0.35*math.sin(angle)]))
    # Make both tips join cleanly at the outer endpoint.
    inner[0]=outer[0]; inner[-1]=outer[-1]
    vertices=[]
    for lift in (0.045,0.005):
        for o,i in zip(outer,inner):
            for x,z in (o,i):
                p=np.array(hood(x,z));p[1]+=lift;vertices.append(p)
    count=2*(steps+1);faces=[]
    for s in range(steps):
        a=2*s;b=a+2
        faces.extend([(a,b,a+1),(a+1,b,b+1),
                      (count+a,count+a+1,count+b),(count+a+1,count+b+1,count+b),
                      (a,count+a,count+b),(a,count+b,b),
                      (a+1,b+1,count+b+1),(a+1,count+b+1,count+a+1)])
    surface(g,vertices,faces,LIGHT_GOLD)


def geometry():
    body,trim,dark,glow=(base.Geo() for _ in range(4))
    box(dark,(1.66,0.23,2.70),(0,0.43,0.04),METAL)
    box(body,(1.65,0.33,2.49),(0,0.57,0.04),PLUM)
    # Curved bonnet shell closes at sides and bottom, leaves the cockpit open.
    vertices=[]; rows=max(6,SEG//2); cols=max(8,SEG)
    for j in range(rows+1):
        z=-1.82+j*1.44/rows
        half=0.62+0.16*math.sin(math.pi*j/(2*rows))
        for k in range(cols+1): vertices.append(hood(-half+2*half*k/cols,z))
    faces=[]
    for j in range(rows):
        for k in range(cols):
            a=j*(cols+1)+k;b=a+cols+1
            faces.extend([(a,b,a+1),(a+1,b,b+1)])
    surface(body,vertices,faces,PURPLE)
    for side in (-1,1):
        upper=[]
        for j in range(rows+1):
            z=-1.82+j*1.44/rows;half=0.62+0.16*math.sin(math.pi*j/(2*rows))
            upper.append(np.array(hood(side*half,z)))
        lower=[np.array([p[0],0.52,p[2]]) for p in upper]
        surface(body,upper+lower,[(j,j+1,rows+1+j+1) for j in range(rows)]+
                [(j,rows+1+j+1,rows+1+j) for j in range(rows)],PURPLE)
        line(trim,upper,0.030,GOLD)
        line(trim,lower,0.026,GOLD)
    # Front cap closes exactly against the curved dome, with no central gap.
    upper=vertices[:cols+1]
    lower=[(p[0],0.52,p[2]) for p in upper]
    surface(body,upper+lower,
            [(k,k+1,cols+1+k+1) for k in range(cols)]+
            [(k,cols+1+k+1,cols+1+k) for k in range(cols)],PURPLE)
    line(trim,upper,0.023,GOLD)
    box(trim,(1.58,0.075,0.20),(0,0.48,-1.91),GOLD)
    for side in (-1,1):
        # Structural running boards connect wheel fenders and cockpit rail.
        box(body,(0.29,0.28,2.70),(side*0.90,0.58,0),PURPLE)
        box(trim,(0.36,0.060,2.78),(side*0.90,0.43,0),GOLD)
        line(trim,[(side*0.75,0.91,-0.32),(side*0.77,0.91,0.87),
                   (side*0.66,1.17,1.07)],0.035,GOLD)
        for z in (-0.97,1.01):
            # Fenders are open arches rather than buried full ellipsoids.
            centers=[(side*1.18,0.47+0.58*math.sin(a),z+0.58*math.cos(a))
                     for a in np.linspace(0,math.pi,SEG//2+1)]
            for p,q in zip(centers,centers[1:]):
                delta=np.array(q)-p
                box(body,(0.49,0.095,np.linalg.norm(delta)+0.04),
                    (np.array(p)+q)/2,PURPLE,base.rot_x(-math.atan2(delta[1],delta[2])))
            line(trim,[(p[0]+side*0.255,p[1]+0.018,p[2]) for p in centers],0.023,GOLD)
            tube(dark,(0,0.46,z),(side*1.18,0.46,z),0.092,METAL)
        # Side scrolls embedded against each long panel.
        for z0 in (-0.20,0.63):
            points=[]
            for t in np.linspace(0,2.2*math.pi,SEG):
                radius=0.11*(1-t/(2.8*math.pi))
                points.append((side*1.054,0.66+radius*math.sin(t),z0+radius*math.cos(t)))
            line(trim,points,0.014,GOLD)
    # Seat, open cockpit and raised rear fairing.
    box(dark,(1.03,0.18,0.87),(0,0.75,0.29),DARK)
    box(dark,(0.94,0.69,0.15),(0,1.08,0.83),DARK,base.rot_x(-0.16))
    box(body,(1.18,0.62,0.23),(0,1.02,1.02),PURPLE)
    line(trim,[(-0.59,1.31,1.02),(0,1.36,1.02),(0.59,1.31,1.02)],0.032,GOLD)
    box(body,(1.49,0.31,0.47),(0,0.72,1.34),PLUM)
    for x in np.linspace(-0.54,0.54,7):
        box(trim,(0.037,0.038,0.33),(x,0.898,1.34),GOLD)
    crescent(trim)
    for x,z,r in [(0.27,-1.14,0.065),(0.37,-0.88,0.045),(-0.39,-0.91,0.040),
                  (-0.22,-1.56,0.043),(0.18,-1.49,0.037)]:
        center=np.array(hood(x,z));center[1]+=0.01
        star(trim,center,r,color=LIGHT_GOLD)
    # Small symmetric scrolls follow the dome and connect to the edging.
    for side in (-1,1):
        pts=[]
        for t in np.linspace(0,2*math.pi,SEG):
            r=0.15*(1-t/(2.8*math.pi));x=side*(0.49+r*math.cos(t));z=-0.64+r*math.sin(t)
            p=np.array(hood(x,z));p[1]+=0.022;pts.append(p)
        line(trim,pts,0.015,GOLD)
    # Amber carriage lanterns: visible metal cages and attached brackets.
    for side in (-1,1):
        for at in [(side*0.91,0.81,-1.63),(side*0.79,1.27,0.99)]:
            x,y,z=at
            tube(trim,(x,0.60 if z<0 else 0.92,z),(x,y-0.14,z),0.047,GOLD)
            cyl(glow,0.115,0.22,(x,y,z),'y',AMBER)
            cyl(trim,0.137,0.045,(x,y-0.13,z),'y',GOLD)
            cyl(trim,0.14,0.05,(x,y+0.13,z),'y',GOLD)
            trim.add(base.transform(base.ellipsoid((0.26,0.15,0.26),SEG//2,4,GOLD),(x,y+0.20,z)))
            for a in np.linspace(0,2*math.pi,4,endpoint=False):
                dx,dz=0.11*math.cos(a),0.11*math.sin(a)
                tube(trim,(x+dx,y-0.115,z+dz),(x+dx,y+0.115,z+dz),0.014,GOLD)
    parts={'Chassis':[(body,0),(dark,2)],'AccentMesh':[(trim,1),(glow,3)]}
    ring,spokes=base.Geo(),base.Geo()
    rot=base.rot_x(math.pi/2-0.40)
    ring.add(base.transform(base.torus(0.265,0.043,SEG,TUBE,'y',DARK),rotation=rot))
    for a in (0,2*math.pi/3,4*math.pi/3):
        tube(spokes,(0,0,0),rot@np.array([0.25*math.cos(a),0,0.25*math.sin(a)]),0.022,GOLD)
    tube(spokes,(0,-0.60,-0.54),(0,0,0),0.051,METAL)
    parts['SteeringWheel']=[(ring,2),(spokes,1)]
    for name in ('Wheel_FL','Wheel_FR','Wheel_RL','Wheel_RR'):
        rubber,hub=base.Geo(),base.Geo()
        rubber.add(base.torus(0.31,0.145,SEG,TUBE,'x',DARK))
        cyl(rubber,0.34,0.32,(0,0,0),'x',DARK)
        for side in (-1,1):
            cyl(hub,0.267,0.035,(side*0.181,0,0),'x',GOLD)
            cyl(rubber,0.228,0.035,(side*0.205,0,0),'x',PLUM)
            star(hub,(side*0.23,0,0),0.20,axis='x',color=LIGHT_GOLD,
                 thickness=side*0.028)
            hub.add(base.transform(base.torus(0.248,0.018,SEG,4,'x',LIGHT_GOLD),
                                   (side*0.226,0,0)))
        parts[name]=[(rubber,2),(hub,1)]
    for name in ('Exhaust_L','Exhaust_R'):
        shell,collar,core=base.Geo(),base.Geo(),base.Geo()
        cyl(shell,0.18,0.55,(0,0,0),'z',METAL)
        cyl(collar,0.20,0.08,(0,0,-0.17),'z',GOLD)
        cyl(collar,0.20,0.07,(0,0,0.25),'z',GOLD)
        cyl(shell,0.151,0.016,(0,0,0.292),'z',DARK)
        cyl(core,0.12,0.018,(0,0,0.304),'z',VIOLET)
        parts[name]=[(shell,2),(collar,1),(core,3)]
    return parts


def main():
    shared.LOD,shared.OUT=LOD,OUT
    shared.TRANSLATIONS=TRANSLATIONS
    shared.APPROVED_NAME='The Moonlit Carriage'
    shared.GENERATOR='Minigame Mayhem deterministic Lunarcrystal kart builder'
    shared.USE_VERTEX_COLORS=True
    shared.MATERIAL_TEXTURE_RGBA=None
    shared.MATERIALS=[{'name':name,'doubleSided':True,'pbrMetallicRoughness':
                      {'baseColorFactor':[1,1,1,1],'metallicFactor':metal,'roughnessFactor':rough}}
                     for name,metal,rough in [('CelestialPurple',0.28,0.36),
                       ('GoldenScrollwork',0.65,0.29),('DarkStructure',0.04,0.85),('LanternAndVioletGlow',0.0,0.25)]]
    shared.MATERIALS[3]['emissiveFactor']=[0.10,0.10,0.10]
    parts=geometry();triangles,doc=shared.export_glb(parts)
    assert triangles<=LIMIT, f'{triangles} exceeds {LOD} budget {LIMIT}'
    if os.environ.get('LUNAR_KART_SKIP_PREVIEW')!='1':
        from render_lunarcrystal_kart_review import render
        render(parts,TRANSLATIONS,PREVIEW)
    print(json.dumps(dict(lod=LOD,triangles=triangles,limit=LIMIT,glb=str(OUT),
                          materials=len(doc['materials']),nodes=len(doc['nodes'])),indent=2))


if __name__=='__main__': main()
