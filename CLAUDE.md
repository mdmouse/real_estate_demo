# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

紫钰家装推客 (Ziyu Home-Renovation Referral) — a uni-app demo of a multi-level home-decoration lead-referral / commission platform. **No backend**: every screen reads from and mutates the in-memory reactive store in `src/store/mockData.ts`, which is seeded with sample users, leads, and transactions at module load.

Stack: Vue 3 (Composition API, `<script setup lang="ts">`) + uni-app 3 + Vite 5. Targets H5 and a long list of mini-program platforms (WeChat, Alipay, ByteDance, etc.) and native app-plus.

## Common commands

```bash
# H5 dev (browser) — the default target for local iteration
npm run dev:h5

# WeChat mini-program dev (writes compiled output for WeChat DevTools to open)
npm run dev:mp-weixin

# Production builds
npm run build:h5
npm run build:mp-weixin
```

There are no test, lint, or type-check scripts configured. `tsc` is not wired up; `.ts` files are compiled through Vite/uni's pipeline. Don't add lint/test infrastructure unless asked.

## Architecture

### Single source of truth: `src/store/mockData.ts`

This file is the entire backend. It exports a `reactive` `store` plus all domain types. **All commission math, role-based payout ratios, lead lifecycle transitions, and timeline events live here** — pages are thin views over this store.

Key shape:
- `users` — three-tier referral tree (V1 推客 / V2 合伙人 / V3 大队长), linked by `parentId`.
- `leads` — referral records with a five-stage lifecycle: `PENDING → MEASURED → SIGNED → WATER_ELEC → FURNITURE → COMPLETED` (plus `INVALID`). Stage transitions through `updateLeadStatus()` automatically append timeline entries and trigger commission distribution.
- `transactions` — append-only ledger. Commission writes happen as side effects of `updateLeadStatus()` / `addUpsell()` / `withdraw()`.
- `currentUser` — set by `loginAs(userId)`; the bottom of the file seeds `loginAs('u4')` and creates three demo leads so the app boots with realistic data even on first load.

Critical invariant: `distributeCommission()` walks `parentId` upward and pays each ancestor only the **difference** between their role rate and the highest rate seen so far (`DIFF_COMM` ledger type). When changing commission logic, preserve this "level-difference" model — V1 gets `ROLE_RATES.V1`, an upstream V2 gets `(V2 rate − V1 rate)`, etc. Stage payouts are gated by `STAGE_PAYOUT_RATES` (30/20/20/30 across SIGNED/WATER_ELEC/FURNITURE/COMPLETED); `pendingBalance` tracks unreleased commission and is moved into `balance` as stages complete.

**Demo dashboards are partly faked, not derived.** Several read helpers blend real store data with hardcoded constants to make the demo look populated: `getDownlines()` injects a `fakeComms` lookup and forces `u4`'s `daysSinceLastLead` to 32 (the "30天未开单" warning); `getTeamStats()` adds `+128` leads, `+12` team size, and `+24500` to the diff-commission total; `getLeaderboard()` returns a fixed podium; and `store.radarLogs` (visitor-tracking feed) is static seed data. When wiring up or restyling team/marketing pages, know these numbers are theatrical — don't treat them as computed truth or "fix" them to match the actual ledger unless asked.

### Routing & navigation

uni-app routing is declarative — every page must be registered in `src/pages.json`. Adding a new page means: create `src/pages/<dir>/<name>.vue`, register its path in `pages.json` `pages[]`, and optionally add it to `tabBar.list` if it's a bottom-tab destination. Navigate at runtime with `uni.navigateTo({ url })` for stack pushes and `uni.switchTab({ url })` for tab destinations — the four tab pages (`index`, `marketing`, `team`, `my`) must use `switchTab`, others use `navigateTo`.

The login screen (`pages/login/login.vue`) is a role-picker that calls `store.loginAs()` and then `switchTab` into the workbench; there is no real auth.

### Styles

Global utility classes (`.card`, `.btn-primary`, `.btn-gold`, `.text-gradient`) live in `src/App.vue` and are available to all pages. The brand palette is purple→gold (`#4a148c`, `#7e57c2`, `#d4af37`); preserve this when restyling. Per-page styles are colocated and usually `scoped`.

### Role-conditional UI

The workbench (`pages/index/index.vue`) renders different stat cards for V1 vs V2/V3 users via `['V2', 'V3'].includes(currentUser?.role)`. Several other pages (team, my, marketing) follow the same pattern — when adding role-specific features, check existing pages for the conditional style before inventing a new one.

## Notes for changes

- Mock-data seeding at the bottom of `mockData.ts` runs once at import time. If you add fields to `User`/`Lead`/`Transaction`, update the seed calls too or the demo will render with `undefined` values.
- `store.currentUser` is typed as non-null (`null as unknown as User`) because seeding always logs in `u4` immediately. Don't add nullable guards on `currentUser` unless you're also changing the boot sequence.
- The repo has no CI, no tests, and no commit history — treat it as a throwaway prototype unless told otherwise.
