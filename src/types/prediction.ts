export interface PredictionMarket {
  id: string;
  question: string;
  creatorUsername: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'closed' | 'resolved';
  totalPool: number;
  options: PredictionOption[];
  resolvedOptionId?: string;
  category: 'contestant' | 'event' | 'challenge' | 'drama' | 'other';
}

export interface PredictionOption {
  id: string;
  label: string;
  odds: number;
  totalBets: number;
  percentage: number;
}

export interface UserBet {
  id: string;
  marketId: string;
  optionId: string;
  amount: number;
  potentialWinnings: number;
  placedAt: string;
  username: string;
}

export interface MarketCreationData {
  question: string;
  options: string[];
  duration: number; // in hours
  category: PredictionMarket['category'];
}
