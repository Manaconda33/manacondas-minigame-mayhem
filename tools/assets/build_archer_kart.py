"""Deterministic reference-based Archer kart candidate; +Z rear, -Z nose.

ARCHER_KART_LOD=LOD0/LOD1/LOD2, ARCHER_KART_OUT, ARCHER_KART_PREVIEW,
ARCHER_KART_SKIP_PREVIEW=1. Kart display name awaits owner choice.
"""
import json
import math
import os
from pathlib import Path

import numpy as np

import build_manaconda_wayfinder as base
import build_keeg_mycelial_majesty as shared

LOD = os.environ.get('ARCHER_KART_LOD', 'LOD0')
DETAIL = {'LOD0': (20, 10, 25000), 'LOD1': (12, 6, 12000),
          'LOD2': (8, 4, 5000)}[LOD]
SEG, TUBE, LIMIT = DETAIL
ROOT = Path(__file__).resolve().parent
OUT = Path(os.environ.get('ARCHER_KART_OUT', ROOT/'candidates/archer-kart-candidate-3-lod0.glb'))
PREVIEW = Path(os.environ.get('ARCHER_KART_PREVIEW', ROOT/'candidates/archer-kart-candidate-3-review.png'))
IVORY = [0.92, 0.86, 0.76, 1]
GOLD = [0.88, 0.56, 0.15, 1]
PURPLE = [0.23, 0.035, 0.34, 1]
DARK = [0.045, 0.025, 0.075, 1]
TIRE = [0.055, 0.025, 0.09, 1]
GLOW = [1, 0.03, 0.65, 1]
METAL = [0.22, 0.19, 0.27, 1]


def box(g, size, at, color, rotation=None):
    g.add(base.transform(base.box(size, color), at, rotation))


def cylinder(g, radius, length, at, axis, color, capped=True):
    g.add(base.transform(base.cylinder(radius, length, SEG, axis, color, capped), at))


def tube(g, start, end, radius, color):
    a, b = np.asarray(start, float), np.asarray(end, float)
    delta = b-a
    direction = delta/np.linalg.norm(delta)
    axis = np.cross([0, 1, 0], direction)
    dot = np.clip(direction[1], -1, 1)
    if np.linalg.norm(axis) < 1e-8:
        rotation = np.eye(3) if dot > 0 else base.rot_x(math.pi)
    else:
        axis /= np.linalg.norm(axis)
        x, y, z = axis
        k = np.array([[0, -z, y], [z, 0, -x], [-y, x, 0]])
        angle = math.acos(dot)
        rotation = np.eye(3)+math.sin(angle)*k+(1-math.cos(angle))*(k@k)
    g.add(base.transform(base.cylinder(radius, float(np.linalg.norm(delta)), SEG,
                                     'y', color), (a+b)/2, rotation))


def wedge(g, z0, z1, w0, w1, bottom, top0, top1, color, x=0):
    v=np.array([[-w0/2,bottom,z0],[w0/2,bottom,z0],[-w0/2,top0,z0],[w0/2,top0,z0],
                [-w1/2,bottom,z1],[w1/2,bottom,z1],[-w1/2,top1,z1],[w1/2,top1,z1]],float)
    v[:,0]+=x
    faces=[(0,1,3),(0,3,2),(4,7,5),(4,6,7),(0,4,5),(0,5,1),
           (2,3,7),(2,7,6),(0,2,6),(0,6,4),(1,5,7),(1,7,3)]
    p,n,ind=[],[],[]
    for f in faces:
        tri=v[list(f)]; normal=np.cross(tri[1]-tri[0],tri[2]-tri[0]);normal/=np.linalg.norm(normal)
        i=len(p);p.extend(tri);n.extend([normal]*3);ind.extend([i,i+1,i+2])
    g.add((p,n,color,ind))


TRANSLATIONS = {
    'Chassis':[0,0,0], 'AccentMesh':[0,0,0], 'SteeringWheel':[0,1.22,-0.14],
    'Wheel_FL':[-1.30,0.48,-1.02], 'Wheel_FR':[1.30,0.48,-1.02],
    'Wheel_RL':[-1.30,0.48,1.04], 'Wheel_RR':[1.30,0.48,1.04],
    'Exhaust_L':[-0.48,0.87,1.57], 'Exhaust_R':[0.48,0.87,1.57],
    'DriverMount':[0,1.37,0.20], 'ItemMountRear':[0,1.18,1.95],
    'ItemMountForward':[0,0.85,-2.12],
}


def geometry():
    body,trim,glow,dark = (base.Geo() for _ in range(4))
    # Low structural tub, tapered ivory prow and pointed purple aerodynamic blades.
    box(dark,(1.78,0.26,2.75),(0,0.46,0.06),DARK)
    wedge(body,-2.07,-0.42,0.13,1.37,0.49,0.69,1.15,IVORY)
    wedge(dark,-2.15,-0.38,0.18,1.51,0.37,0.53,0.90,DARK)
    for side in (-1,1):
        tube(trim,(side*0.065,0.685,-2.07),(side*0.685,1.145,-0.42),0.042,GOLD)
        wedge(body,-0.37,1.28,0.25,0.38,0.52,0.83,0.93,IVORY,side*0.90)
        wedge(trim,-1.90,-0.61,0.10,0.45,0.36,0.57,0.73,PURPLE,side*1.03)
        tube(trim,(side*1.03,0.57,-1.90),(side*1.23,0.73,-0.61),0.045,GOLD)
        tube(trim,(side*1.03,0.37,-1.90),(side*1.23,0.37,-0.61),0.033,GOLD)
        tube(glow,(side*1.06,0.48,-1.73),(side*1.19,0.58,-0.70),0.025,GLOW)
        wedge(trim,-0.23,1.39,0.30,0.18,0.38,0.57,0.76,PURPLE,side*1.12)
        tube(trim,(side*1.26,0.57,-0.23),(side*1.20,0.76,1.39),0.043,GOLD)
        tube(glow,(side*1.26,0.44,-0.16),(side*1.20,0.61,1.33),0.022,GLOW)
        # Wheel axles and side-panel attachment, not floating ornamental fins.
        box(trim,(0.09,0.50,0.34),(side*0.86,0.79,0.95),GOLD)
    for z in (-1.02,1.04):
        cylinder(dark,0.10,2.65,(0,0.48,z),'x',METAL)
    # Open cockpit: dark seat, ivory rear fairing and attached golden halo rim.
    box(dark,(1.07,0.17,0.85),(0,0.68,0.35),DARK)
    box(dark,(0.95,0.76,0.16),(0,1.08,0.92),DARK,base.rot_x(-0.15))
    box(body,(1.23,0.51,0.25),(0,1.02,1.09),IVORY)
    tube(trim,(-0.58,1.29,1.09),(0.58,1.29,1.09),0.045,GOLD)
    for side in (-1,1):
        tube(trim,(side*0.60,0.74,-0.21),(side*0.66,1.12,0.96),0.043,GOLD)
    # Rear engine casing with magenta inset vanes, compact structural exhaust bridge.
    box(trim,(1.40,0.35,0.56),(0,0.76,1.34),PURPLE)
    box(dark,(1.41,0.12,0.65),(0,0.54,1.39),METAL)
    for x in (-0.44,-0.22,0,0.22,0.44):
        box(glow,(0.105,0.045,0.43),(x,0.955,1.35),GLOW)
    box(trim,(1.62,0.08,0.19),(0,0.38,-1.73),GOLD)
    # Bow-and-arrow emblem embedded into the exact sloped hood surface.
    def hood(x,z):
        return (x,0.69+(z+2.07)*(0.46/1.65)+0.012,z)
    # Smooth paired recurve limbs, a distinct fine bowstring, solid arrowhead
    # and fletching. Ornament stays inside the taper instead of hitting its rim.
    origin=np.array([0.0,-1.20])
    longitudinal=np.array([0.55,0.835])
    transverse=np.array([0.835,-0.55])
    def emblem(t,lateral):
        return origin+longitudinal*(t*0.38)+transverse*lateral
    curves=[ [(-1,0.015),(-0.90,0.07),(-0.80,-0.04),(-0.66,-0.11)],
             [(-0.66,-0.11),(-0.44,-0.20),(-0.20,-0.20),(0,-0.12)],
             [(0,-0.12),(0.20,-0.20),(0.44,-0.20),(0.66,-0.11)],
             [(0.66,-0.11),(0.80,-0.04),(0.90,0.07),(1,0.015)] ]
    limb_points=[]
    for controls in curves:
        controls=np.array([emblem(*p) for p in controls])
        steps={'LOD0':12,'LOD1':8,'LOD2':5}[LOD]
        points=[]
        for t in np.linspace(0,1,steps+1):
            points.append((1-t)**3*controls[0]+3*(1-t)**2*t*controls[1]
                          +3*(1-t)*t*t*controls[2]+t**3*controls[3])
        limb_points.extend(points if not limb_points else points[1:])
    # Continuous swept surface removes seams between individual cylinders.
    centers=np.array([hood(*p) for p in limb_points])
    positions,normals,indices=[],[],[]
    for i,center in enumerate(centers):
        tangent=centers[min(i+1,len(centers)-1)]-centers[max(0,i-1)]
        tangent/=np.linalg.norm(tangent)
        axis=np.cross(tangent,[0,1,0]);axis/=np.linalg.norm(axis)
        second=np.cross(tangent,axis)
        for a in np.linspace(0,2*math.pi,TUBE,endpoint=False):
            normal=math.cos(a)*axis+math.sin(a)*second
            positions.append(center+0.019*normal);normals.append(normal)
        if i:
            for k in range(TUBE):
                a=(i-1)*TUBE+k;b=(i-1)*TUBE+(k+1)%TUBE
                c=i*TUBE+k;d=i*TUBE+(k+1)%TUBE
                indices.extend([a,b,c,b,d,c])
    for ring,reverse in [(0,True),(len(centers)-1,False)]:
        for k in range(1,TUBE-1):
            face=[ring*TUBE,ring*TUBE+k,ring*TUBE+k+1]
            indices.extend(face[::-1] if reverse else face)
    trim.add((positions,normals,GOLD,indices))
    tube(trim,hood(*emblem(-1,0.015)),hood(*emblem(1,0.015)),0.008,GOLD)
    # Extruded badges follow the sloped hood, including underside/support faces.
    def badge(geo, points, color, thickness=0.027, lift=0.010):
        upper=np.array([hood(*p) for p in points]);upper[:,1]+=lift
        lower=upper.copy();lower[:,1]-=thickness
        verts=np.concatenate((upper,lower));count=len(points)
        faces=[]
        for i in range(1,count-1):faces.extend([(0,i,i+1),(count,count+i+1,count+i)])
        for i in range(count):
            j=(i+1)%count;faces.extend([(i,j,count+j),(i,count+j,count+i)])
        positions,normals,indices=[],[],[]
        for face in faces:
            tri=verts[list(face)];normal=np.cross(tri[1]-tri[0],tri[2]-tri[0]);normal/=np.linalg.norm(normal)
            start=len(positions);positions.extend(tri);normals.extend([normal]*3);indices.extend([start,start+1,start+2])
        geo.add((positions,normals,color,indices))
    arrow_direction=-transverse
    shaft_start=origin-arrow_direction*0.30
    tip=origin+arrow_direction*0.36
    arrow_base=tip-arrow_direction*0.15
    tube(trim,hood(*shaft_start),hood(*arrow_base),0.016,GOLD)
    badge(trim,[tip,arrow_base+longitudinal*0.075,arrow_base-longitudinal*0.075],GOLD)
    for side in (-1,1):
        badge(trim,[shaft_start,shaft_start+arrow_direction*0.12,
                    shaft_start+arrow_direction*0.02+longitudinal*side*0.045],GOLD)
    gem=emblem(0,-0.12)
    badge(trim,[gem+longitudinal*0.08,gem+transverse*0.068,
                gem-longitudinal*0.08,gem-transverse*0.068],GOLD,0.034,lift=0.020)
    badge(glow,[gem+longitudinal*0.059,gem+transverse*0.047,
                gem-longitudinal*0.059,gem-transverse*0.047],GLOW,0.024,lift=0.035)
    parts={'Chassis':[(body,0),(dark,2)],'AccentMesh':[(trim,1),(glow,3)]}
    # One proper inclined steering ring with gold spokes and column.
    wheel,spokes=base.Geo(),base.Geo()
    rot=base.rot_x(math.pi/2-0.40)
    wheel.add(base.transform(base.torus(0.27,0.045,SEG,TUBE,'y',DARK),rotation=rot))
    for a in (0,2*math.pi/3,4*math.pi/3):
        point=rot@np.array([math.cos(a)*0.25,0,math.sin(a)*0.25])
        tube(spokes,(0,0,0),point,0.024,GOLD)
    spokes.add(base.transform(base.cylinder(0.073,0.09,SEG,'y',GOLD),rotation=rot))
    tube(spokes,(0,-0.62,-0.55),(0,-0.016,-0.037),0.058,METAL)
    parts['SteeringWheel']=[(wheel,2),(spokes,1)]
    for name in ('Wheel_FL','Wheel_FR','Wheel_RL','Wheel_RR'):
        rubber,hub=base.Geo(),base.Geo()
        rubber.add(base.torus(0.32,0.145,SEG,TUBE,'x',TIRE))
        cylinder(rubber,0.345,0.36,(0,0,0),'x',TIRE)
        for side in (-1,1):
            cylinder(hub,0.26,0.034,(side*0.195,0,0),'x',GOLD)
            cylinder(rubber,0.215,0.038,(side*0.212,0,0),'x',DARK)
            cylinder(hub,0.075,0.05,(side*0.23,0,0),'x',GOLD)
            for angle in np.linspace(0,2*math.pi,6,endpoint=False):
                tube(hub,(side*0.237,0,0),(side*0.237,0.23*math.sin(angle),0.23*math.cos(angle)),0.020,GOLD)
        parts[name]=[(rubber,2),(hub,1)]
    for name in ('Exhaust_L','Exhaust_R'):
        shell,collar,core=base.Geo(),base.Geo(),base.Geo()
        cylinder(shell,0.195,0.58,(0,0,0),'z',METAL)
        cylinder(collar,0.22,0.09,(0,0,-0.19),'z',GOLD)
        cylinder(collar,0.215,0.08,(0,0,0.25),'z',GOLD)
        cylinder(shell,0.16,0.015,(0,0,0.296),'z',DARK)
        cylinder(core,0.12,0.017,(0,0,0.304),'z',GLOW)
        parts[name]=[(shell,2),(collar,1),(core,3)]
    return parts


def main():
    shared.LOD,shared.OUT,shared.PREVIEW=LOD,OUT,PREVIEW
    shared.TRANSLATIONS=TRANSLATIONS
    shared.APPROVED_NAME='Archer reference kart (working description)'
    shared.GENERATOR='Minigame Mayhem deterministic Archer reference kart builder'
    shared.MATERIALS=[]
    for name,metal,rough in [('IvoryArmor',0.15,0.48),('GoldPurpleTrim',0.65,0.30),
                            ('DarkStructureTires',0.05,0.83),('MagentaEnergy',0.1,0.25)]:
        mat={'name':name,'pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],
             'metallicFactor':metal,'roughnessFactor':rough},'doubleSided':True}
        if name=='MagentaEnergy':mat['emissiveFactor']=[0.75,0.015,0.42]
        shared.MATERIALS.append(mat)
    shared.USE_VERTEX_COLORS=True
    shared.MATERIAL_TEXTURE_RGBA=None
    shared.PREVIEW_MATERIAL_RGBA=None
    shared.PREVIEW_TITLE='ARCHER • REFERENCE KART'
    shared.CANDIDATE='3'
    shared.PREVIEW_VIEWS=['Front three-quarter • pointed ivory prow',
                         'Rear three-quarter • twin magenta outlets',
                         'Top • bow-and-arrow hood emblem', 'Profile • low angular armor']
    shared.PREVIEW_FOOTER='Ivory armor | gold edging | purple aero blades | bow emblem | open cockpit | twin rear exhausts'
    parts=geometry()
    triangles,doc=shared.export_glb(parts)
    assert triangles<=LIMIT
    if os.environ.get('ARCHER_KART_SKIP_PREVIEW')!='1':
        from render_archer_kart_review import render
        render(parts, TRANSLATIONS, PREVIEW)
    print(json.dumps(dict(lod=LOD,triangles=triangles,limit=LIMIT,glb=str(OUT),
                          materials=len(doc['materials']),nodes=len(doc['nodes'])),indent=2))


if __name__=='__main__':main()
