from pathlib import Path

ROOT = Path('.')


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding='utf-8')


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        if new in text:
            return text
        raise SystemExit(f'missing expected marker for {label}')
    return text.replace(old, new, 1)


# README
path = 'README.md'
text = read(path)
old = "Vision-Obscuring Ink Splat governance is approved and published under amendment 2.18 / ADR-079, and its bounded gameplay/presentation implementation is now authorized and in progress locally; it is not merged, deployed, or live accepted. Continuous Nitro Overdrive and Hyper-Drive Rocket remain unimplemented."
new = "Vision-Obscuring Ink Splat gameplay and approved original procedural presentation are **DEPLOYED / LIVE ACCEPTANCE PENDING** under amendment 2.18 / ADR-079. PR #148 merged at `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`; hosted PR CI `35168738421` and post-merge validation/Pages `35168880807` passed. Continuous Nitro Overdrive and Hyper-Drive Rocket remain unimplemented."
text = replace_once(text, old, new, 'README Ink state')
write(path, text)

# Implementation status
path = 'docs/IMPLEMENTATION-STATUS.md'
text = read(path)
text = replace_once(
    text,
    '**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - INK SPLAT IMPLEMENTATION IN PROGRESS**',
    '**Slice 5 - Item Boxes, Weapons & Position-Based Distribution - INK SPLAT DEPLOYED / LIVE ACCEPTANCE PENDING**',
    'status heading',
)
text = replace_once(
    text,
    'Authorized Ink implementation baseline: governance-published `main` **`b62c96ae8297150d8f4cafaede4623d5b01a1e0b`**; local implementation remains unmerged and un-deployed.',
    'Authorized Ink implementation baseline: governance-published `main` **`b62c96ae8297150d8f4cafaede4623d5b01a1e0b`**. Ink gameplay is now deployed from PR #148 merge **`2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`**; product-owner live acceptance remains pending.',
    'status baseline',
)
start = text.index('## Vision-Obscuring Ink Splat local implementation - 2026-09-16')
end = text.index('\n## Slice 5 accepted/deployed state', start)
replacement = '''## Vision-Obscuring Ink Splat deployed implementation - 2026-09-16

Vision-Obscuring Ink Splat gameplay plus the approved original procedural/CSS presentation and original impact audio are **DEPLOYED / LIVE ACCEPTANCE PENDING** under amendment 2.18 / ADR-079. No product-owner live result is claimed yet.

Publication evidence:

- Governance PR #147 merge: `b62c96ae8297150d8f4cafaede4623d5b01a1e0b`; PR CI `35145111221` and post-merge validation/Pages `35145254188` passed; publication evidence comment `5703901606`.
- Manny separately authorized bounded Ink gameplay, VFX, audio, and presentation implementation and later explicitly approved merge and deployment of `feature/ink-splat-gameplay`.
- Supplied remote implementation checkpoint: `9c7dfe354d6f4f55147b7f7ba1abaaa9d2fbd429` (reported content-equivalent to local `d0ea786`).
- Review found and corrected one material issue before publication: the AI history sampler selected the oldest eligible retained decision, which could stretch the governed 0.080-second reaction latency toward approximately 0.30 seconds. The corrected sampler selects the newest decision at or before the 0.080-second cutoff, and `tests/ink-ai-latency.test.ts` locks that behavior.
- Final reviewed gameplay head: `1ff4e9acdb5e9464f19c059183f08a42712109a2`.
- Hosted PR #148 CI `35168738421`: PASS — Git LFS verification, clean `npm ci`, strict typecheck, zero-warning lint, **54 test files / 463 tests**, **81.97% statement / 77.31% branch / 86.56% function / 83.52% line coverage**, branding/runtime-asset verification and production build.
- PR #148 squash merge: **`2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`**.
- Post-merge validation / GitHub Pages run **`35168880807` PASS**, including successful Pages deployment.
- Publication evidence: PR #148 comment **`5706830348`**.
- Existing Vite large-chunk warning remains known/nonblocking.
- Three moderate npm audit findings remain in the unchanged dependency set.

Deployed behavior includes progress-authoritative all-racers-ahead targeting, atomic one-charge use, per-target immunity, 2.50-second refresh-without-stacking state, human partial Ink overlay below HUD/touch controls, bounded AI impairment, original impact audio, deterministic incoming/Prismatic fixtures, production runtime wiring, recovery persistence, finish/restart/disposal cleanup, and zero shared projectile/hazard capacity use.

The remaining Ink gate is Manny's deployed desktop/mobile live acceptance matrix. Do not infer a browser/device or scenario pass until Manny reports it.
'''
text = text[:start] + replacement + text[end:]
text = text.replace(
    'Vision-Obscuring Ink Splat governance is approved under amendment 2.18 / ADR-079 and bounded local gameplay/presentation implementation is in progress after Manny\'s separate authorization. Ink is not merged, deployed, or live accepted. Three item effects remain not live accepted: **Vision-Obscuring Ink Splat, Continuous Nitro Overdrive, and Hyper-Drive Rocket**.',
    'Vision-Obscuring Ink Splat is deployed under amendment 2.18 / ADR-079 and awaits product-owner live acceptance. Three item effects remain not live accepted: **Vision-Obscuring Ink Splat, Continuous Nitro Overdrive, and Hyper-Drive Rocket**.',
)
text = replace_once(
    text,
    'Complete local Ink validation, then prepare the separate gameplay publication checkpoint. Do not merge, deploy, or claim live acceptance from this implementation branch. Slice 6 remains locked.',
    'Run the deployed Vision-Obscuring Ink Splat live-acceptance matrix on the published Pages build. Do not mark Ink live accepted until Manny explicitly reports the deployed results. Slice 6 remains locked.',
    'next action',
)
text = replace_once(
    text,
    '**Vision-Obscuring Ink Splat scope/governance:** **APPROVED / PUBLISHED 2026-09-16** under amendment 2.18 / ADR-079; gameplay, VFX, audio, and presentation implementation is separately authorized and **IN PROGRESS LOCALLY**, not live accepted.',
    '**Vision-Obscuring Ink Splat scope/governance:** **APPROVED / PUBLISHED 2026-09-16** under amendment 2.18 / ADR-079. **Gameplay + original presentation:** **DEPLOYED / LIVE ACCEPTANCE PENDING** through PR #148 / `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d` / runs `35168738421` and `35168880807` / publication comment `5706830348`.',
    'approval state',
)
write(path, text)

# Decision log
path = 'docs/DECISIONS.md'
text = read(path)
text = replace_once(
    text,
    '- **Status:** APPROVED GOVERNANCE SCOPE. Gameplay and presentation implementation are not authorized by this checkpoint.\n- **Approval:** Manny approved the complete Vision-Obscuring Ink Splat governance/scoping contract in Work after Kinetic Arc Hammers live acceptance.',
    '- **Status:** **DEPLOYED / LIVE ACCEPTANCE PENDING.** Governance PR #147 and gameplay PR #148 are merged; hosted gameplay PR CI `35168738421` and post-merge validation/Pages `35168880807` passed.\n- **Approval:** Manny approved the complete Vision-Obscuring Ink Splat governance/scoping contract after Kinetic Arc Hammers live acceptance, separately authorized implementation/presentation, and explicitly approved the reviewed gameplay merge and deployment.',
    'ADR-079 status',
)
marker = '- **Boundary:** No gameplay, VFX/audio implementation, probabilities, accepted-item tuning, racer stats, kart physics, Circuit Alpha authority, AI item acquisition/use, dependency, Overdrive, Rocket, or Slice 6 work is authorized by this governance publication.'
replacement = marker + '\n- **Implementation/publication:** Initial remote checkpoint `9c7dfe354d6f4f55147b7f7ba1abaaa9d2fbd429` was reviewed against amendment 2.18. Review corrected the AI latency history sampler so 0.080 s means the newest decision at/before the cutoff rather than the oldest retained sample; regression coverage was added. Final reviewed head `1ff4e9acdb5e9464f19c059183f08a42712109a2` passed PR CI `35168738421` with 54 files / 463 tests. PR #148 squash-merged at `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`; post-merge validation/Pages `35168880807` passed. Product-owner live acceptance remains open.\n- **Current boundary:** Deployment does not authorize probability changes, accepted-item retuning, racer-stat/kart-physics/race-authority changes, general AI item acquisition/use, dependencies, Overdrive, Rocket, or Slice 6 work.'
text = replace_once(text, marker, replacement, 'ADR-079 publication')
write(path, text)

# Scope
path = 'docs/SLICE-5-INK-SPLAT-SCOPE.md'
text = read(path)
text = replace_once(
    text,
    '**Status:** APPROVED GOVERNANCE SCOPE - GAMEPLAY/PRESENTATION IMPLEMENTATION HELD',
    '**Status:** GAMEPLAY/PRESENTATION DEPLOYED - PRODUCT-OWNER LIVE ACCEPTANCE PENDING',
    'scope status',
)
old = '''1. **Scope/governance approval:** COMPLETE - Manny approved this contract on 2026-09-16.
2. **Governance publication:** requires docs-only PR, hosted CI, merge, and post-merge validation/Pages.
3. **Gameplay/presentation authorization:** BLOCKED until Manny explicitly authorizes implementation after gate 2 clears.
4. **Gameplay publication:** later PR after implementation and full automated validation.
5. **Product-owner live acceptance:** later deployed manual review.
6. **Slice 5 closure:** still blocked by remaining item effects, full AI item-use/tactics, all-item interaction/counter evidence, soak/performance, final desktop/mobile full-slice acceptance, and other recorded closure gates.'''
new = '''1. **Scope/governance approval:** COMPLETE - Manny approved this contract on 2026-09-16.
2. **Governance publication:** COMPLETE - PR #147 merge `b62c96ae8297150d8f4cafaede4623d5b01a1e0b`; PR CI `35145111221`; post-merge validation/Pages `35145254188`.
3. **Gameplay/presentation authorization:** COMPLETE - Manny separately authorized bounded gameplay, VFX, audio, and presentation implementation.
4. **Gameplay publication:** COMPLETE - reviewed head `1ff4e9acdb5e9464f19c059183f08a42712109a2`; PR #148 CI `35168738421`; squash merge `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`; post-merge validation/Pages `35168880807`.
5. **Product-owner live acceptance:** OPEN - deployed manual review required; no browser/device or scenario pass is inferred yet.
6. **Slice 5 closure:** still blocked by Ink live acceptance, remaining item effects, full AI item-use/tactics, all-item interaction/counter evidence, soak/performance, final desktop/mobile full-slice acceptance, and other recorded closure gates.'''
text = replace_once(text, old, new, 'scope gates')
publication = '''\n## Gameplay publication checkpoint - 2026-09-16\n\nManny approved merge and deployment of the bounded Ink implementation. Review corrected the 0.080-second AI reaction-latency sampler before publication and added a regression test that distinguishes the correct newest-at-cutoff sample from stale retained history. Final reviewed head `1ff4e9acdb5e9464f19c059183f08a42712109a2` passed hosted PR CI `35168738421` with **54 test files / 463 tests** and **81.97% statement / 77.31% branch / 86.56% function / 83.52% line coverage**. PR #148 squash-merged at `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`; main validation and GitHub Pages run `35168880807` passed. PR #148 comment `5706830348` records publication evidence.\n\nThis proves deployment, not live acceptance. The manual matrix above remains the product-owner gate.\n'''
if '## Gameplay publication checkpoint - 2026-09-16' not in text:
    text += publication
write(path, text)

# Testing evidence
path = 'docs/TESTING.md'
text = read(path)
publication = '''\n## Vision-Obscuring Ink Splat gameplay publication evidence - 2026-09-16\n\nFinal reviewed gameplay head `1ff4e9acdb5e9464f19c059183f08a42712109a2` passed hosted PR CI `35168738421`: Git LFS verification, clean install, strict typecheck, zero-warning lint, **54 test files / 463 tests**, **81.97% statement / 77.31% branch / 86.56% function / 83.52% line coverage**, branding/runtime-asset verification, and production build. Review added `tests/ink-ai-latency.test.ts` after correcting the history sampler to select the newest decision at or before the governed 0.080-second cutoff rather than the oldest retained decision.\n\nPR #148 squash-merged at `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`; post-merge validation and GitHub Pages run `35168880807` passed. Publication evidence is PR #148 comment `5706830348`. This establishes deployed automated evidence only. The documented desktop/mobile live acceptance matrix remains open and must not be inferred from CI.\n'''
if '## Vision-Obscuring Ink Splat gameplay publication evidence - 2026-09-16' not in text:
    text += publication
write(path, text)

# Item-system continuity
path = 'docs/SLICE-5-ITEM-SYSTEM-DESIGN.md'
text = read(path)
publication = '''\n## Vision-Obscuring Ink Splat gameplay publication - deployed 2026-09-16\n\nThe amendment 2.18 / ADR-079 implementation is deployed through PR #148 at `2df6bf372b01e8a0f13c4bad71737ef8f5ab415d`. Hosted PR CI `35168738421` and post-merge validation/Pages `35168880807` passed after review corrected the AI 0.080-second reaction-latency history sampler and added regression coverage. The Ink functional checklist remains incomplete until Manny performs and accepts the deployed desktop/mobile live matrix. Continuous Nitro Overdrive, Hyper-Drive Rocket, full AI item-use/tactics, final interaction/counter evidence, soak/performance, and overall Slice 5 acceptance remain open.\n'''
if '## Vision-Obscuring Ink Splat gameplay publication - deployed 2026-09-16' not in text:
    text += publication
write(path, text)
