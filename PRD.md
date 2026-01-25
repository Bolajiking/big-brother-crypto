# Big Brother Crypto - PRD v1.0

# BIG BROTHER CRYPTO

Product Requirements Document & Implementation Guide

24/7 Interactive Reality Game Show Platform

Version 1.0 | January 2026

Target Market: Nigeria & Africa

Tech Stack: Next.js 15, TypeScript, Tailwind, Livepeer, Privy, Polymarket

Repository: github.com/Bolajiking/big-brother-crypto

Demo: big-brother-crypto.vercel.app

Reference: fishtank.live

---

# 1. Executive Summary

Big Brother Crypto is a 24/7 live-streamed interactive reality game show platform where contestants compete in elimination challenges for a Grand Prize. The platform differentiates itself through deep viewer interaction powered by crypto-based prediction markets, with all blockchain complexity abstracted for mainstream users.

## 1.1 Current State Analysis

The existing prototype includes:

- Multi-camera streaming: 8 Livepeer-powered cameras with HLS playback
- Real-time chat: Socket.io integration with emoji, SFX, and TTS UI
- Web3 authentication: Privy integration with Solana wallet support
- Basic UI: Fishtank.live-inspired dark theme, camera grid, stream modal
- Interactive widgets: Placeholder polls, leaderboard, system status

## 1.2 What Needs to Be Built

| Component | Description |
| --- | --- |
| Prediction Markets | Polymarket/Kalshi integration with abstracted crypto layer |
| Two-Currency System | Clout (free/earned) and Stakes (purchased) currencies |
| Voting System | Contestant nominations, public voting, eviction mechanics |
| Payment Integration | Paystack/Flutterwave for Nigerian payment rails |
| Database Layer | PostgreSQL + Prisma ORM (replace db.json) |
| Contestant Management | Profiles, stats, nominations, elimination tracking |
| Admin Dashboard | Show management, market creation, moderation tools |

---

# 2. Technical Architecture

## 2.1 Current Project Structure

The existing codebase follows Next.js 15 App Router conventions:

```
src/
app/
  page.tsx # Main viewing page
  login/page.tsx # Auth page
  api/ # API routes
components/
  LivepeerPlayer.tsx # HLS video player
  MultiCamGrid.tsx # Camera grid
  Chat.tsx # Real-time chat
  InteractiveWidgets.tsx # Polls, leaderboard
  StreamModal.tsx # Fullscreen view
lib/
  privy.tsx # Privy auth config
```

## 2.2 Target Architecture

Expanded structure to support full platform functionality:

```
src/
app/
  (auth)/login, signup, onboarding
  (main)/watch, predictions, vote, wallet, leaderboard
  admin/dashboard, markets, contestants, moderation
  api/auth, predictions, votes, payments, users, admin
components/
  ui/ # Shared UI components
  stream/ # Video, cameras, clips
  predictions/ # Market cards, betting UI
  voting/ # Vote interface, results
  wallet/ # Balance, transactions
  contestants/ # Profiles, stats
lib/
  db.ts, api.ts, polymarket.ts, paystack.ts
stores/ # Zustand state stores
hooks/ # Custom React hooks
types/ # TypeScript definitions
prisma/schema.prisma # Database schema
```

## 2.3 Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js 15, React 19 | App framework with SSR/SSG |
| Styling | Tailwind CSS 3.4 | Utility-first CSS framework |
| State | Zustand + React Query | Client state + server state |
| Database | PostgreSQL + Prisma | Relational DB with type-safe ORM |
| Cache | Redis (Upstash) | Session, rate limiting, pub/sub |
| Auth | Privy | Web3 + social login, embedded wallets |
| Streaming | Livepeer + HLS.js | Decentralized video infrastructure |
| Real-time | Socket.io | Chat, live updates, notifications |
| Predictions | Polymarket API | Prediction market infrastructure |
| Payments | Paystack | Nigerian payment rails (bank, cards) |
| Hosting | Vercel + Railway | Frontend + backend services |

---

# 3. Database Schema

Replace the current db.json with a PostgreSQL database using Prisma ORM.

## 3.1 Core Models

```prisma
// prisma/schema.prisma
model User {
  id String @id @default(cuid())
  privyId String @unique
  walletAddress String? @unique
  username String @unique
  email String?
  cloutBalance Int @default(500)
  stakesBalance Int @default(0)
  tier UserTier @default(FREE)
  predictions Prediction[]
  votes Vote[]
  transactions Transaction[]
  createdAt DateTime @default(now())
}

model Contestant {
  id String @id @default(cuid())
  name String
  bio String?
  photoUrl String?
  status ContestantStatus @default(ACTIVE)
  isNominated Boolean @default(false)
  isHoH Boolean @default(false)
  evictedAt DateTime?
  seasonId String
  votes Vote[]
}

model Market {
  id String @id @default(cuid())
  title String
  description String?
  type MarketType
  status MarketStatus @default(OPEN)
  polymarketId String? @unique
  closesAt DateTime
  settledAt DateTime?
  winningOptionId String?
  options MarketOption[]
  predictions Prediction[]
}

model Prediction {
  id String @id @default(cuid())
  userId String
  marketId String
  optionId String
  amount Int // In Stakes
  odds Float
  potentialWin Int
  status PredictionStatus @default(PENDING)
  createdAt DateTime @default(now())
}
```

## 3.2 Enums

| Enum | Values |
| --- | --- |
| UserTier | FREE, BRONZE, SILVER, GOLD, PLATINUM |
| ContestantStatus | ACTIVE, NOMINATED, EVICTED, WINNER |
| MarketType | ELIMINATION, CHALLENGE, SOCIAL, PROP, WINNER |
| MarketStatus | DRAFT, OPEN, CLOSED, SETTLED, CANCELLED |
| TransactionType | DEPOSIT, WITHDRAWAL, BET, WIN, VOTE, REWARD |

---

# 4. Core Features Implementation

## 4.1 Prediction Markets

The platform's core differentiator is crypto-powered prediction markets with all complexity abstracted.

### Market Categories

| Type | Example | Settlement |
| --- | --- | --- |
| Elimination | Who gets evicted Sunday? | Auto on eviction broadcast |
| Challenge | Who wins Head of House? | Auto on challenge completion |
| Social | Will Kachi & Amara kiss? | Mod verified with clip |
| Prop | Over/under 3 arguments? | End of period count |
| Winner | Who wins the Grand Prize? | Finale night |

### Two-Currency Model

| Currency | How to Get | Use Cases |
| --- | --- | --- |
| Clout (Free) | Daily login (+50), watching (+10/hr), chatting (+1/msg), referrals (+500) | Basic voting, polls, free predictions, emotes |
| Stakes (Paid) | Purchase with Naira, win from predictions | Real-money predictions, premium votes, TTS |

## 4.2 Voting & Elimination

- Nomination: Contestants nominate 2 housemates in Diary Room each week
- Voting Window: Opens after nominations, closes 1 hour before eviction show
- Vote Cost: 10 Clout or 1 Stake per vote
- Vote Multiplier: Premium tiers get 1.5x-3x vote weight
- Transparency: Final vote counts published on-chain after eviction

## 4.3 Payment Integration (Paystack)

Nigerian-first payment rails using Paystack for bank transfers and cards.

### Pricing Tiers

| Amount | Stakes | Bonus | Total |
| --- | --- | --- | --- |
| ₦2,000 | 200 | 0% | 200 |
| ₦5,000 | 500 | +10% | 550 |
| ₦10,000 | 1,000 | +15% | 1,150 |
| ₦25,000 | 2,500 | +20% | 3,000 |

---

# 5. Implementation Roadmap

## Phase 1: Foundation (Weeks 1-2)

Goal: Replace db.json with proper database, establish core data models

1. Set up PostgreSQL database (Supabase or Neon)
2. Install and configure Prisma ORM
3. Create database schema (Users, Contestants, Cameras, ChatMessages)
4. Migrate existing db.json data to PostgreSQL
5. Update API routes to use Prisma
6. Set up Redis for caching and real-time pub/sub
7. Add Zustand stores for client-side state management

## Phase 2: User Economy (Weeks 3-4)

Goal: Implement two-currency system and payment integration

1. Create Wallet service with Clout/Stakes balance tracking
2. Build Transaction model for all currency movements
3. Integrate Paystack for Naira deposits
4. Implement Clout earning system (login, watch time, chat)
5. Build wallet UI component (balance display, add funds, history)
6. Create withdrawal flow for Stakes to Naira
7. Add user tier system (Free, Bronze, Silver, Gold, Platinum)

## Phase 3: Prediction Markets (Weeks 5-7)

Goal: Build prediction market infrastructure with Polymarket abstraction

1. Design Market and MarketOption database models
2. Build market creation admin interface
3. Implement odds calculation and display
4. Create prediction placement flow (select option, enter amount, confirm)
5. Build market settlement system
6. Integrate Polymarket API for on-chain settlement
7. Create prediction history and portfolio view
8. Build leaderboard with prediction accuracy tracking

## Phase 4: Voting & Contestants (Weeks 8-9)

Goal: Complete voting system and contestant management

1. Create Contestant profiles with photos, bios, stats
2. Build nomination system (admin marks nominated contestants)
3. Implement voting interface with Clout/Stakes options
4. Create vote weighting based on user tier
5. Build eviction reveal flow with vote count display
6. Create contestant stats dashboard (days in house, nominations survived)
7. Add Head of House designation and immunity system

---

# 6. API Specification

## 6.1 Authentication Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/auth/verify | Verify Privy token, create/update user |
| GET | /api/auth/me | Get current user profile and balances |

## 6.2 Prediction Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/markets | List all open markets |
| GET | /api/markets/:id | Get market details with options |
| POST | /api/predictions | Place a new prediction |
| GET | /api/predictions/me | Get user's prediction history |
| GET | /api/leaderboard | Get top predictors |

## 6.3 Voting Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/contestants | List all active contestants |
| GET | /api/contestants/nominated | Get currently nominated contestants |
| POST | /api/votes | Cast vote for contestant |
| GET | /api/votes/me | Get user's votes this week |

## 6.4 Payment Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/payments/initialize | Initialize Paystack transaction |
| POST | /api/payments/webhook | Paystack webhook handler |
| POST | /api/payments/withdraw | Request withdrawal to bank |
| GET | /api/transactions | Get transaction history |

---

# 7. Environment Configuration

## 7.1 Required Environment Variables

```env
# .env.local
# Database
DATABASE_URL="postgresql://..."
# Redis
REDIS_URL="redis://..."
# Privy Auth
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"
PRIVY_APP_SECRET="your-privy-secret"
# Livepeer
LIVEPEER_API_KEY="your-livepeer-key"
# Paystack
PAYSTACK_SECRET_KEY="sk_live..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live..."
# Polymarket (optional)
POLYMARKET_API_KEY="your-polymarket-key"
POLYMARKET_WALLET_PRIVATE_KEY="0x..."
```

---

# 8. Success Metrics

## 8.1 Launch Targets (Week 1)

| Metric | Target |
| --- | --- |
| Daily Active Viewers | 10,000 |
| Peak Concurrent Viewers | 5,000 |
| Weekly Prediction Volume | ₦50M |
| Chat Messages per Day | 50,000 |
| D7 Retention | 40% |
| Conversion (Free to Paid) | 5% |

## 8.2 6-Month Targets

| Metric | Target |
| --- | --- |
| Daily Active Viewers | 100,000 |
| Peak Concurrent Viewers | 50,000 |
| Weekly Prediction Volume | ₦500M |
| Chat Messages per Day | 500,000 |
| D7 Retention | 55% |
| Conversion (Free to Paid) | 10% |

---

End of Document

For questions, contact the development team.

