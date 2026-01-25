This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Star Factor

Africa's first crypto-powered reality show platform. Features 24/7 live streaming from multiple camera feeds, email and Google authentication via Privy, real-time chat, prediction markets, and interactive voting.

> 📋 **Implementation Guide**: See [PRD.md](./PRD.md) for the complete Product Requirements Document and implementation roadmap. This document contains detailed specifications for all features, database schema, API endpoints, and development phases.

## Prerequisites

- Node.js 18+ installed
- A Privy account and App ID (sign up at [https://dashboard.privy.io/](https://dashboard.privy.io/))

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Privy App ID:

```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

### 3. Run the Development Server

For the Next.js development server with Turbopack:

```bash
npm run dev
```

Or, to run with the custom Socket.IO server for real-time chat:

```bash
npm run dev-server
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Authentication

The application uses Privy for Web3 authentication. Users can connect with:
- Phantom wallet
- Solflare wallet
- Other Solana-compatible wallets
- Email + wallet combination

## Features

- **8 Live Camera Feeds**: Kitchen, Garden, Lounge, Pool, Garage, Bedroom, Office, Entrance
- **HLS Video Streaming**: Powered by Livepeer
- **Real-time Chat**: Socket.IO-based live chat with emojis and sound effects
- **Interactive Widgets**: Live polls, leaderboards, system status
- **Solana Wallet Authentication**: Secure Web3 login via Privy
- **Responsive Design**: Works on desktop and mobile devices
- **Full-screen Mode**: Click any camera for full-screen viewing

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main homepage
│   ├── login/             # Login page
│   └── api/               # API routes
├── components/            # React components
│   ├── LivepeerPlayer.tsx # Video player
│   ├── MultiCamGrid.tsx   # Camera grid
│   ├── Chat.tsx           # Live chat
│   └── InteractiveWidgets.tsx
└── lib/
    └── privy.tsx          # Privy configuration

server.js                  # Custom Node.js server with Socket.IO
db.json                    # Mock database
```

## Available Scripts

- `npm run dev` - Start Next.js dev server with Turbopack
- `npm run dev-server` - Start custom Node.js server with Socket.IO
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Streaming Setup

To start streaming to the cameras, see [STREAMING_GUIDE.md](STREAMING_GUIDE.md) for detailed instructions on using OBS Studio with the Livepeer RTMP endpoints.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
