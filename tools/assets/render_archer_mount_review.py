"""Offline mount review using runtime kart normalization and camera-facing sprites.

This is a geometry/placement check, not a live Three.js or device acceptance.
"""
from pathlib import Path
import numpy as np
from PIL import Image
import build_archer_kart as kart
import build_manaconda_wayfinder as base
from render_archer_kart_review import render

ROOT=Path(__file__).resolve().parents[2]
FRONT_POSITION=np.array([0,0.78,-0.12])
REAR_POSITION=np.array([0,0.85,-0.12])


def main():
    source=kart.geometry()
    all_points=np.concatenate([g.arrays()[0]+np.array(kart.TRANSLATIONS[name])
                              for name,primitives in source.items() for g,_ in primitives])
    size=all_points.max(axis=0)-all_points.min(axis=0)
    scale=2.9/max(size[0],size[2])
    offset=-all_points[:,1].min()*scale-0.42
    parts={}
    for name,primitives in source.items():
        parts[name]=[]
        for g,material in primitives:
            p,n,c,i=g.arrays();p=(p+np.array(kart.TRANSLATIONS[name]))*scale
            p[:,[0,2]]*=-1;p[:,1]+=offset;n[:,[0,2]]*=-1
            geo=base.Geo();geo.add((p,n,c,i));parts[name].append((geo,material))
    translations={name:[0,0,0] for name in parts};translations['DriverSprite']=[0,0,0]
    groups=[['rear','front','steer-left','front-steer-left'],
            ['steer-right','front-steer-right','hit','front-hit'],
            ['victory','front-victory','rear','front']]
    for group,frames in enumerate(groups,1):
        def sprite(index,right,up):
            frame=frames[index];position=FRONT_POSITION if frame.startswith('front') else REAR_POSITION
            with Image.open(ROOT/f'public/assets/characters/aa-13/driver/{frame}.png') as image:
                image=image.convert('RGBa').resize((72,72),Image.Resampling.LANCZOS).convert('RGBA')
                pixels=np.array(image)/255
            geo=base.Geo();step=1.45/72
            for row,column in np.argwhere(pixels[:,:,3]>0.025):
                x=(column/72-0.5)*1.45;y=(0.5-row/72)*1.45
                quad=np.array([position+right*x+up*y,
                               position+right*(x+step)+up*y,
                               position+right*(x+step)+up*(y-step),
                               position+right*x+up*(y-step)])
                geo.add((quad,[np.cross(right,up)]*4,pixels[row,column],[0,1,2,0,2,3]))
            return geo
        views=[((0,2,6) if frame.startswith('front') else (0,2,-6),frame.replace('-',' ').title()) for frame in frames]
        render(parts,translations,ROOT/f'tools/assets/candidates/archer-mounted-review-{group}.png',
               mount=dict(title=f'THE PRECISION SHOT — MOUNT REVIEW {group}',views=views,sprite=sprite))
    print(f'Runtime kart scale={scale:.6f}; ground offset={offset:.6f}; all ten frame placements rendered')


if __name__=='__main__':main()
