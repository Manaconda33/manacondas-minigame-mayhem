from pathlib import Path

path = Path('tests/shockwave.test.ts')
text = path.read_text()
text = text.replace("calls.push(`p:${center.x}:${radius}`)", "calls.push(['p', String(center.x), String(radius)].join(':'))")
text = text.replace("calls.push(`h:${center.x}:${radius}`)", "calls.push(['h', String(center.x), String(radius)].join(':'))")
text = text.replace("calls.push(`a:${center.x}`)", "calls.push(['a', String(center.x)].join(':'))")
path.write_text(text)
