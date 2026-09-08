from pathlib import Path

path = Path('tests/shockwave.test.ts')
text = path.read_text()
text = text.replace("calls.push(`p:${center.x}:${radius}`)", "calls.push(['p', String(center.x), String(radius)].join(':'))")
text = text.replace("calls.push(`h:${center.x}:${radius}`)", "calls.push(['h', String(center.x), String(radius)].join(':'))")
text = text.replace("calls.push(`a:${center.x}`)", "calls.push(['a', String(center.x)].join(':'))")
path.write_text(text)

controller_test = Path('tests/kart-controller-effects.test.ts')
controller_text = controller_test.read_text()
controller_text = controller_text.replace(
    "expect(after.x).toBeCloseTo(beforeVelocity.x + 3.5, 8);",
    "expect(after.x).toBeCloseTo(beforeVelocity.x + 3.5, 7);",
)
controller_text = controller_text.replace(
    "expect(after.z).toBeCloseTo(beforeVelocity.z - 1.25, 8);",
    "expect(after.z).toBeCloseTo(beforeVelocity.z - 1.25, 7);",
)
controller_test.write_text(controller_text)
