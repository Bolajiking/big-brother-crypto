// Big Brother Crypto - TypeScript Type Definitions
// These types mirror the Prisma schema for client-side use

// ============================================
// ENUMS
// ============================================

export type UserTier = 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type ContestantStatus = 'ACTIVE' | 'NOMINATED' | 'EVICTED' | 'WINNER';

export type MarketType = 'ELIMINATION' | 'CHALLENGE' | 'SOCIAL' | 'PROP' | 'WINNER';

export type MarketStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'SETTLED' | 'CANCELLED';

export type PredictionStatus = 'PENDING' | 'WON' | 'LOST' | 'CANCELLED' | 'REFUNDED';

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'BET'
  | 'WIN'
  | 'VOTE'
  | 'REWARD'
  | 'DAILY_LOGIN'
  | 'WATCH_TIME'
  | 'CHAT_BONUS'
  | 'REFERRAL';

export type VoteType = 'SAVE' | 'EVICT';

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  privyId: string;
  walletAddress?: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  cloutBalance: number;
  stakesBalance: number;
  tier: UserTier;
  totalWatchTime: number;
  totalMessages: number;
  lastLoginAt?: string;
  lastCloutClaim?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  predictions?: Prediction[];
  votes?: Vote[];
  transactions?: Transaction[];
}

// ============================================
// CONTESTANT TYPES
// ============================================

export interface Contestant {
  id: string;
  name: string;
  nickname?: string;
  bio?: string;
  photoUrl?: string;
  age?: number;
  occupation?: string;
  state?: string;
  status: ContestantStatus;
  isNominated: boolean;
  isHoH: boolean;
  hasImmunity: boolean;
  daysInHouse: number;
  nominationsSurvived: number;
  challengesWon: number;
  evictedAt?: string;
  evictionRank?: number;
  seasonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContestantWithVotes extends Contestant {
  totalVotes?: number;
  votePercentage?: number;
}

// ============================================
// CAMERA TYPES
// ============================================

export interface Camera {
  id: string;
  name: string;
  description?: string;
  playbackId: string;
  streamId: string;
  streamKey?: string;
  isActive: boolean;
  isLive: boolean;
  viewerCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PREDICTION MARKET TYPES
// ============================================

export interface Market {
  id: string;
  title: string;
  description?: string;
  type: MarketType;
  status: MarketStatus;
  polymarketId?: string;
  opensAt: string;
  closesAt: string;
  settledAt?: string;
  winningOptionId?: string;
  totalVolume: number;
  seasonId?: string;
  options: MarketOption[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketOption {
  id: string;
  label: string;
  currentOdds: number; // Percentage (e.g., 25 = 25% chance = 4.0x payout)
  totalStaked: number;
  marketId: string;
  contestantId?: string;
  contestant?: Contestant;
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  id: string;
  userId: string;
  marketId: string;
  optionId: string;
  amount: number;
  oddsAtPurchase: number;
  potentialWin: number;
  status: PredictionStatus;
  settledAmount?: number;
  createdAt: string;
  updatedAt: string;
  market?: Market;
  option?: MarketOption;
}

// ============================================
// VOTING TYPES
// ============================================

export interface VotingWindow {
  id: string;
  title: string;
  opensAt: string;
  closesAt: string;
  isActive: boolean;
  resultsPublished: boolean;
  seasonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  contestantId: string;
  windowId: string;
  voteType: VoteType;
  voteCount: number;
  paidWithClout: number;
  paidWithStakes: number;
  createdAt: string;
  contestant?: Contestant;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  cloutAmount: number;
  stakesAmount: number;
  nairaAmount?: number;
  paystackRef?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  cloutBalanceAfter?: number;
  stakesBalanceAfter?: number;
  createdAt: string;
}

// ============================================
// CHAT TYPES
// ============================================

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  isEmoji: boolean;
  isSfx: boolean;
  isTts: boolean;
  isDeleted: boolean;
  deletedBy?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'username' | 'avatarUrl' | 'tier'>;
}

// ============================================
// SEASON TYPES
// ============================================

export interface Season {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  prizePool: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// WALLET & PAYMENT TYPES
// ============================================

export interface WalletBalance {
  clout: number;
  stakes: number;
}

export interface PaymentTier {
  amount: number; // Naira amount
  stakes: number; // Base stakes
  bonus: number;  // Bonus percentage
  total: number;  // Total stakes received
}

export const PAYMENT_TIERS: PaymentTier[] = [
  { amount: 2000, stakes: 200, bonus: 0, total: 200 },
  { amount: 5000, stakes: 500, bonus: 10, total: 550 },
  { amount: 10000, stakes: 1000, bonus: 15, total: 1150 },
  { amount: 25000, stakes: 2500, bonus: 20, total: 3000 },
];

// ============================================
// USER TIER MULTIPLIERS
// ============================================

export const TIER_VOTE_MULTIPLIERS: Record<UserTier, number> = {
  FREE: 1,
  BRONZE: 1.5,
  SILVER: 2,
  GOLD: 2.5,
  PLATINUM: 3,
};

// ============================================
// CLOUT EARNING RATES
// ============================================

export const CLOUT_RATES = {
  DAILY_LOGIN: 50,
  WATCH_TIME_PER_HOUR: 10,
  CHAT_MESSAGE: 1,
  REFERRAL: 500,
} as const;

// ============================================
// VOTING COSTS
// ============================================

export const VOTE_COSTS = {
  CLOUT_PER_VOTE: 10,
  STAKES_PER_VOTE: 1,
} as const;
