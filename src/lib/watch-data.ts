import type { Market, MarketOption, Prediction, User } from '@prisma/client';
import type { PredictionMarket, PredictionOption, UserBet } from '@/types/prediction';

type WatchMarket = Market & {
  options: MarketOption[];
  creator?: Pick<User, 'username'> | null;
};

type WatchPrediction = Prediction & {
  option?: Pick<MarketOption, 'label'> | null;
  user?: Pick<User, 'username'> | null;
};

const MARKET_TYPE_BY_CATEGORY: Record<PredictionMarket['category'], Market['type']> = {
  contestant: 'ELIMINATION',
  challenge: 'CHALLENGE',
  drama: 'SOCIAL',
  event: 'PROP',
  other: 'PROP',
};

const CATEGORY_BY_MARKET_TYPE: Record<Market['type'], PredictionMarket['category']> = {
  ELIMINATION: 'contestant',
  CHALLENGE: 'challenge',
  SOCIAL: 'drama',
  PROP: 'event',
  WINNER: 'contestant',
};

const STATUS_BY_MARKET_STATUS: Record<Market['status'], PredictionMarket['status']> = {
  DRAFT: 'closed',
  OPEN: 'active',
  CLOSED: 'closed',
  SETTLED: 'resolved',
  CANCELLED: 'closed',
};

export const marketTypeFromCategory = (category: PredictionMarket['category']): Market['type'] => (
  MARKET_TYPE_BY_CATEGORY[category] || 'PROP'
);

export const categoryFromMarketType = (type: Market['type']): PredictionMarket['category'] => (
  CATEGORY_BY_MARKET_TYPE[type] || 'other'
);

export const statusFromMarketStatus = (status: Market['status']): PredictionMarket['status'] => (
  STATUS_BY_MARKET_STATUS[status] || 'closed'
);

export const calculateOptionPercentage = (optionStake: number, totalPool: number, optionCount: number) => {
  if (totalPool <= 0) return Math.floor(100 / Math.max(optionCount, 1));
  return Math.round((optionStake / totalPool) * 100);
};

export const oddsMultiplierFromOption = (option: Pick<MarketOption, 'currentOdds'>) => {
  const odds = Number(option.currentOdds);
  if (!Number.isFinite(odds) || odds <= 0) return 2;
  return Math.round(Math.max(1.01, odds) * 100) / 100;
};

export const toPredictionMarket = (market: WatchMarket): PredictionMarket => {
  const totalPool = market.totalVolume || market.options.reduce((sum, option) => sum + option.totalStaked, 0);
  const optionCount = market.options.length || 1;
  const options: PredictionOption[] = market.options.map((option) => ({
    id: option.id,
    label: option.label,
    odds: oddsMultiplierFromOption(option),
    totalBets: option.totalStaked,
    percentage: calculateOptionPercentage(option.totalStaked, totalPool, optionCount),
  }));

  return {
    id: market.id,
    question: market.title,
    creatorUsername: market.creator?.username || 'Starfactor',
    createdAt: market.createdAt.toISOString(),
    expiresAt: market.closesAt.toISOString(),
    status: statusFromMarketStatus(market.status),
    totalPool,
    options,
    resolvedOptionId: market.winningOptionId || undefined,
    category: categoryFromMarketType(market.type),
  };
};

export const toUserBet = (prediction: WatchPrediction): UserBet => ({
  id: prediction.id,
  marketId: prediction.marketId,
  optionId: prediction.optionId,
  amount: prediction.amount,
  potentialWinnings: prediction.potentialWin,
  placedAt: prediction.createdAt.toISOString(),
  username: prediction.user?.username || 'You',
});
