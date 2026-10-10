# T9.7 city ground correction evidence — 2026-10-09

All render reports and screenshots were captured from the isolated correction worktree using local Chromium with SwiftShader. These are structural and visual review evidence, not G-05 hardware performance certification.

## Scope and result

- Added visible terraced ground to the Skyline city and Falls backdrop, clipped from the Service Tunnel road corridor and the Billboard/Dive junction aprons.
- Shared stepped tower geometry with existing Skyline buildings; placed foundations so the 22 Skyline towers and 24 Falls towers meet or overlap the ground.
- Kept the ground and supports presentation-only with collision disabled. Falls tower/window counts remain 24/320 at medium quality.
- Full-course render: 34 stations, zero HTTP/page/render errors, peak 418 calls / 412,719 triangles. This is below the 500-call / 425,000-triangle engineering ceilings and the 500-call / 750,000-triangle PRD caps.
- Skyline sector: +34 calls against +36, peak 286 calls / 350,775 triangles; zero errors.
- Falls extension sector: +24 calls against +28, peak 272 calls / 336,871 triangles; zero errors.
- Raycast checks cover the Billboard Gap roadway and the Waterfall Dive's full 5 m landing width, sampled at no more than 1 m intervals; the Service Tunnel clearance check remains in place.
- Fixed-view captures reported zero HTTP/page/console errors. The 1440×900 terrace image is a diagnostic free-camera angle to show the foundations and city base; chase captures retain in-race framing.
- Software-renderer frame timing is omitted and cannot certify G-05.

## Reports

- [Full course](full-course-render-check.json)
- [Skyline sector](skyline-sector-render-check.json)
- [Falls sector](falls-sector-render-check.json)
- [Fixed-view captures](fixed-view-render-check.json)

## Race and geometry views

- [Waterfall approach, mobile portrait](falls-waterfall-approach-mobile-portrait.png)
- [Waterfall, mobile portrait](falls-waterfall-mobile-portrait.png)
- [Waterfall, mobile landscape](falls-waterfall-mobile-landscape.png)
- [Waterfall, desktop](falls-waterfall-desktop.png)
- [Skyline, mobile portrait](skyline-mobile-portrait.png)
- [Waterfall city terraces, diagnostic angle](falls-terrace-diagnostic-angle.png)
- [Full-course waterfall rear view](full-course-waterfall-dive-rear.png)
- [Full-course Skyline chase view](full-course-skyline-chase.png)

## Before and after reference

- [Previous owner-preview view at runtime `f4672ef`](before-waterfall-mobile-portrait.png)
- [Corrected waterfall view at the same mobile portrait station](falls-waterfall-approach-mobile-portrait.png)
