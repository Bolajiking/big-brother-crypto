# Copy Review — `/`, `/watch`, `/apply`

**Status:** Draft. Not committed. For Bolaji's review and markup before any code change.
**Source of rules:** `MESSAGING.md` (§ refs throughout this doc).
**Date:** 2026-05-06

---

## How to read this doc

For every surface I show:

1. **Where it lives** — file + line where the copy currently sits.
2. **Current copy** — verbatim, exactly as it ships today.
3. **Proposed copy** — new draft, plus the MESSAGING.md rule it follows.
4. **Why** — one-sentence rationale.

If a current line is fine, it gets *KEEP* with no change. If it needs a tweak, *EDIT*. If it should be replaced wholesale, *REPLACE*. If new copy is needed where there isn't any today, *ADD*.

Mark anything you want changed. Once you sign off, I implement in priority order (§4 of this doc).

---

# 1. Homepage (`/`)

The homepage is the first surface a viewer hits. **Voice base = Lagos-truth (A), flavour = magazine-tech (B) for the credibility line.** No crypto jargon anywhere on this page. BBNaija implied, never named.

## 1.1 Browser / SEO title + meta

**Where:** `src/app/layout.tsx:14–37`.
**Current:**
- `<title>`: *Star Factor - Africa's First Interactive Reality TV*
- description / og:title / og:description / twitter:title / twitter:description: *Africa's first Interactive Reality TV platform. Watch, Predict, Earn*

**Proposed (EDIT — current does not match the spine):**
- `<title>`: *Star Factor · Watch. Predict. Earn.*
- og:title + twitter:title: *Star Factor · Watch. Predict. Earn.*
- description + og:description + twitter:description: *Live reality TV with skin in the game. Watch the house. Predict the drama. Earn from your takes. Lagos · Q4 2026.*

**Why:** the current SEO is generic-marketing ("Africa's First Interactive Reality TV"). The proposed copy uses the locked product spine (§2) and the homepage sub (§1.5) — so SERP, social card, and homepage hero all reinforce the same message.

## 1.2 Top nav (header)

**Where:** `src/app/page.tsx` ~L192–217.
**Current items:** logotype + nav links + `SEE PREVIEW` + `JOIN WAITLIST`.
**Proposed:**
- *KEEP* logotype (lowercase italic *starfactor.* — logotype only per §2).
- Nav links: *KEEP* (cleanup pass elsewhere).
- Right CTAs: *EDIT* — change `SEE PREVIEW` → **`PREVIEW THE SHOW`**, keep `JOIN WAITLIST`.
**Why:** "preview the show" is voice A; "see preview" reads engineering-y.

## 1.3 Hero — eyebrow

**Where:** `page.tsx:295`
**Current:** `SEASON 01 · ONE HOUSE · MULTI-CAM · CASTING SOON`
**Proposed:** `REALITY TV · LAGOS · SEASON 1 · Q4 2026`
**Rule:** §5.1 + decision-locked Q4 2026 anchor. "Casting soon" reads vague; the show is the noun.

## 1.4 Hero — H1

**Where:** `page.tsx:301–309`
**Current:**
> *One house. Every room.*
> *Always-on cameras.*
> *Twenty-four seven.*

**Proposed (the founder-voice spine line, approved earlier):**
> *You watched all night.*
> *You ran the campaigns.*
> *You built the stars.*
> *Now you get a cut.*

**Rule:** §7 load-bearing sentence #1. Voice A. The current H1 describes the format; the proposed H1 describes the deal. The deal is what gets people to convert.

## 1.5 Hero — sub-paragraph

**Where:** `page.tsx:312–319`
**Current:**
> *Africa's first reality show that pays the audience. Sixteen housemates, multi-camera coverage, 24/7 — watch from any angle, predict what happens next, and cash out your wins straight to your wallet. No SMS taxes. Transparent markets. Real receipts.*

**Proposed:**
> *Live reality TV with skin in the game. Watch the house. Predict the drama. Earn from your takes. Sixteen housemates, every room, six weeks. Lagos. Q4 2026.*

**Rule:** §3 voice ladder — keeps Voice B credibility line in front (the one nod to investors), then drops to specifics in Voice A. Removes "wallet" (banned on viewer pages, §6). Removes "SMS taxes" (the BBN drop change, plus per-decisions we imply not name). Removes "transparent markets" jargon — redundant given product spine.

## 1.6 Hero — CTAs

**Where:** `page.tsx:323–334`
**Current:** `JOIN THE WAITLIST →` · `APPLY TO BE CAST` · `SEE THE PREVIEW →`
**Proposed (pre-launch — current state, until Q4 2026):**
- Primary: `JOIN THE WAITLIST →` — *KEEP*
- Secondary: `APPLY TO BE CAST` — *KEEP*
- Tertiary: `PREVIEW THE SHOW →` — *EDIT* from "SEE THE PREVIEW"

**Post-launch swap (after Season 1 goes live):**
- Primary: `START WATCHING` (or `ENTER THE HOUSE` during prime time) — replaces waitlist
- Secondary: `APPLY TO BE CAST` — keep year-round (always recruiting)
- Tertiary: removed (the page IS the preview when the show is live)

**Why:** MESSAGING.md §5.1 names *START WATCHING* / *ENTER THE HOUSE* as the primary, but that's the post-launch state. Pre-launch, the most valuable action is capturing intent — *JOIN THE WAITLIST* — because there's nothing to watch yet. Recording this as an explicit launch-state-aware rule (also added to MESSAGING.md §5.1).

## 1.7 Hero — stat strip (4 numbers)

**Where:** `page.tsx:257–262, 345–351`
**Current:**
| | |
|---|---|
| 16 | Housemates Season 01 |
| 24/7 | Multi-cam streaming |
| 42 | Days · 6 week season |
| Q4 | Season 01 launch window |

**Proposed:**
| | |
|---|---|
| 16 | Housemates · Season 1 |
| 24/7 | Multi-cam · every room |
| 42 | Days · 6 weeks |
| Q4 | 2026 · Lagos |

**Why:** keeps the same four numbers but tightens labels into Voice A rhythm. Doesn't commit to a specific camera count (production still flexible). Last cell now reads as the launch tag, not jargon.

## 1.8 Ticker / announcement strip

**Where:** `page.tsx:359–366`
**Current items:**
- *★ Season 01 waitlist now open*
- *🎬 Casting applications open in 3 weeks*
- *💰 First 10,000 signups get a ₦500 starter pot at launch*
- *📺 Watch the platform preview — see how the markets work*
- *🏠 Multi-camera coverage across every key room — no edits, no cuts*
- *⚡ Fast payouts — wallet to wallet*

**Proposed:**
- *★ Season 1 waitlist · open now*
- *🎬 Casting open · Q4 2026 launch · Lagos*
- *💰 First 10,000 sign-ups walk in with ₦500 already in the balance*
- *📺 Preview the show — every camera, every market*
- *🏠 Multi-camera. Every key room. No edits, no cuts.*
- *⚡ Cash out in seconds*

**Why:** kills "wallet to wallet" and "platform" (jargon), softens "in 3 weeks" to Q4 2026 (decisions-locked, §11), changes "starter pot at launch" to "balance" (§6 ban on "wallet").

## 1.9 RECEIPTS section — eyebrow + H2

**Where:** `page.tsx:412–422`
**Current eyebrow:** `● THE RECEIPTS`
**Current H2:**
> *You voted. You watched. You posted.*
> *Then they cashed your check.*

**Proposed eyebrow:** *KEEP* (`● THE RECEIPTS`).
**Proposed H2:** *KEEP*. This is already Voice A and lands.
**Why:** strong as-is and consistent with §7 sentence 1. No change.

## 1.10 RECEIPTS section — sub-paragraph

**Where:** `page.tsx:423–430`
**Current:**
> *Reality TV in Africa is a one-way street. Audiences make the show go, then watch a network and a few telcos walk away with the money. We pulled the receipts. The gap between two of Nigeria's biggest cultural behaviors is structural, not accidental — and it's exactly where Star Factor sits.*

**Proposed:**
> *Reality TV in Africa is a one-way street. Audiences make the show go. The networks and the telcos walk away with the money. We pulled the receipts. The gap between two of Nigeria's biggest behaviours is structural — and it's exactly where Star Factor sits.*

**Why:** trims one redundant clause. Removes "cultural" (filler). Tighter rhythm.

## 1.11 RECEIPTS — stat cards

**Where:** `page.tsx:396–401`
**Current:**
- *1.53B — Votes cast last BBNaija season — Each one paid to vote. Zero paid back.*
- *₦115B — In SMS revenue captured by telcos — ~$72M from fans like you. Pure extraction.*
- *60M — Nigerians already predicting outcomes — On Bet9ja, Sportybet, BetKing. Daily.*
- *$3.6B — Spent on those predictions every year — Same demographic. Same phones. Different rails.*

**Proposed:**
- *1.53B — Votes cast last season of the country's biggest reality show — Each one paid to vote. Zero paid back.*
- *₦115B — Captured by networks and telcos — ~$72M from fans like you.*
- *60M — Nigerians already predicting outcomes — On Bet9ja, Sportybet, BetKing. Daily.*
- *$3.6B — Spent on those predictions every year — Same demographic. Same phones. Different rails.*

**Why:** **BBNaija → "the country's biggest reality show"** per §6 BBNaija rule (imply on viewer surfaces). Removes "Pure extraction." (preachy, edgier tone than the rest of the page). Drops "In SMS revenue" since BBN has moved off SMS — keeps the structural truth (networks + telcos still capture).

## 1.12 RECEIPTS — wedge callout

**Where:** `page.tsx:473–477`
**Current:**
> *50 million reality TV obsessives. 60 million active predictors. Same phones, same demographic, completely separate apps. We built the bridge.*

**Proposed:** *KEEP*. Already on-voice.

## 1.13 CHANNELS section — eyebrow + H2

**Where:** `page.tsx:509–519`
**Current eyebrow:** `ONE HOUSE · MULTI-CAMERA · SCALING UP EVERY SEASON`
**Current H2:**
> *Pick your angle. Switch anytime.*

**Proposed eyebrow:** `MULTI-CAMERA · ONE HOUSE · 24/7`
**Proposed H2:** *KEEP*.
**Why:** "scaling up every season" reads roadmap-ish, not viewer-relevant. The eyebrow earns its space by stating the show shape.

## 1.14 CHANNELS — sub-paragraph

**Where:** `page.tsx:521–524`
**Current:**
> *Multiple HD feeds rolling in parallel from every key room. Living room to diary room, kitchen to garden, garden to front door — switch like you're flipping seats in the same room. No edit. No cut. No spin.*

**Proposed:**
> *Multiple HD feeds rolling in parallel from every key room — all live. Living room to diary, kitchen to garden, front door to pool deck — switch like you're flipping seats in the same room. No edit. No cut. No spin.*

**Why:** opens with the number (concrete), cuts the soft "rolling in parallel," extends the rooms to feel more like a real house.

## 1.15 HOWITWORKS — eyebrow + H2

**Where:** `page.tsx:687–690`
**Current eyebrow:** `● HOW IT WORKS`
**Current H2:** *Watch. **Predict.** Earn.*

**Proposed:** *KEEP both* — exactly the §2 spine. Don't touch.

## 1.16 HOWITWORKS — sub-paragraph

**Where:** `page.tsx:692–694`
**Current:**
> *We opened every camera. We opened every market. Then we handed over the remote — and the wallet. Three taps to the wins.*

**Proposed:**
> *Every camera, open. Every market, open. Then we handed over the remote — and the balance. Three taps to a win.*

**Why:** §6 — replace "wallet" with "balance" on viewer surfaces. Tighter rhythm.

## 1.16a HOWITWORKS — three step cards (currently missing wallet cleanup)

**Where:** `page.tsx:663–672` (the `steps` const inside `HowItWorks`).

**Current:**

| Step | Title | Body |
|---|---|---|
| 01 WATCH | *Pick a room. Pick your angle.* | *Multi-cam coverage across every key room, streaming 24/7. Hop from the Living Room to the Pool Deck to the Diary Room — anywhere the cast goes, a camera is already there.* |
| 02 PREDICT | *Markets open every minute.* | *Will a kiss happen tonight? Who wins the task? Who gets evicted? Stake from ₦100. Markets settle the moment it happens.* |
| 03 EARN | *Cash out, **wallet to wallet**.* | *Win, hold, withdraw. Your prediction history, **your wallet**, your money — yours.* |

**Proposed:**

| Step | Title | Body |
|---|---|---|
| 01 WATCH | *Pick a room. Pick your angle.* — *KEEP* | *Multi-cam coverage across every key room, streaming 24/7. Hop from the Living Room to the Pool Deck to the Diary Room — anywhere the cast goes, a camera is already there.* — *KEEP* |
| 02 PREDICT | *Markets open every minute.* — *KEEP* | *Will a kiss happen tonight? Who wins the task? Who gets evicted? Stake from ₦100. Markets settle the moment it happens.* — *KEEP* |
| 03 EARN | *Cash out, end-to-end.* — *EDIT* | *Win, hold, withdraw. Your predictions, your balance, your money — yours.* — *EDIT* |

**Why:** §6 — *"wallet to wallet"* and *"your wallet"* are banned on viewer surfaces (the wallet is invisible infrastructure, the user sees only their balance). *"End-to-end"* preserves the rhythm of *"cash out, wallet to wallet"* without the banned word.

---

## 1.17 MARKETS PREVIEW — eyebrow + H2

**Where:** `page.tsx:804–811`
**Current eyebrow:** `● MARKET PREVIEW · SAMPLES`
**Current H2:** *Every moment is a market.*

**Proposed:** *KEEP*. Six words, perfectly Voice A.

## 1.18 MARKETS PREVIEW — sub-paragraph

**Where:** `page.tsx:813–815`
**Current:**
> *Sample markets to show the format. From day one, every pool is real, every odd is on-chain, and every settlement clears the second it's called.*

**Proposed:**
> *Sample markets to show the format. From day one, every pool is real and every settlement clears the second it's called — settled in front of every camera, in front of every viewer.*

**Why:** §6 — bans "on-chain" on viewer surfaces. Replaces with the *settled in front of every camera* formulation (the moat language from §7 sentence 3, softened for viewer voice). Reads native, carries the same credibility weight.

## 1.19 AUDIENCE BLOCK — eyebrow + H2

**Where:** `page.tsx:953–960`
**Current eyebrow:** `● BUILT FOR EVERY SEAT IN THE ROOM`
**Current H2:**
> *The audience earns. The cast earns.*
> *The brands get a front-row seat.*

**Proposed:** *KEEP* both. Already on-voice and covers all three audiences in three short clauses.

## 1.20 AUDIENCE BLOCK — sub-paragraph

**Where:** `page.tsx:961–963`
**Current:**
> *Reality TV has always been a one-sided economy. We rebuilt it so everyone with skin in the game has skin in the upside.*

**Proposed:** *KEEP*. This is the page's most explicit nod to the staked-entertainment thesis without naming it. Don't change.

## 1.21 CASTING — eyebrow + H2

**Where:** `page.tsx:1056–1059`
**Current eyebrow:** `● CASTING SOON · 16 HOUSEMATES`
**Current H2:** *Sixteen housemates. **One winner.***

**Proposed eyebrow:** `● CASTING OPEN · 16 HOUSEMATES · LAGOS`
**Proposed H2:** *KEEP*.
**Why:** "Casting soon" is hedge — if applications are open, say so.

## 1.22 CASTING — sub-paragraph

**Where:** `page.tsx:1061–1063`
**Current:**
> *Sixteen people. Multi-cam coverage. Forty-two days. One $30,000 grand prize, plus weekly challenge cash and direct fan tips while you're still in the house. Apply yourself, or nominate the friend you know is built for it.*

**Proposed:**
> *Sixteen people. One house. Forty-two days. $30,000 grand prize, plus weekly challenge cash and direct fan tips while you're still in the house. Apply yourself, or nominate the friend you know is built for it.*

**Why:** trims "multi-cam coverage" (covered elsewhere on page). Reads tighter.

## 1.23 CASTING — apply callout (`★ APPLICATIONS OPEN SOON`)

**Where:** `page.tsx:1117–1128`
**Current:**
> *★ APPLICATIONS OPEN SOON*
> *Think you've got it? Get on the list.*
> *18+, residents of any African country. Drop your handle and we'll send the application the day it opens.*
> CTAs: `APPLY TO BE CAST` · `NOMINATE A FRIEND`

**Proposed:**
> *★ APPLICATIONS OPEN · LAGOS · Q4 2026*
> *The old shows pay you in fame. Star Factor pays you while.*
> *18+, Lagos-based or relocatable for six weeks. Apply now — shortlist is rolling.*
> CTAs: `APPLY TO BE CAST` · `NOMINATE A FRIEND` *(KEEP)*

**Why:** §6 BBNaija rule — **homepage stays implied**, not named. "The old shows" carries the same comparative bite without naming names on a viewer-first surface. The full-named version (*"BBNaija makes you famous after. Star Factor pays you while."*) lives on `/apply` (§3.3), where it's audience-correct. Locks geography (Lagos), softens "any African country" (which contradicts the residential six-week format).

## 1.24 MECHANICS — eyebrow + H2 + sub

**Where:** `page.tsx:1154–1161`
**Current eyebrow:** `● WHAT'S ON THE LINE`
**Current H2:** *Real money, real stakes.*
**Current sub:**
> *Cash payouts settled in seconds. Wallet to wallet. Transparent market rules, visible receipts, and clean settlement. Stablecoin rails under the hood, Naira on the surface. Buy in like you're buying airtime; cash out to your bank in seconds.*

**Proposed eyebrow:** *KEEP*.
**Proposed H2:** *KEEP*.
**Proposed sub:**
> *Cash payouts in seconds. Pay in Naira like you're buying airtime. Cash out to your bank, or hold it for the next market. Settled in front of every camera, in front of every viewer.*

**Why:** §6 — strips "stablecoin," "wallet to wallet," "rails under the hood" (all banned on viewer pages). Keeps the airtime mental model (per Monetization Engine principle 1) and pulls the *settled in front of every camera* moat sentence into viewer copy.

## 1.25 MECHANICS — what-you-can-predict box

**Where:** `page.tsx:1138–1141`
**Current items:** OFFICIAL / LIVE / TASK / USER, four sample markets.
**Proposed:** *KEEP*. The four-row sample is already strong. No change.

## 1.26 ROADMAP — eyebrow + H2

**Where:** `page.tsx:1246–1253`
**Current eyebrow:** `● THE ROAD TO SEASON 01`
**Current H2:** *Four phases. **One season.***

**Proposed:** *KEEP*. Both clean.

## 1.27 FINAL CTA — eyebrow + H2

**Where:** `page.tsx:1348–1358`
**Current eyebrow:** `● SEASON 01 · WAITLIST OPEN`
**Current H2:** *Don't watch. **Play.***

**Proposed:** *KEEP both*. The H2 is among the strongest single lines on the site. Don't touch.

## 1.28 FINAL CTA — sub-paragraph

**Where:** `page.tsx:1361–1366`
**Current:**
> *The cast hears the chat. The markets clear in real time. The evictions are decided by you. Get on the list — first 10,000 walk in with a ₦500 starter pot already in the wallet.*

**Proposed:**
> *The cast hears the chat. The markets clear in real time. The evictions are decided by you. Get on the list — the first 10,000 walk in with ₦500 already in the balance.*

**Why:** §6 — replace "wallet" with "balance." Add "the" before 10,000 for rhythm.

---

# 2. Watch page (`/watch`)

The watch page already had a major copy/CTA pass in the last engagement. The framework now demands a few additional refinements for full alignment.

**Voice base = Lagos-truth (A), flavour = game-show (C) on time-bound CTAs only.** Crypto jargon **stripped completely**. BBNaija never named.

## 2.1 Stage idle overlay — eyebrow + H2 + sub

**Where:** `src/app/watch/page.tsx:1217–1247` (the offline state inside `<PaletteFill>`)
**Current eyebrow:** `● OFFLINE · STREAM RESUMES SOON`
**Current H2:** *The house is quiet. Be the first one watching.*
**Current sub:** *Cameras stream the moment cast wakes. Open a market, drop a chat, or flip to demo to feel the full experience.*

**Proposed eyebrow:** `● OFFLINE · STREAM RESUMES SOON` *(KEEP)*
**Proposed H2:** *The house wakes at lights-on. Stay in the room.*
**Proposed sub:** *Cameras. Cast. Markets. Everything fires when the show fires.*

**Why:** §5.2 of MESSAGING.md. The current copy is more conversational; the proposed copy is tighter, more declarative, and matches the "lights-on / lights-off" show-vocabulary in the glossary (§6).

## 2.2 Stage idle CTAs

**Where:** `page.tsx:1238–1245`
**Current:** `SEE IT IN DEMO` (primary, coral) · `OPEN A MARKET` (secondary, paper)
**Proposed:** `NOTIFY ME` (primary, coral) · `PREVIEW THE EXPERIENCE` (secondary, paper)

**Why:** §5.2. The most useful action on a real-idle page is *let me know when it starts* — that's the new primary. The demo toggle below already serves "preview the experience"; this CTA is its written cousin.

## 2.3 Heatmap idle copy

**Where:** the heatmap section below the cam rail. Currently the section H2 is *"Tap a room. Jump the cam."* and the sub-text says *"Heat = live attention."*

**Proposed (idle):**
- H2: *KEEP* (*"Tap a room. Jump the cam."*)
- Sub-text: *replace with* — *"The house is dark. Heat shows where the room is hottest. Right now: nowhere."*

**Why:** §5.2 / §8.5. When there's no live data, the heatmap should explain *why* it's dark, not just look broken.

## 2.4 Show-meta H1 (idle)

**Where:** `page.tsx:1389–1393`
**Current:** *House goes live shortly. Stay in the room.*
**Proposed:** *House wakes at lights-on. Stay in the room.*

**Why:** §6 glossary — "lights-on" is the show-vocabulary anchor. "Goes live shortly" is generic.

## 2.5 Show-meta H1 (active / non-idle)

**Where:** `page.tsx:1391` (the alternate branch)
**Current:** *Pick a room. Read the crowd. Back the moment.*
**Proposed:** *KEEP*. Three Voice-A imperatives, perfect.

## 2.6 Reactions row — idle copy

**Where:** the reactions block when `showStageWidgets && isIdle`.
**Current:** *Reactions unlock when cameras go live. NOTIFY ME*
**Proposed:** *KEEP*. Already aligned.

## 2.7 Cast section — idle copy

**Where:** the cast section idle notice.
**Current:**
> *Cast revealed at lights-on. Names, odds and BACK buttons drop the moment cameras flip live.*
> CTAs: `NOTIFY ME` · `APPLY TO BE CAST`

**Proposed eyebrow / heading:** *KEEP* (*"Cast revealed at lights-on"*)
**Proposed sub:** *Names. Odds. Stories. The lot. Everything drops the moment cameras flip live.*
**Proposed CTAs:** *KEEP*.

**Why:** the "BACK buttons" reference reveals product mechanics in a place that should feel anticipatory. Three short clauses + a punchy summary land harder.

## 2.8 Schedule — idle copy

**Where:** schedule idle notice.
**Current:**
> *NEXT UP · LIGHTS-ON · Tonight's slate posts at 19:00 WAT. Tasks · diary rotations · eviction window will fill in here.*
> CTA: `ADD TO CALENDAR`

**Proposed:** *KEEP all*. Already on-voice and uses lights-on vocabulary correctly.

## 2.9 Predict grid (full-width) — idle notice

**Where:** the dashed predict notice below the heatmap, when `effectiveMarkets.length === 0 && isIdle`.
**Current:**
> *PREDICT & EARN — Markets open with the show. Live cams trigger live odds. Be first — open the first market yourself.*
> CTAs: `OPEN FIRST MARKET` · `NOTIFY ME`

**Proposed eyebrow:** *KEEP*.
**Proposed H3:** *KEEP* (*"Markets open with the show"*).
**Proposed sub:** *Cameras flip on, odds flip on. You can be the first market on the books.*
**Proposed CTAs:** *KEEP*.

**Why:** sharper rhythm; "Cameras flip on, odds flip on" carries Voice A cadence.

## 2.10 Dock predict tab — empty state

**Where:** dock predict empty card.
**Current:**
> *🎯 Markets open with the show / No active markets — Live cams trigger live odds. First market drops at lights-on. — OPEN FIRST MARKET*
**Proposed:** *KEEP*. Already aligned.

## 2.11 Dock chat tab — header + idle banner

**Where:** dock chat.
**Current header (idle):** *Chat warming up · SHOW SOON*
**Current empty card:** *Be the first take · Drop a hot take. Lock the floor before lights-on.*

**Proposed:** *KEEP all*. Tight, on-voice.

## 2.12 Dock leaderboard — idle copy

**Where:** dock leader idle notice.
**Current:**
> *🏆 Leaderboard resets weekly · Win the first market tonight, claim the first slot. — OPEN FIRST MARKET*
**Proposed:** *KEEP*. Already aligned.

## 2.13 Eviction-night card

**Where:** the bottom eviction-night surface.
**Current:**
> *EVICTION NIGHT · SUN 19:00 / Stake before the gavel drops. / [tags: Fan vote, Cast risk, Pool movement, Cash-out window] / BACK A CAST · SAVE A FAV*

**Proposed:** *KEEP*. The "stake before the gavel drops" line is one of the strongest in the product.

## 2.14 Wallet-loop card

**Where:** the wallet-loop surface beside eviction night.
**Current:**
> *YOUR WALLET / Stake. Win. Cash out. / Balance, bet bar, leaderboard — never out of reach. / CASH OUT · + TOP UP*

**Proposed:**
> *YOUR BALANCE*
> *Stake. Win. Cash out.*
> *Balance, bet bar, leaderboard — never out of reach.*
> CTAs: `CASH OUT` · `+ TOP UP` *(KEEP)*

**Why:** §6 ban — "wallet" should not be on a viewer surface. Eyebrow becomes *YOUR BALANCE*. The *Stake. Win. Cash out.* line stays — it's load-bearing.

## 2.15 Full-product surface — top headline + sub

**Where:** the magazine-paper "WHAT YOU GET" surface above the eviction grid.
**Current:**
> *WHAT YOU GET / The whole house, in play. / Watch live · predict · vote · cash out — all without leaving the stream. / START WATCHING · SEE LIVE/SEE DEMO*

**Proposed:** *KEEP*. Already aligned.

## 2.16 Stage CTAs (active / non-idle) — bottom-row icon group

**Where:** `page.tsx:1311–1348`. The pause / mute / pin / clip / share / fullscreen buttons + `WATCH ALL ROOMS` + `FOCUS`.
**Current:** `WATCH ALL ROOMS · {n}` and `FOCUS`.
**Proposed:** *KEEP both*. The icon CTAs already have hover tooltips per the previous pass.

## 2.17 Demo toggle pill — hover label

**Where:** the floating bottom-left toggle (`DemoToggle`).
**Current `title`:** *"Showing demo data — switch to live"* / *"Showing live data — switch to demo"*
**Proposed:**
- Demo mode hover: *"You're previewing how Star Factor plays during a live show. Tap for live."*
- Real mode hover: *"This is the live state. Tap to preview the experience."*

**Why:** the current label uses "data" which sounds engineering-y. The proposed copy explains *what the toggle does* in viewer-language.

---

# 3. Apply page (`/apply`)

The apply page is the cast-recruitment surface. **Voice base = Lagos-truth (A) for the founder/contestant tone, flavour = game-show (C) on the urgency stamp + magazine-tech (B) for the "what you get" block.** **BBNaija is named here.** No crypto jargon.

## 3.1 Header — eyebrow

**Where:** `apply/page.tsx:271–273`
**Current:** `● SEASON 01 · CASTING APPLICATION`
**Proposed:** `● SEASON 1 · LAGOS · Q4 2026 · CASTING OPEN`
**Why:** §5.4 / §11. Anchors the date and place; uppercase "SEASON 1" instead of "01" matches the rest of MESSAGING (§3 spine + §11 dates).

## 3.2 Hero — eyebrow

**Where:** `apply/page.tsx:292–294`
**Current:** `● APPLY · 16 HOUSEMATE SLOTS`
**Proposed:** `● 16 HOUSEMATES · ONE WINNER · Q4 2026`
**Why:** "Apply · slots" is process language. "Housemates · winner · launch" is show language.

## 3.3 Hero — H1

**Where:** `apply/page.tsx:295–302`
**Current:**
> *Sixteen housemates.*
> ***One winner.** Yours?*

**Proposed (the §8.6 spine line, decisions-locked):**
> *BBNaija makes you famous after.*
> *Star Factor pays you while.*

**Why:** §6 BBNaija rule — **named** on cast-recruitment surfaces. This is the line that earns the apply form. The current "yours?" headline is fine but it's a generic talent-search cliché; the proposed headline is the value-prop in two lines.

## 3.4 Hero — sub-paragraph

**Where:** `apply/page.tsx:303–307`
**Current:**
> *Two minutes of your time. The basics, your socials, and a 90-second video telling us why we should pick you. That's it. We'll review every submission and reach out to the shortlist within 14 days of casting close.*

**Proposed:**
> *Six weeks. One house. Cameras on. Fans backing you. Tips during the show. Real money during — not just after. Two minutes to apply: the basics, your socials, and a 90-second video.*

**Why:** §5.4 / §8.6. Leads with the *deal* (what you get) before the *process* (how to apply). The current hero is process-only; the proposed hero is value-led with the process line at the end. *"Backing"* (not *"betting on"*) per §6 glossary — keeps gambling-coded language off public surfaces, even cast-recruitment.

## 3.5 ADD — "What you get" three-bullet block (currently missing)

**Where:** Insert between the hero sub and the form (around `apply/page.tsx:309–311`).
**Proposed (new):**

> **WHAT YOU GET**
> 1. *Weekly tips from fans, paid out as you earn them.*
> 2. *More ways to earn from fan support during the show.*
> 3. *Grand prize at the end — plus everything you earned getting there.*

**Why:** §8.6. The current apply page jumps straight from the hero into a form. That's process-driven. Inserting the value-prop block between hero and form raises conversion by reminding the talent *why* they're filling this in.

**Note on bullet 2 (softened from earlier draft):** the previous draft said *"A cut of every market opened on your name."* That's a hard economic promise that requires legal + product sign-off on the actual revenue split. Until that's locked, we say *"More ways to earn from fan support during the show"* — vague enough to be true, concrete enough to be appealing. Tighten this when the contestant economics are signed off; the line can become more specific (e.g. *"X% of every market opened on your name"*) once the number is real.

## 3.6 Section title — "The basics"

**Where:** `apply/page.tsx:325`
**Current:** *01 — The basics*
**Proposed:** *KEEP*. Already on-voice.

## 3.7 Section title — "Socials"

**Where:** `apply/page.tsx:389`
**Current:** *02 — Socials* (hint: *Optional · helps us see who you are*)
**Proposed eyebrow:** *KEEP*.
**Proposed hint:** *Optional · helps us see how you carry yourself online.*
**Why:** "see who you are" is generic; "how you carry yourself online" is the actual cast-evaluation criterion.

## 3.8 Section title — "The 90-second pitch"

**Where:** `apply/page.tsx:399`
**Current:** *03 — The 90-second pitch* (hint: *The most important part*)
**Proposed:** *KEEP both*. The hint is voice A and tells the truth.

## 3.9 The brief inside the video section

**Where:** `apply/page.tsx:405–410`
**Current:**
> *★ THE BRIEF*
> *Record a 90-second video — vertical, your phone, one take is fine. Tell us your name, your city, and the one reason we should put you in the house. Post it anywhere public (TikTok, IG Reels, YouTube, X, Drive) and drop the link below.*

**Proposed:**
> *★ THE BRIEF*
> *Vertical, your phone, one take. Your name. Your city. The one reason we should put you in the house. Post it anywhere public — TikTok, IG, YouTube, X, Drive — and drop the link below.*

**Why:** rhythm tightens. Casting briefs read better in fragments.

## 3.10 Consent line

**Where:** `apply/page.tsx:459–461`
**Current:**
> *I'm 18 or older, the info above is accurate, and I understand that submitting this application doesn't guarantee I'll be cast.*

**Proposed:** *KEEP*. Legal / regulatory hedge surface — voice B (§5).

## 3.11 Submit footer

**Where:** `apply/page.tsx:469–472`
**Current:**
> *We'll reach out to shortlisted applicants within 14 days of casting close.*

**Proposed:**
> *We'll reach out to shortlisted applicants on a rolling basis. Apply early.*

**Why:** §11 decisions-locked — never name an exact date. "Within 14 days of casting close" defines a hard deadline by inference. "Rolling basis" plus "apply early" creates urgency without committing to a date.

## 3.12 Submit button label

**Where:** `apply/page.tsx:479`
**Current:** *SEND APPLICATION*
**Proposed:** *SEND IT IN*

**Why:** Voice A. "Send application" is process language; "send it in" is contestant language.

## 3.13 Success-state — eyebrow + H1 + sub

**Where:** `apply/page.tsx:220–231`
**Current eyebrow:** `● APPLICATION RECEIVED`
**Current H1:**
> *You sent it.*
> *We'll be in touch.*
**Current sub:**
> *Thanks for putting yourself forward for Star Factor Season 01. We'll watch every video and reach out to shortlisted applicants within 14 days of casting close. Keep an eye on {email} and your WhatsApp.*

**Proposed eyebrow:** *KEEP*.
**Proposed H1:** *KEEP* — voice A, perfectly punchy.
**Proposed sub:**
> *Thanks for putting yourself forward for Star Factor Season 1. We'll watch every video and reach out to shortlisted applicants on a rolling basis. Keep an eye on {email} and your WhatsApp.*

**Why:** §11 — "Season 1" not "Season 01" matches MESSAGING.md spelling, and "rolling basis" replaces the dated "14 days of casting close."

---

# 4. Cross-cutting (header, footer, OG, meta)

## 4.1 Logotype usage rule

**Where:** every header.
**Rule (locked, §2):** lowercase italic *starfactor.* = **logotype only**. Body copy = **Star Factor** (Title Case). Today the apply page success-state body says *"Star Factor Season 01"* (correct). Body usage on the homepage and watch page does not currently vary — keep all in-body references as **Star Factor**.

## 4.2 SEO title + description

See §1.1. The current shipped meta (*"Africa's First Interactive Reality TV"*) does not match the spine and needs a full rewrite. OG image stays as-is.

## 4.3 Footer (across pages)

**Recommended additions** (small, magazine-tone footer at the bottom of `/`, `/apply`, `/watch`):
- *© 2026 Star Factor · Built by Chainfren*
- *Star Factor is a fan engagement platform. Predictions are tied to our own entertainment content.* *(this is the regulatory hedge from §6 — keep it on the public site footer, even on viewer pages, so it's always discoverable)*

---

# 5. What the implementation pass looks like (when you sign off)

In rough order, smallest-blast-radius first:

1. **`/watch` micro-tweaks** — §2.1 stage idle, §2.2 idle CTAs, §2.3 heatmap idle, §2.4 show-meta H1, §2.7 cast idle sub, §2.9 predict notice sub, §2.14 wallet card eyebrow → *YOUR BALANCE*, §2.17 demo-toggle hover labels.
2. **`/` homepage** — §1.3 eyebrow, §1.4 H1, §1.5 sub, §1.6 CTA tertiary label, §1.7 stat strip, §1.8 ticker, §1.10 receipts sub, §1.11 stat cards (BBN softening), §1.13 channels eyebrow, §1.14 channels sub, **§1.16a HowItWorks step 03 (wallet language fix)**, §1.16 howitworks sub, §1.18 markets-preview sub, §1.21 casting eyebrow, §1.22 casting sub, §1.23 casting apply callout (BBN **implied** — *"the old shows pay you in fame"*), §1.24 mechanics sub, §1.28 final-cta sub.
3. **`/apply`** — §3.1 header eyebrow, §3.2 hero eyebrow, §3.3 H1 (BBN **named** — only place on the public site), §3.4 hero sub (*"backing"* not *"betting"*), §3.5 add "what you get" block (bullet 2 soft until contestant economics signed off), §3.7 socials hint, §3.9 brief, §3.11 footer, §3.12 submit button, §3.13 success sub.
4. **Cross-cutting** — §4.1 logotype audit, §4.2 SEO meta in `layout.tsx`, §4.3 footer addition.

Total surface impact: ~38 small string edits + 1 new "What you get" block on the apply page. Zero structural changes. Zero new components. The voice ladder, glossary and BBNaija rule do all the heavy lifting; the code surface stays clean.

---

# 6. Open questions — resolved in v2

The original four open questions are now closed:

1. **§1.7 stat strip** — *RESOLVED.* Camera count removed (production still flexible). Final labels: *Housemates · Season 1*, *Multi-cam · every room*, *Days · 6 weeks*, *2026 · Lagos*.
2. **§1.23 casting apply callout** — *RESOLVED.* BBNaija stays **implied** on the homepage (per MESSAGING.md §6 rule). Final line: *"The old shows pay you in fame. Star Factor pays you while."* Named version lives only on `/apply` (§3.3).
3. **§2.2 idle stage primary CTA** — *PROCEEDING WITH NOTIFY ME.* Default to capturing intent before the show goes live; demo/preview is the secondary action via the floating toggle and the `PREVIEW THE EXPERIENCE` secondary button. Easy to swap post-launch.
4. **§3.5 "What you get" block on `/apply`** — *PROCEEDING WITH ADD.* Adding the three-bullet block. Bullet 2 held in soft language (*"More ways to earn from fan support during the show"*) until contestant economics + legal sign-off; tighten to a specific % when locked.

## Additional locked decisions (from review pass)

- **Camera count:** never specify. Use *"multi-camera"*, *"every key room"*, or no number at all. Current production count is in flux.
- **Hero CTA strategy:** launch-state-aware. Pre-launch (now): *JOIN THE WAITLIST* primary. Post-launch (Q4 2026): *START WATCHING* / *ENTER THE HOUSE*. Codified in MESSAGING.md §5.1.
- **Contestant economics promise:** soft language only until legally + product-signed off. Currently: *"More ways to earn from fan support during the show."* Tighten to specific revenue split once it's real.
- **"Bet/betting" language:** banned everywhere on public surfaces — including `/apply`. Replace with *"back / backing / opening markets on"*. Only investor / brief / deck surfaces may use *"prediction market"* / *"betting market"* in their precise economic sense.
- **SEO meta in `layout.tsx`:** full EDIT (current is *"Africa's First Interactive Reality TV"* — does not match the spine).
- **HowItWorks step 03 EARN card:** wallet language stripped. Title: *"Cash out, end-to-end."* Body: *"Win, hold, withdraw. Your predictions, your balance, your money — yours."*

This is the locked set. When you say go, I'll execute §5 implementation in order.

---

*— end of COPY-REVIEW.md draft v1 —*
