from pathlib import Path
import numpy as np
from scipy import signal
from scipy.io import wavfile
import json, hashlib, csv, html
ROOT=Path(__file__).parent
SR=48000
rng=np.random.default_rng(330930)
cues=[]
def time(d): return np.arange(round(d*SR))/SR
def env(t,attack=.005,decay=.15):
    return (1-np.exp(-t/attack))*np.exp(-t/decay)*np.minimum(1,(len(t)/SR-t)/.012)
def noise(t,lo=100,hi=7000):
    return signal.sosfilt(signal.butter(3,[lo,hi],btype='bandpass',fs=SR,output='sos'),rng.standard_normal(len(t)))
def sweep(t,f0,f1):
    f=f0*(f1/f0)**(t/max(t[-1],.001)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tonal(d,f0,f1,bright=.2):
    t=time(d); s=sweep(t,f0,f1); return (s+bright*sweep(t,f0*2.01,f1*2.01)+.1*noise(t,1800,9000))*env(t,decay=d*.42)
def impact(d=.4,heavy=1):
    t=time(d); return .65*sweep(t,130*heavy,38)*env(t,.001,.075)+noise(t,70,6500)*env(t,.001,d*.24)+.22*noise(t,2500,10000)*env(t,.001,.024)
def burst(d=.6,kind='fire'):
    t=time(d)
    if kind=='ice':
        x=sum(np.sin(2*np.pi*f*t)*env(t,.002,.07+i*.023)/(i+1) for i,f in enumerate([1700,2317,3181,4213,5311])); return x+.25*noise(t,3000,12000)*env(t,.002,.11)
    if kind=='electric': return tonal(d,150,1100,.55)+noise(t,1800,10500)*env(t,.001,d*.3)*(np.sin(2*np.pi*43*t)>.1)
    if kind=='wet': return .8*noise(t,120,2600)*env(t,.001,.08)+.6*sweep(t,230,65)*env(t,.001,.12)
    if kind=='air': return noise(t,500,9000)*env(t,.04,d*.37)+.25*sweep(t,90,450)*env(t,.02,d*.4)
    return noise(t,70,8000)*env(t,.008,d*.36)+.6*sweep(t,180,45)*env(t,.001,.1)
def loop(d=2,kind='engine',pitch=60):
    t=time(d); n=len(t)
    # Integer-bin frequency synthesis makes all components periodic at the loop boundary.
    freq=np.fft.rfftfreq(n,1/SR); phase=rng.uniform(0,2*np.pi,len(freq))
    if kind=='engine':
        p=round(pitch*d)/d; x=sum(np.sin(2*np.pi*p*k*t+.12*k)/(k**1.2) for k in range(1,25)); x*=1+.12*np.sin(2*np.pi*8*t); lo,hi=80,2200
    elif kind=='tire': x=.32*np.sin(2*np.pi*round(pitch*d)/d*t)*(1+.22*np.sin(2*np.pi*11*t)); lo,hi=1400,7500
    elif kind=='rocket': x=.35*np.sin(2*np.pi*round(pitch*d)/d*t);lo,hi=120,5200
    else: x=np.zeros(n); lo,hi={'asphalt':(350,2800),'dirt':(90,4300),'grass':(180,1600),'flight':(650,5500),'fire':(120,7000),'ice':(2100,10000),'electric':(1000,7500),'boost':(300,7000)}.get(kind,(400,6000))
    mag=np.exp(-((np.log(np.maximum(freq,1))-np.log((lo*hi)**.5))/ .6)**4); mag[0]=0
    z=np.fft.irfft(mag*np.exp(1j*phase),n=n); z/=max(np.std(z),1e-9)
    return x+(.13 if kind=='engine' else .35)*z*(1+.1*np.sin(2*np.pi*5*t))
def seq(notes,d=.12,gap=.03):
    parts=[]
    for f in notes: parts.extend([tonal(d,f,f*1.015,.12),np.zeros(round(gap*SR))])
    return np.concatenate(parts)
def add(group,name,x,desc,looped=False,priority='core'):
    x=np.nan_to_num(x); x-=np.mean(x)
    if looped:
        seam=int(np.argmin(np.abs(x-np.roll(x,1)))); x=np.roll(x,-seam)
    if not looped:
        k=min(240,len(x)//4);x[:k]*=np.linspace(0,1,k);x[-k:]*=np.linspace(1,0,k)
    # Perceptual targets vary by role; normalization leaves 3 dB peak headroom.
    target=.10 if looped else .15; rms=np.sqrt(np.mean(x*x));x*=min(target/max(rms,1e-9),.707/max(abs(x).max(),1e-9))
    pcm=np.round(x*32767).astype(np.int16); path=ROOT/'wav'/group/(name+'.wav');path.parent.mkdir(parents=True,exist_ok=True);wavfile.write(path,SR,pcm)
    cues.append(dict(id=name,group=group,file=str(path.relative_to(ROOT)),description=desc,loop=looped,priority=priority,duration_seconds=round(len(x)/SR,3),peak_dbfs=round(20*np.log10(max(abs(x).max(),1e-9)),2),rms_dbfs=round(20*np.log10(max(np.sqrt(np.mean(x*x)),1e-9)),2),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),boundary_step=float(abs(int(pcm[-1])-int(pcm[0]))/32768)))
# Package 1: kart and driving
G='01-kart-driving'
for name,p in [('engine-low-rpm',50),('engine-high-rpm',110)]: add(G,name,loop(kind='engine',pitch=p),'Shared kart engine layer; crossfade and pitch in runtime.',True)
add(G,'tire-drift-loop',loop(kind='tire',pitch=630),'Sustained tire squeal while drifting.',True)
for i,(name,f) in enumerate([('drift-blue',480),('drift-orange',660),('drift-purple',880)]): add(G,name,seq([f,f*1.5],.09,.015),'Distinct drift charge tier reached.')
for name,d,f in [('drift-boost-release',.48,180),('boost-pad',.35,260),('boost-end',.28,550)]: add(G,name,burst(d,'air')+.4*tonal(d,f,f*3 if name!='boost-end' else 120),'Boost activation or completion feedback.')
add(G,'boost-sustain-loop',loop(kind='boost'),'Air/exhaust layer during boost.',True)
for surface in ['asphalt','dirt','grass']: add(G,'tires-'+surface+'-loop',loop(kind=surface),'Tire contact texture for '+surface+'.',True)
for name,d,h in [('kart-contact-light',.18,.7),('kart-contact-heavy',.45,1),('guardrail-impact',.38,1.4)]:
    x=impact(d,h)
    if 'guardrail' in name: x+=tonal(d,1300,900,.7)
    add(G,name,x,'Collision feedback; choose by impact strength/contact type.')
add(G,'spinout',tonal(.65,430,95,.4)+burst(.65,'air'),'Brief loss-of-control cue.')
add(G,'jump-takeoff',burst(.24,'air'),'Short ramp departure whoosh.')
add(G,'landing-light',impact(.24,.65),'Ordinary landing.')
add(G,'landing-heavy',impact(.42,1),'Hard landing.')
add(G,'recovery',seq([350,520,780],.13,.02),'Return to legal course.')
# Package 2: race events
G='02-race-events'
add(G,'countdown-tick',tonal(.19,620,620,.28),'Repeat for 3, 2, 1.')
add(G,'race-start-go',seq([880,1320],.16,.015),'Distinct GO signal.')
add(G,'lap-complete',seq([520,780],.14,.025),'Validated lap completion.')
add(G,'final-lap',seq([520,780,1040],.16,.03),'Final-lap signal, separate from future music arrangement.')
add(G,'wrong-way',seq([370,290],.11,.08),'Rate-limited wrong-way warning.')
add(G,'race-finish',seq([520,650,780,1040],.16,.02),'Player crosses finish; short nonverbal sting.')
for name,notes in [('placement-win',[660,880,1100,1320]),('placement-podium',[520,650,780]),('placement-other',[440,520])]: add(G,name,seq(notes,.18,.025),'Placement feedback: '+name+'.')
# Package 3: shared handling and individual items
G='03-item-handling'
for name,notes in [('item-box-collect',[700,1050]),('item-ready',[1100,1400]),('item-unavailable',[210,160]),('protection-block',[1250,850]),('counter-destroy',[900,330])]: add(G,name,seq(notes,.075,.015),'Shared item feedback: '+name+'.')
def one(name,kind='air',d=.4,desc=''):
    add(G,name,burst(d,kind),desc or name.replace('-',' '))
def tone(name,f0,f1,d=.25): add(G,name,tonal(d,f0,f1,.4),name.replace('-',' '))
def lp(name,kind,p=60): add(G,name,loop(kind=kind,pitch=p),name.replace('-',' '),True)
tone('nitro-surge-activate',170,850,.35);one('nitro-surge-tail','air',.5)
tone('kinetic-disc-launch',350,1200);lp('kinetic-disc-travel-loop','flight');tone('kinetic-disc-ricochet',1600,900,.17);one('kinetic-disc-impact','electric',.32)
tone('seeker-launch',180,720,.35);lp('seeker-travel-loop','engine',140)
for name,notes in [('seeker-warning',[700]),('seeker-warning-urgent',[700,700]),('apex-warning',[290,440]),('apex-warning-urgent',[290,440,290,440])]: add(G,name,seq(notes,.07,.035),'Distinct incoming threat; runtime controls cadence.')
one('seeker-impact','fire',.5);one('apex-launch','air',.6);one('apex-dive','air',.75);one('apex-explosion','fire',1)
one('blast-orb-deploy','wet',.22);tone('blast-orb-fuse-tick',1550,1350,.09);one('blast-orb-explosion','fire',.85)
one('slick-deploy','wet',.28);add(G,'slick-trigger-skid',loop(.6,'tire',480)*env(time(.6),.02,.3),'Slick-induced skid.')
one('shockwave-activate','electric',.65);one('shockwave-counter','electric',.26)
add(G,'prismatic-activate',seq([600,900,1200],.1,.02),'Invincibility activation; separate from musical layer.')
tone('prismatic-block',1700,950,.22);add(G,'prismatic-expire',seq([900,600],.1,.025),'Invincibility ended.')
one('blaze-launch','fire',.28);lp('blaze-travel-loop','fire');one('blaze-impact','fire',.5)
one('frost-launch','ice',.25);lp('frost-travel-loop','ice');one('frost-impact','ice',.5);tone('frost-end',1400,650,.24)
tone('arc-blade-launch',500,1400,.25);lp('arc-blade-flight-loop','flight');tone('arc-blade-return',1100,500,.3);tone('arc-blade-catch',1000,1700,.18);one('arc-blade-impact','electric',.3)
tone('arc-hammer-launch',300,1100,.24);add(G,'arc-hammer-bounce',impact(.22)+.45*tonal(.22,850,600,.3),'Hammer supporting-surface bounce.');one('arc-hammer-hit','electric',.32)
one('ink-activate','wet',.2);one('ink-impact','wet',.38)
tone('overdrive-activate',220,1100,.35);tone('overdrive-pulse',180,650,.16);tone('overdrive-expire',750,180,.28)
one('rocket-activate','electric',.5);lp('rocket-propulsion-loop','rocket',90);tone('rocket-return',650,180,.4)
# Package 4: menus and results controls
G='04-menus-results'
for name,notes,d in [('ui-focus',[700],.045),('ui-confirm',[650,1000],.065),('ui-back',[650,420],.065),('driver-select',[500,750,1000],.06),('ui-start-race',[750,1100],.1),('ui-pause',[600,450],.055),('ui-resume',[450,600],.055),('ui-setting-change',[850],.045),('ui-unavailable',[210,180],.055),('results-race-again',[600,900],.07),('results-change-driver',[550,750],.07),('results-return-hub',[750,500],.07)]: add(G,name,seq(notes,d,.015),name.replace('-',' '))
# Verify every exported WAV; loops must be quiet at boundary (no discontinuity click).
errors=[]
for c in cues:
    sr,x=wavfile.read(ROOT/c['file']);assert sr==SR and x.dtype==np.int16 and x.ndim==1
    if np.max(np.abs(x.astype(float)))>=32767: errors.append(c['id']+' clips')
    if c['loop'] and c['boundary_step']>.025: errors.append(c['id']+' loop boundary too large')
assert not errors, errors
manifest={'title':"Manaconda's Minigame Mayhem — Original SFX Review v1",'status':'Created for listening review; not integrated or owner accepted','baseline':'f4fc103c24e346252f93407637278cccdbd81eb8','format':'48 kHz mono PCM 16-bit WAV','authoring':'Original deterministic synthesis; no samples, copied franchise sounds, voice, or music assets','seed':330930,'cue_count':len(cues),'cues':cues}
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
with (ROOT/'cue-list.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=list(cues[0]));w.writeheader();w.writerows(cues)
(ROOT/'README.md').write_text('''# Manaconda’s Minigame Mayhem — SFX Review v1

Original synthesized sound effects, organized in the requested order. Assets are created for listening review, not integrated, approved, or published to production. No third-party sample material was used. This review uses an arcade mechanical/electronic sound direction; engine loops are stylized rather than recordings of real motors.

## Files and use
- `wav/`: 48 kHz mono 16-bit PCM WAVs with at least 3 dB peak headroom.
- `preview.html`: local listening page using relative WAV paths; click an individual Play control. Loops repeat until stopped. Stop All ends playback.
- `manifest.json` and `cue-list.csv`: IDs, duration, loop flag, measured levels, hashes, and descriptions.
- `create_sfx.py`: reproducible authoring source (Python, NumPy, SciPy); not game code.

Engine low/high layers are intended to blend. Nearby AI can reuse the same source layers with runtime spatialization. Runtime pitch, distance, gain, cue suppression and voice budgets remain integration work. Do not play all loops at once. Shared UI sounds can be reused; result action variants are optional alternatives. Item travel loops are candidate production coverage, not assertions that current runtime already supports every event.

Warnings are single pulses; runtime selects/escalates cadence. Countdown tick repeats for three counts. Finish and placement are short sound-effect motifs, not background music. Prismatic music and final-lap music remain outside this package. Nitro/Kinetic multi-charge variants reuse the same family cues.

Validation: files decoded successfully; no PCM clipping; non-loop fades; loop boundary steps checked; hashes recorded. No perceptual listening acceptance, actual browser listening, in-game mix, mobile speaker review or production performance acceptance is claimed.
''')
sections=[]
for g in dict.fromkeys(c['group'] for c in cues):
    cards=[]
    for c in [c for c in cues if c['group']==g]:
        cards.append(f'<article><strong>{html.escape(c["id"])}</strong><span>{c["duration_seconds"]} s · {"LOOP" if c["loop"] else "ONE-SHOT"}</span><p>{html.escape(c["description"])}</p><audio controls preload="none" {"loop" if c["loop"] else ""} src="{html.escape(c["file"])}"></audio></article>')
    sections.append('<section><h2>'+g+'</h2>'+''.join(cards)+'</section>')
(ROOT/'preview.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Minigame Mayhem SFX review</title><style>body{background:#101927;color:#edf3ff;font:16px system-ui;max-width:1000px;margin:auto;padding:24px}h1{font-size:28px}button{font:inherit;padding:12px;border-radius:8px;cursor:pointer}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}h2{grid-column:1/-1;font-size:21px;margin-top:36px}article{background:#1d2a40;padding:16px;border-radius:12px}strong,span{display:block}span,p{color:#bdc9df;font-size:14px}audio{width:100%}.top{position:sticky;top:0;background:#101927;padding:12px 0}</style><h1>Manaconda’s Minigame Mayhem</h1><p>Original sound-effects review v1. Use headphones first, then try phone speakers. These are synthesized assets awaiting listening approval.</p><div class="top"><button onclick="document.querySelectorAll('audio').forEach(a=>{a.pause();a.currentTime=0})">Stop all</button></div>'''+''.join(sections)+'''<script>document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(b=>{if(a!==b)b.pause()})));</script></html>''')
(ROOT/'validation.json').write_text(json.dumps({'cue_count':len(cues),'decoded':len(cues),'clipping_failures':errors,'loop_count':sum(c['loop'] for c in cues),'max_loop_boundary_step':max(c['boundary_step'] for c in cues if c['loop']),'groups':{g:sum(c['group']==g for c in cues) for g in dict.fromkeys(c['group'] for c in cues)},'perceptual_review':'pending'},indent=2))
print((ROOT/'validation.json').read_text())
