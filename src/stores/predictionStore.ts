import { create } from 'zustand';
import { PredictionMarket, UserBet, MarketCreationData, PredictionOption } from '@/types/prediction';

interface PredictionState {
  markets: PredictionMarket[];
  userBets: UserBet[];
  isLoading: boolean;

  // Actions
  setMarkets: (markets: PredictionMarket[]) => void;
  setUserBets: (userBets: UserBet[]) => void;
  upsertMarket: (market: PredictionMarket) => void;
  addUserBet: (bet: UserBet) => void;
  addMarket: (data: MarketCreationData, creatorUsername: string) => void;
  placeBet: (marketId: string, optionId: string, amount: number, username: string) => void;
  resolveMarket: (marketId: string, winningOptionId: string) => void;
  initializeDemoData: () => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Calculate odds based on current bets
const calculateOdds = (option: PredictionOption, totalPool: number): number => {
  if (option.totalBets === 0) return 2.0;
  const impliedProbability = option.totalBets / totalPool;
  return Math.max(1.1, 1 / impliedProbability);
};

// Demo prediction markets
const getDemoMarkets = (): PredictionMarket[] => {
  const now = new Date();

  return [
    {
      id: generateId(),
      question: 'Will Amara survive this week\'s eviction?',
      creatorUsername: 'CryptoKing',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      totalPool: 2450,
      category: 'contestant',
      options: [
        { id: 'yes-1', label: 'Yes', odds: 1.45, totalBets: 1680, percentage: 69 },
        { id: 'no-1', label: 'No', odds: 2.85, totalBets: 770, percentage: 31 },
      ],
    },
    {
      id: generateId(),
      question: 'Who will win the midnight cooking challenge?',
      creatorUsername: 'BitcoinBoss',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      totalPool: 1820,
      category: 'challenge',
      options: [
        { id: 'kwame', label: 'Kwame', odds: 2.10, totalBets: 650, percentage: 36 },
        { id: 'zainab', label: 'Zainab', odds: 2.50, totalBets: 520, percentage: 29 },
        { id: 'chidi', label: 'Chidi', odds: 3.20, totalBets: 390, percentage: 21 },
        { id: 'nadia', label: 'Nadia', odds: 4.80, totalBets: 260, percentage: 14 },
      ],
    },
    {
      id: generateId(),
      question: 'Will there be a dramatic argument tonight?',
      creatorUsername: 'EthMaster',
      createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      totalPool: 980,
      category: 'drama',
      options: [
        { id: 'yes-2', label: 'Yes, definitely', odds: 1.35, totalBets: 720, percentage: 73 },
        { id: 'no-2', label: 'Peaceful night', odds: 3.75, totalBets: 260, percentage: 27 },
      ],
    },
    {
      id: generateId(),
      question: 'Which contestant will Big Brother call to the diary room first?',
      creatorUsername: 'BaseBro',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      totalPool: 560,
      category: 'event',
      options: [
        { id: 'amara', label: 'Amara', odds: 3.50, totalBets: 120, percentage: 21 },
        { id: 'tunde', label: 'Tunde', odds: 2.80, totalBets: 180, percentage: 32 },
        { id: 'fatima', label: 'Fatima', odds: 4.20, totalBets: 100, percentage: 18 },
        { id: 'emeka', label: 'Emeka', odds: 3.10, totalBets: 160, percentage: 29 },
      ],
    },
    {
      id: generateId(),
      question: 'Total number of arguments today: Over or Under 3?',
      creatorUsername: 'DiamondHands',
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      totalPool: 1340,
      category: 'drama',
      options: [
        { id: 'over', label: 'Over 3', odds: 1.65, totalBets: 810, percentage: 60 },
        { id: 'under', label: 'Under 3', odds: 2.40, totalBets: 530, percentage: 40 },
      ],
    },
  ];
};

export const usePredictionStore = create<PredictionState>((set, get) => ({
  markets: [],
  userBets: [],
  isLoading: false,

  setMarkets: (markets) => set({ markets }),

  setUserBets: (userBets) => set({ userBets }),

  upsertMarket: (market) => {
    set((state) => ({
      markets: state.markets.some((item) => item.id === market.id)
        ? state.markets.map((item) => (item.id === market.id ? market : item))
        : [market, ...state.markets],
    }));
  },

  addUserBet: (bet) => {
    set((state) => ({
      userBets: state.userBets.some((item) => item.id === bet.id || item.marketId === bet.marketId)
        ? state.userBets.map((item) => (item.id === bet.id || item.marketId === bet.marketId ? bet : item))
        : [bet, ...state.userBets],
    }));
  },

  initializeDemoData: () => {
    set({ markets: getDemoMarkets(), userBets: [] });
  },

  addMarket: (data: MarketCreationData, creatorUsername: string) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + data.duration * 60 * 60 * 1000);

    const basePercentage = Math.floor(100 / data.options.length);
    const options: PredictionOption[] = data.options.map((label, index) => ({
      id: generateId(),
      label,
      odds: 2.0,
      totalBets: 0,
      percentage: index === 0 ? basePercentage + (100 % data.options.length) : basePercentage,
    }));

    const newMarket: PredictionMarket = {
      id: generateId(),
      question: data.question,
      creatorUsername,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      totalPool: 0,
      category: data.category,
      options,
    };

    set((state) => ({
      markets: [newMarket, ...state.markets],
    }));
  },

  placeBet: (marketId: string, optionId: string, amount: number, username: string) => {
    const { markets, userBets } = get();

    // Check if user already bet on this market
    if (userBets.some(b => b.marketId === marketId)) return;

    const market = markets.find(m => m.id === marketId);
    if (!market || market.status !== 'active') return;

    const option = market.options.find(o => o.id === optionId);
    if (!option) return;

    // Calculate potential winnings
    const potentialWinnings = amount * option.odds;

    // Create user bet
    const newBet: UserBet = {
      id: generateId(),
      marketId,
      optionId,
      amount,
      potentialWinnings,
      placedAt: new Date().toISOString(),
      username,
    };

    // Update market with new bet
    const updatedMarkets = markets.map(m => {
      if (m.id !== marketId) return m;

      const newTotalPool = m.totalPool + amount;
      const updatedOptions = m.options.map(o => {
        const newTotalBets = o.id === optionId ? o.totalBets + amount : o.totalBets;
        const newPercentage = Math.round((newTotalBets / newTotalPool) * 100);
        const newOdds = calculateOdds({ ...o, totalBets: newTotalBets }, newTotalPool);

        return {
          ...o,
          totalBets: newTotalBets,
          percentage: newPercentage,
          odds: Math.round(newOdds * 100) / 100,
        };
      });

      return {
        ...m,
        totalPool: newTotalPool,
        options: updatedOptions,
      };
    });

    set({
      markets: updatedMarkets,
      userBets: [...userBets, newBet],
    });
  },

  resolveMarket: (marketId: string, winningOptionId: string) => {
    set((state) => ({
      markets: state.markets.map(m =>
        m.id === marketId
          ? { ...m, status: 'resolved' as const, resolvedOptionId: winningOptionId }
          : m
      ),
    }));
  },
}));
