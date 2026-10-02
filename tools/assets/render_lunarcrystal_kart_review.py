"""Depth-buffered orthographic geometry review; no generated or painted details."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont


def render(parts, translations, path, detail=False, mount=None):
    width, height = 900, 640
    sheet = Image.new('RGB', (1800, 780 if detail else 1430), '#111323')
    draw = ImageDraw.Draw(sheet)
    fontpath = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    try:
        title = ImageFont.truetype(fontpath, 32)
        font = ImageFont.truetype(fontpath, 22)
    except OSError:
        title = font = ImageFont.load_default()
    draw.text((40, 24), mount['title'] if mount else 'LUNARCRYSTAL — THE MOONLIT CARRIAGE • CANDIDATE 1', fill='#f2dfba', font=title)
    views = [((4, 3, -6), 'Front three-quarter'), ((-4, 3, 6), 'Rear three-quarter'),
             ((0, 8, 0.001), 'Top • crescent and stars'), ((7, 1.4, 0), 'Side profile')]
    if detail:
        views=[((0,8,0.001),'Hood • crescent and celestial scrollwork'),
               ((7,1.4,0),'Steering • driver-facing wheel and forward column')]
    if mount:
        views=mount['views']
    for index, (camera, label) in enumerate(views):
        direction = np.array(camera, float)
        direction /= np.linalg.norm(direction)
        right = np.cross([0, 1, 0], direction)
        right /= np.linalg.norm(right)
        up = np.cross(direction, right)
        matrix = np.stack((right, up, direction))
        depth = np.full((height, width), -np.inf)
        pixels = np.full((height, width, 3), [23, 26, 43], dtype=np.uint8)
        light = np.array([-0.4, 0.85, -0.35]); light /= np.linalg.norm(light)
        center = np.array([0, 0.83, 0])
        if mount: center=np.array([0,0.5,0])
        if detail: center=np.array([0,0.95,-1.20] if index==0 else [0,1.05,-0.30])
        scale = (620 if index==0 else 440) if detail else (125 if index == 2 else 155)
        if mount: scale=210
        draw_parts=dict(parts)
        if mount: draw_parts['DriverSprite']=[(mount['sprite'](index,right,up),-1)]
        for name, primitives in draw_parts.items():
            for geo, material in primitives:
                vertices, normals, colors, indices = geo.arrays()
                world = vertices + np.array(translations[name])
                points = (world-center) @ matrix.T
                points[:, 0] = width/2 + scale*points[:, 0]
                points[:, 1] = height/2 - scale*points[:, 1]
                for ids in indices.reshape(-1, 3):
                    tri = points[ids]
                    x0,y0 = np.floor(tri[:,:2].min(axis=0)).astype(int)
                    x1,y1 = np.ceil(tri[:,:2].max(axis=0)).astype(int)
                    x0,y0=max(0,x0),max(0,y0)
                    x1,y1=min(width-1,x1),min(height-1,y1)
                    if x0>x1 or y0>y1:continue
                    a,b,c=tri
                    denominator=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
                    if abs(denominator)<1e-8:continue
                    yy,xx=np.mgrid[y0:y1+1,x0:x1+1]
                    xx,yy=xx+0.5,yy+0.5
                    u=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/denominator
                    v=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/denominator
                    w=1-u-v
                    z=u*a[2]+v*b[2]+w*c[2]
                    region=depth[y0:y1+1,x0:x1+1]
                    mask=(u>=-1e-6)&(v>=-1e-6)&(w>=-1e-6)&(z>region)
                    if not mask.any():continue
                    normal=np.mean(normals[ids],axis=0)
                    normal/=max(np.linalg.norm(normal),1e-9)
                    shade=0.52+0.48*abs(float(np.dot(normal,light)))
                    color=colors[ids,:3].mean(axis=0)
                    if material in (3,-1):shade=1
                    rgb=(np.clip(color*shade,0,1)**(1 if material==-1 else 1/2.2)*255).astype(np.uint8)
                    alpha=float(colors[ids,3].mean())
                    dest=pixels[y0:y1+1,x0:x1+1]
                    dest[mask]=(rgb*alpha+dest[mask]*(1-alpha)).astype(np.uint8)
                    region[mask]=z[mask]
        x,y=(index%2)*width,90+(index//2)*650
        sheet.paste(Image.fromarray(pixels), (x,y))
        draw.text((x+25,y+10), label, fill='#ddd7e9', font=font)
    draw.text((30,740 if detail else 1390), 'Runtime scale / PI yaw / 1.45m billboards • proposed mounts • live camera review pending' if mount else 'Actual mesh geometry • purple / gold / amber lanterns / violet outlets • live lighting and exhaust effects pending',
              fill='#b9b3c8',font=font)
    path.parent.mkdir(parents=True,exist_ok=True)
    sheet.save(path)
