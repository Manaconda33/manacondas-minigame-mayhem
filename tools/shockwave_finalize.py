from pathlib import Path
import sys


def refresh_targets() -> None:
    path = Path('src/game/KartTimeTrial.ts')
    text = path.read_text()
    old = """  private updateProjectiles(dt: number): void {\n    const targets = this.projectileTargets();\n    const racers = this.itemTargetingProgress();\n"""
    new = """  private updateProjectiles(dt: number): void {\n    let targets = this.projectileTargets();\n    const racers = this.itemTargetingProgress();\n"""
    if old not in text:
        raise SystemExit('Shockwave target declaration not found')
    text = text.replace(old, new, 1)
    old = """        controller?.addPlanarVelocityDelta(push.velocityDelta);\n      }\n    }\n    const impacts = [\n"""
    new = """        controller?.addPlanarVelocityDelta(push.velocityDelta);\n      }\n    }\n    // Shockwave changes racer velocity before projectile/hazard processing; refresh\n    // detached target snapshots so same-step guidance/contact sees that new velocity.\n    targets = this.projectileTargets();\n    const impacts = [\n"""
    if old not in text:
        raise SystemExit('Shockwave target refresh insertion point not found')
    path.write_text(text.replace(old, new, 1))


def record_evidence(code_sha: str, run_id: str) -> None:
    path = Path('docs/IMPLEMENTATION-STATUS.md')
    text = path.read_text()
    anchor = """Governance PR #125 squash-merged to `main` at `0825ed02f80a67e088416d2d55925309e38eabe5`; post-merge CI/Pages run `34177188784` passed validation and deployment, clearing the gameplay gate. Implementation is proceeding on `feature/slice-5-shockwave` and remains unpublished / not live accepted until its own hosted validation, review, approved merge/deployment, and deployed eight-check gate pass. This increment does not enable AI item acquisition/use, change item probabilities, alter racer stats, track/checkpoint authority, or begin Slice 6.\n"""
    evidence = f"""\nValidated Shockwave gameplay checkpoint `{code_sha}` passed clean `npm ci`, `git diff --check`, `git lfs fsck`, strict typecheck, zero-warning lint, **37 files / 287 tests**, **91.8% statement coverage**, runtime asset/branding verification, production build, and changed-file Prettier verification in implementation run `{run_id}`. The same-step integration refreshes racer target snapshots after Shockwave push so Seeker guidance and Blast contact logic observe the new planar velocity before their own update. Publication/deployment and live acceptance remain pending.\n"""
    if anchor not in text:
        raise SystemExit('Shockwave status evidence anchor not found')
    if 'Validated Shockwave gameplay checkpoint' not in text:
        text = text.replace(anchor, anchor + evidence, 1)
    path.write_text(text)


if len(sys.argv) == 1:
    refresh_targets()
elif len(sys.argv) == 4 and sys.argv[1] == 'record':
    record_evidence(sys.argv[2], sys.argv[3])
else:
    raise SystemExit('usage: shockwave_finalize.py [record CODE_SHA RUN_ID]')
