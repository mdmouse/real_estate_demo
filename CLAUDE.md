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

This file is the entire backend. It exports a `reactive` `store` plus all domain types and the `REWARDS` / `ROLE_NAMES` / `STATUS_NAMES` constant maps. **All reward math, promotion rules, lead lifecycle transitions, and timeline events live here** — pages are thin views over this store.

Key shape:
- `users` — three-tier referral tree (V1 注册推荐官 / V2 经纪人 / V3 高级经纪人), linked by `parentId`. The role short codes (`'V1'|'V2'|'V3'`) are the API; `ROLE_NAMES` maps them to Chinese display labels.
- `leads` — referral records with lifecycle `PENDING → MEASURED → SIGNED → WATER_ELEC → FURNITURE → COMPLETED` (plus `INVALID`). `updateLeadStatus()` appends a timeline entry on every transition and fires rewards at two stages only.
- `transactions` — append-only ledger (`pushTx()`). Reward writes are side effects of `updateLeadStatus()` / `addUpsell()` / `recruit()`→`checkPromotion()` / `withdraw()`.
- `currentUser` — set by `loginAs(userId)`; the bottom of the file seeds `loginAs('u4')` and creates four demo leads so the app boots populated.
- `pendingNotice` + `takeNotice()` — one-shot toast channel for promotion / milestone events; pages read it once then it clears.

**Reward model is event-based, not a rate table.** Everything keys off the `REWARDS` constants. Two payout moments:
- **MEASURED** — referrer gets `LEAD_BONUS` (¥200) and `monthlyMeasureCount++`; hitting `PERF_MEASURE_THRESHOLD` (5/month) pays `PERF_BONUS` (¥1000), deduped via `perfBonusGranted`. Then `checkPromotion()` runs (a measured lead counts as a "valid customer").
- **SIGNED** → `distributeOnSign()` settles the contract **in full, once**: `SIGN_BONUS` (¥200) + `NODE_COMM` (3% of contract) to the referrer; `MGMT_SHARE` to the nearest V3 ancestor (`findSeniorAncestor()`) — 30% of the node commission if the referrer is V3, 20% if V2, nothing if V1; `CHANNEL_OVERRIDE` to the **direct** parent if that parent is V3 (3‰ of contract, capped at `CHANNEL_CAP` ¥30k/month via `channelOverrideMonth`). WATER_ELEC / FURNITURE / COMPLETED add timeline events but pay nothing.

Critical invariant: signing pays everything immediately — there is **no** stage-gated escrow. `pendingBalance` is a vestigial field kept at 0; don't reintroduce deferred-release logic against it unless asked.

Promotions (`checkPromotion()`, called after a measure or a recruit): **V1→V2** when `validCustomerCount ≥ PROMO_VALID_CUSTOMERS` (3 measured-or-later leads); **V2→V3** when `developedAgentsCount ≥ PROMO_AGENTS` (3 direct V2 children), which pays `CHANNEL_MGMT_AWARD` (¥2000) to the promotee and `ASSIST_AWARD` (¥1000) to their parent. `recruit()` exists only to demo this fan-out. `withdraw(amount)` enforces compliance rules and returns `{ ok, msg }`: the amount must be an integer ≥ ¥100; daily limits are ≤ 3 withdrawals and ≤ ¥10,000 total (tracked via `withdrawCountToday` / `withdrawAmountToday` / `lastWithdrawDate` on `User`, reset on date change); it deducts a single service fee of `8% + ¥3/transaction` (net = `amount × 0.92 − 3`; the 6% tax was intentionally dropped — fee and tax are **not** stacked), then writes a negative ledger row. Validation failures return `ok:false` with a message and do **not** mutate the ledger.

**Most dashboards are now derived from the store — but a few values are still theatrical.** `getDownlines()`, `getDirectDownlines()`, `getTeamStats()`, and `getLeaderboard()` compute from real `users`/`leads`/`transactions` (an earlier faked-constants version was removed). Two team-scope conventions to know: per a compliance/anti-pyramid review, the **team page list** and the workbench **「推广部」count** (`getTeamStats().teamSize`) only count **direct** children (`getDirectDownlines()` — `parentId === self`), not the full subtree; each row shows that child's **直客线索总数** (`leadsCount`), not a commission figure. `getDownlines()` keeps the **recursive** whole-subtree walk and is still used by the leaderboard, so don't collapse the two. The remaining non-real bits: `store.radarLogs` (visitor-tracking feed) is static seed data, and the `daysSinceLastLead` field (both getters) is a stub heuristic — `3` if the downline has any lead, else `35` (the churn-risk flag) — not a real recency calc. Don't treat those two as computed truth.

### Routing & navigation

uni-app routing is declarative — every page must be registered in `src/pages.json`. Adding a new page means: create `src/pages/<dir>/<name>.vue`, register its path in `pages.json` `pages[]`, and optionally add it to `tabBar.list` if it's a bottom-tab destination. Navigate at runtime with `uni.navigateTo({ url })` for stack pushes and `uni.switchTab({ url })` for tab destinations — the four tab pages (`index`, `marketing`, `team`, `my`) must use `switchTab`, others use `navigateTo`.

The login screen (`pages/login/login.vue`) is a role-picker that calls `store.loginAs()` and then `switchTab` into the workbench; there is no real auth.

### Styles

Global utility classes (`.card`, `.btn-primary`, `.btn-gold`, `.text-gradient`) live in `src/App.vue` and are available to all pages. The brand palette is purple→gold (`#4a148c`, `#7e57c2`, `#d4af37`); preserve this when restyling. Per-page styles are colocated and usually `scoped`.

### Role-conditional UI

The workbench (`pages/index/index.vue`) renders different stat cards for V1 vs V2/V3 users via `['V2', 'V3'].includes(currentUser?.role)`. Several other pages (team, my, marketing) follow the same pattern — when adding role-specific features, check existing pages for the conditional style before inventing a new one.

## Notes for changes

- Mock-data seeding at the bottom of `mockData.ts` runs once at import time and drives the leads through `updateLeadStatus()`/`addUpsell()`, so balances and the ledger are *built by replaying the reward engine* — not hardcoded. New `User` fields should get a default in the `newUser()` factory (it spreads `...u` over base defaults); new `Lead`/`Transaction` fields need updating in `addLead()`/`pushTx()` and any direct seed calls or the demo renders `undefined`.
- `store.currentUser` is typed as non-null (`null as unknown as User`) because seeding always logs in `u4` immediately. Don't add nullable guards on `currentUser` unless you're also changing the boot sequence.
- No CI, no tests, no lint/type-check scripts — treat it as a throwaway prototype unless told otherwise.
