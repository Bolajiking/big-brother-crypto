# Star Factor — Engineering Handoff

**Last updated:** 2026-05-06
**Branch:** `main` (uncommitted working changes — see "Working tree" below)
**Stack:** Next.js 15.5.9 (App Router, Turbopack) · React 19 · TypeScript · Tailwind 3 · Prisma 6 + Postgres · Privy auth · Livepeer HLS · Paystack · Zustand · Socket.io (server.js, not active in `next dev`)

---

## 1. What this product is

Star Factor is a Big-Brother-style 24/7 reality show streaming platform with embedded prediction markets, fan voting, chat, and a stakes/clout dual-currency wallet. The "watch" page is the core product surface — single feed by default, multicam ("Director's Booth") on demand, side dock for predict / chat / leaderboard, plus a clickable house heatmap for room navigation.

Brand & theme: **warm magazine paper** (cream paper + dark stage), Lagos-time daylight engine drives accent colours through the day.

---

## 2. Recently shipped (this engagement)

### Watch page (`src/app/watch/page.tsx`, ~2540 lines)

- **House Heatmap section** (Director's Booth variation D, ported from `starfactor-tv 2/project/pages/sf-watch-d.jsx`)
  - SVG floor plan, 10 rooms, heat-shaded by attention.
  - Click a room → switches primary cam.
  - Cast position dots draggable for `follow` mode.
  - Legend (Hot/Task/Solo/Idle) + active-follow chip.
- **Floating `<DemoToggle>`** — subtle bottom-left pill (opacity 0.78 → 1 on hover). Switches `dataMode` between `demo` and `real`.
- **Live = idle:** `isIdle = dataMode === 'real'`. Live mode strips all populated demo content and replaces with indicative notices/CTAs:
  - Stage: "Be the first one watching" + SEE IT IN DEMO + OPEN A MARKET
  - Cam rail: dashed CAM 01–08 placeholders
  - Reactions row: "Reactions unlock when cameras go live" + NOTIFY ME
  - Show meta: "Cast revealed at lights-on" pill (no avatars/odds)
  - Cast section: notice + NOTIFY ME / APPLY TO BE CAST
  - Schedule: "Tonight's slate posts at 19:00" + ADD TO CALENDAR
  - Heatmap: heat dimmed, watcher counts → "—", cast positions hidden
  - Predict grid: notice + OPEN FIRST MARKET / NOTIFY ME
  - Hot strip + ticker: idle copy
  - Dock predict: dashed empty + OPEN FIRST MARKET
  - Dock chat: "Chat warming up" header + "Be the first take" empty
  - Dock leaderboard: trophy notice + OPEN FIRST MARKET
- **Copy/CTA pass:** PRODUCT_STACK, FLOW_STACK, eviction-night card, wallet-loop card all rewritten from explanatory paragraphs → action-led one-liners. Action buttons added to each panel (CASH OUT / TOP UP / BACK A CAST / SEE LIVE / SEE DEMO).
- **Icon-first quick actions** below the H1 (Follow / Tip / Gift / Clip / Share) with hover tooltips.
- **Stream controls** (pause, mute, pin, clip, share, fullscreen) all `<button title="…">` icon buttons.

### Mobile (`src/components/MobileLayout.tsx`, ~1010 lines)

- `dataMode` + `onDataModeChange` plumbed from desktop.
- Inline Demo/Live pill in header (color-coded: coral demo / mint live).
- Idle stage overlay matches desktop.
- Quick-action icon row under H1 (Follow / Tip / Gift / Clip / Share).
- Director grid + channel rail render dashed CAM 01–06 placeholders in idle.
- Idle suppresses LIVE pill, watcher count, featured market overlay, demo chat seed.
- Predict tab idle: OPEN FIRST MARKET notice.
- Chat tab idle: "Be the first take" empty card.

### Untouched but adjacent

- `src/app/page.tsx` (1529 lines) — homepage. Lightly edited (mostly untouched).
- `src/app/apply/page.tsx` (514 lines) — cast application form. Heavily refactored upstream of this engagement.
- `src/components/SunArcIndicator.tsx` + `src/lib/daylight.ts` — Lagos-time-driven sun arc + accent palette engine.
- `src/app/globals.css` — magazine paper theme, sf-* utility classes.

### Working-tree state (not yet committed)

```
M src/app/apply/page.tsx
M src/app/globals.css
M src/app/page.tsx
M src/app/watch/page.tsx
M src/components/MobileLayout.tsx
?? src/components/SunArcIndicator.tsx
?? src/lib/daylight.ts
?? HANDOFF.md (this file)
?? Investor briefs / pitch decks / market research markdowns
```

Verified: `tsc --noEmit` clean, `eslint` clean, dev server boots in ~1.1s, `/watch` compiles in ~5s and serves 200.

---

## 3. Architecture map

### Pages (`src/app/`)

| Route | File | Status |
|---|---|---|
| `/` | `page.tsx` | Homepage — magazine layout. Mostly static. |
| `/watch` | `watch/page.tsx` | **Core product.** Single + multicam + dock + heatmap + demo toggle. |
| `/apply` | `apply/page.tsx` | Cast application form. Submits where? — unclear (audit needed). |
| `/login` | `login/page.tsx` | Privy entry shim. |
| `/payment/callback` | `payment/callback/page.tsx` | Paystack post-payment verifier. Calls `/api/payments/verify`. |

### API routes (`src/app/api/`)

| Endpoint | Backend | Purpose |
|---|---|---|
| `auth/me` | Prisma | Get current user. |
| `auth/verify` | Prisma | Privy ID → User upsert. |
| `cameras` | **`db.json` (NOT Prisma!)** | Returns active cameras. **Mismatch with schema.** |
| `contestants` | Prisma | Cast roster. |
| `markets` | Prisma | Prediction markets. **Watch page does not consume this.** |
| `payments/banks` | Paystack | List Nigerian banks for withdrawal. |
| `payments/initialize` | Paystack | Start top-up. |
| `payments/verify` | Paystack | Verify reference, credit stakes. |
| `payments/withdraw` | Paystack | Bank transfer withdrawal. |
| `socket` | Stub | Returns `not_implemented`. **Real socket.io lives in `server.js` but is NOT used by `next dev`.** |
| `user/upgrade-tier` | Prisma | Tier purchase via clout. |
| `wallet` | Prisma | Get balances. |
| `wallet/claim-daily` | Prisma | Daily clout login bonus. |

### Stores (`src/stores/` — Zustand)

| Store | Source of truth |
|---|---|
| `userStore` | Local + hydrated from `/api/auth/verify`. Holds `balance.{stakes,clout}`. |
| `predictionStore` | **Local demo only.** `initializeDemoData()` seeds 4 demo markets. Watch page reads from this. **Never calls `/api/markets`.** |
| `marketStore` | Unused? (Audit.) |
| `contestantStore` | Unused on watch page. |

### Schema (`prisma/schema.prisma`, 386 lines)

Complete data model exists for: `User`, `Season`, `Contestant`, `Camera`, `Market`, `MarketOption`, `Prediction`, `VotingWindow`, `Vote`, `Transaction`, `ChatMessage`. Enums for tiers, statuses, vote/transaction types are defined. **Most of this is not yet wired to the UI.**

### External integrations

- **Privy** (`src/lib/privy.tsx`) — auth provider. App ID env-driven. Wired in `RootLayout`.
- **Livepeer** (`src/components/LivepeerPlayer.tsx`) — HLS playback via `https://playback.livepeer.studio/hls/{playbackId}/index.m3u8`. Stream IDs / playback IDs hard-coded in `db.json`.
- **Paystack** (`src/lib/paystack.ts`) — Nigerian payments. Top-up flow tested.
- **Solana** (`@solana/kit`, `@solana/web3.js`, SPL token deps) — installed but **no source code uses it.** Future crypto rail.
- **Remotion** — installed for video rendering pipelines (not used in app yet).

### Real-time

- `server.js` is a custom Next + socket.io server (npm script `dev-server`). Local dev currently uses `next dev --turbopack` (`npm run dev`), which **does NOT pick up `server.js`** — so socket.io is effectively dormant.
- Chat is local state in component; no persistence, no broadcast.
- Predictions are local zustand state; no broadcast on bet placement.

---

## 4. Demo vs Live data flow (current)

```
Demo mode (default):
  Watch page → predictionStore (zustand demo seed)
            → SEED_CHAT (local array)
            → CAST / SCHEDULE / LEADERBOARD / HOT_STRIP (local arrays)
            → cameras from /api/cameras (db.json, isActive=true tiles)

Live mode (DemoToggle → real):
  isIdle = true (forced)
  Every demo array suppressed at render
  Notices + CTAs render in their place
  Cameras still fetched but stage shows offline overlay
```

The toggle is currently UI-only — switching to Live does **not** flip a backend feature flag, doesn't pull real markets from `/api/markets`, doesn't subscribe to a live socket, doesn't query real cam isActive status. It's a presentation switch designed so phase-2 wiring can hook real data sources behind the same `isIdle` boolean.

---

## 5. What's left for a fully working product

Grouped by capability. Each item is sized roughly: **S** (≤1d), **M** (2–4d), **L** (1–2wk).

### A. Real-data wiring (replace demo seeds)

- [ ] **M** — Watch page reads from `/api/markets` instead of `predictionStore.initializeDemoData()`. Add SWR/React Query hook. Keep zustand for optimistic local bets.
- [ ] **S** — `/api/cameras` consume Prisma `Camera` model (currently reads `db.json`). Migrate cam rows from `db.json` → DB seed.
- [ ] **M** — Cast section consumes `/api/contestants` (currently `CAST` array literal). Wire odds from `MarketOption` for elimination market.
- [ ] **M** — Leaderboard endpoint + dock consumer (`/api/leaderboard?period=week`). Currently `LEADERBOARD` array literal.
- [ ] **S** — Schedule endpoint (`/api/schedule?seasonId=…`) + dock consumer.
- [ ] **S** — Hot strip + ticker driven by an event log (last 5 high-signal events).

### B. Real-time layer

- [ ] **L** — Choose runtime: keep `server.js` socket.io and switch dev to `npm run dev-server`, OR swap to managed (Pusher / Ably / Supabase Realtime). Document the call.
- [ ] **M** — Chat: persist to `ChatMessage`, broadcast on send, subscribe on watch + mobile. Slow-mode flag wired (UI already has placeholder).
- [ ] **M** — Live odds: broadcast on bet placement so % bars + odds shift in front of all viewers.
- [ ] **S** — Reactions: emit + animate on receive (FloatingReactions already exists locally).
- [ ] **S** — Watcher count per cam: throttled `presence` channel; feed heatmap heat values + tile badges.

### C. Stream control (Livepeer)

- [ ] **M** — Lifecycle automation: schedule-driven start/stop. Idle detection (no segments for N seconds → mark cam IDLE).
- [ ] **S** — Replace hard-coded `db.json` playback IDs with Livepeer-managed stream registry per Camera.
- [ ] **S** — Hook real `isActive` status to `isIdle` so toggle isn't the only signal (idle stays inferred when all cams off, even in demo).

### D. Wallet & monetisation

- [ ] **S** — Top-up modal in watch page (currently SIGN-IN / CASH-OUT only). Fire `/api/payments/initialize`.
- [ ] **M** — Withdrawal UI + bank-picker (`/api/payments/banks` exists; no consumer in `/watch`).
- [ ] **M** — Tier system: clout-earning rules (watch time, chat, daily login, referrals) exist in schema but no accrual job. Build cron + `/api/wallet/claim-daily` already exists for daily.
- [ ] **S** — Stake-bar bet placement currently writes to local `predictionStore` only. Persist via `/api/markets/{id}/predictions`.

### E. Voting & eviction

- [ ] **M** — `VotingWindow` + `Vote` models exist; build `/api/voting/active`, `/api/voting/cast`. Eviction-night card needs SAVE / EVICT buttons hooked.
- [ ] **M** — Eviction settlement: when window closes, settle market(s), credit winners, mark contestant `EVICTED`, audit log.

### F. Auth / onboarding

- [ ] **S** — Apply form (`/apply`) submission — verify destination (DB? email?). If DB, add `Contestant.applicationStatus` field or new `Application` model.
- [ ] **S** — First-run flow: post-Privy `/api/auth/verify` already creates User; ensure default `cloutBalance: 500` triggers a "you got 500 clout" toast on first sign-in.
- [ ] **S** — KYC for withdrawals (BVN / NIN). Paystack requires it for transfers.

### G. Notifications

- [ ] **M** — `NOTIFY ME` buttons (eviction night, market open, cast reveal) need email + (optional) push backend. Use Resend or Postmark.
- [ ] **S** — Calendar integration for `ADD TO CALENDAR` (.ics download).

### H. Heatmap on mobile

- [ ] **M** — Compact `<HouseHeatMap>` variant in mobile drawer (current drawer is a list). Or full-screen modal accessible from header.

### I. Admin / production console

- [ ] **L** — Operator console for: opening markets, scheduling slots, settling votes, managing cast, switching streams. None of this exists yet; today everything is hard-coded.
- [ ] **S** — Demo toggle should be **gated to admin/preview only** before launch (currently exposed to all viewers).

### J. Operational

- [ ] **S** — Branch off `main` for the in-flight watch overhaul (changes still uncommitted) and PR against `main`.
- [ ] **S** — Bump `caniuse-lite` + `baseline-browser-mapping` (dev warnings only).
- [ ] **S** — `/api/socket` is a placeholder route — delete or implement once real-time decision is made.
- [ ] **S** — Drop `db.json` as a runtime data source once cameras are migrated to DB.
- [ ] **M** — Lighthouse pass on `/watch` desktop + mobile. Stage video bundle is heavy; lazy-load multicam.
- [ ] **S** — Sentry / error reporting wiring (no monitor today).

---

## 6. Known issues / quirks

1. **Two market sources** (`predictionStore` zustand + `/api/markets` Prisma) that don't sync. A bet placed in UI never reaches DB.
2. **`db.json` vs `Camera` Prisma model** — schema exists, API still reads JSON file. Easy migration.
3. **`server.js` socket.io is dead in dev** — `npm run dev` uses turbopack which bypasses the custom server. Either switch dev script or pick a managed real-time provider.
4. **Demo toggle is public** — any visitor can toggle to live and see "show goes live shortly" messaging. Pre-launch this is fine; post-launch gate it to admin.
5. **Solana SDK installed but unused** — code-bloat. Either start using it for an on-chain rail or remove deps until needed.
6. **Hard-coded copy** — Day 47, ₦42,180, 18,420 watching, etc. are seed numbers in JSX. All need data binding before launch.
7. **Profile menu and CASH OUT button on header** — the latter does not open a modal; needs withdrawal UI wired.
8. **`/api/auth/verify` runs on every render of authenticated user** — fine for now, but consider caching/throttle.

---

## 7. How to run locally

```bash
cp .env.example .env.local
# Fill: DATABASE_URL, NEXT_PUBLIC_PRIVY_APP_ID, PRIVY_APP_SECRET,
#       LIVEPEER_API_KEY (optional), PAYSTACK_*, REDIS_URL (optional)

npm install
npx prisma generate
npx prisma db push        # or: npx prisma migrate dev
npm run db:seed           # seeds users, cameras, contestants, markets

npm run dev               # http://localhost:3000  (Turbopack, no socket.io)
# or
npm run dev-server        # http://localhost:3000  (custom server.js, socket.io live)
```

Smoke check: visit `/watch`, toggle the bottom-left **Demo / Live** pill, confirm idle replacements render and that demo restores the populated experience.

---

## 8. File-level cheatsheet for next engineer

| Need to change… | Edit… |
|---|---|
| Stage / cam controls / heatmap / dock | `src/app/watch/page.tsx` |
| Mobile equivalent | `src/components/MobileLayout.tsx` |
| Demo data seeds (cast, schedule, leaderboard, hot strip, ticker) | top of `src/app/watch/page.tsx` |
| Demo markets | `src/stores/predictionStore.ts` → `getDemoMarkets()` |
| Idle vs live source of truth | `const isIdle = dataMode === 'real'` in `WatchPage` |
| Theme / colours / paper / typography | `src/app/globals.css` (sf-* classes) + `src/lib/daylight.ts` |
| Cameras returned to UI | `src/app/api/cameras/route.ts` (currently `db.json`) |
| Prediction market REST | `src/app/api/markets/route.ts` (Prisma; not consumed yet) |
| Privy → User sync | `src/app/api/auth/verify/route.ts` |
| Real-time socket | `server.js` (dormant) + `src/app/api/socket/route.ts` (stub) |

---

## 9. Decisions still owed

1. **Real-time provider:** stick with self-hosted socket.io via `server.js`, or migrate to Pusher/Ably/Supabase Realtime?
2. **Stakes ↔ on-chain:** is stakes a fiat-only ledger via Paystack, or do we mint an SPL token? Solana deps suggest the latter was planned.
3. **Demo toggle visibility:** keep public for marketing-mode preview, or admin-only at launch?
4. **Schedule vs live drift:** when a slot says 20:00 and cams are dark at 20:05, do we surface "delayed" or just stay idle? Affects copy.
5. **Cast application destination:** DB row, email to ops, or both?

---

## 10. Quick context for a new contributor

The watch page is the product. Everything else (homepage, apply, login, payment) supports it. The page is intentionally one large file (~2.5k lines) so the entire layout is co-located; resist the urge to break it up until the data layer is wired — splitting prematurely will fight the tight render coupling between dock, stage, heatmap, and rail.

The heatmap data (`HOUSE_ROOMS`, `CAST_POSITIONS`) is hard-coded by design — the 10 rooms and 8 cast slots are baked into the show format, not a dynamic catalogue. Cast names + watcher counts should bind to live data; room geometry should not.

The DemoToggle is the most important UX primitive on the page right now. Every section reads `isIdle` and decides demo vs notice, so wiring real data is mostly: replace local seed → API hook → keep idle branch as fallback for empty/offline states.

— end of handoff —
