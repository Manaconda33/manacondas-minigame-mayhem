# Independent review resolution

Reviewer: fresh-context read-only review of runtime head e42dc1118796a2bd42d0677d35f0133c0ca1a577 against main 4fe73c58e4c51201f917658e705fca8b2b3db8ec.

Two Important issues fixed in one pass with observed failing assertions before fixes: (1) black mask now retains customized MeshBasic coverage hooks, including dustOpacity per-instance fading; (2) scoped Three shader-error detection and owned framebuffer completeness checks activate once-only direct-render fallback, restoring hooks and renderer/scene state. Review's structural coverage gap was regraded Important and covered by per-pass injected failures, target-induced viewport changes, mixed-material/instance colors and repeated source disposal/recreation. No deferred minor remains.

Reviewer did not exercise GPU pixels/device timing, hosted CI or private preview. Those remain separate evidence; no context-loss work or earlier acceptance was reopened. Full final validation: 95 files/743 tests; typecheck/lint/assets/build passed. No second review dispatch was performed.
