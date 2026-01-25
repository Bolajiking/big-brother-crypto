'use client';

import { create } from 'zustand';
import type { Market, Prediction, MarketStatus, MarketType } from '@/types';

interface MarketState {
  // Market data
  markets: Market[];
  selectedMarket: Market | null;
  userPredictions: Prediction[];
  isLoading: boolean;
  error: string | null;

  // Filters
  statusFilter: MarketStatus | 'ALL';
  typeFilter: MarketType | 'ALL';

  // Actions
  setMarkets: (markets: Market[]) => void;
  addMarket: (market: Market) => void;
  updateMarket: (marketId: string, updates: Partial<Market>) => void;
  setSelectedMarket: (market: Market | null) => void;
  setUserPredictions: (predictions: Prediction[]) => void;
  addPrediction: (prediction: Prediction) => void;
  updatePrediction: (predictionId: string, updates: Partial<Prediction>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStatusFilter: (status: MarketStatus | 'ALL') => void;
  setTypeFilter: (type: MarketType | 'ALL') => void;

  // Computed
  getFilteredMarkets: () => Market[];
  getOpenMarkets: () => Market[];
  getPendingPredictions: () => Prediction[];
  getTotalStakedInMarket: (marketId: string) => number;
}

export const useMarketStore = create<MarketState>()((set, get) => ({
  // Initial state
  markets: [],
  selectedMarket: null,
  userPredictions: [],
  isLoading: false,
  error: null,
  statusFilter: 'ALL',
  typeFilter: 'ALL',

  // Actions
  setMarkets: (markets) => set({ markets }),

  addMarket: (market) => {
    set((state) => ({ markets: [...state.markets, market] }));
  },

  updateMarket: (marketId, updates) => {
    set((state) => ({
      markets: state.markets.map((m) =>
        m.id === marketId ? { ...m, ...updates } : m
      ),
      selectedMarket:
        state.selectedMarket?.id === marketId
          ? { ...state.selectedMarket, ...updates }
          : state.selectedMarket,
    }));
  },

  setSelectedMarket: (market) => set({ selectedMarket: market }),

  setUserPredictions: (predictions) => set({ userPredictions: predictions }),

  addPrediction: (prediction) => {
    set((state) => ({
      userPredictions: [prediction, ...state.userPredictions],
    }));
  },

  updatePrediction: (predictionId, updates) => {
    set((state) => ({
      userPredictions: state.userPredictions.map((p) =>
        p.id === predictionId ? { ...p, ...updates } : p
      ),
    }));
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  setTypeFilter: (typeFilter) => set({ typeFilter }),

  // Computed helpers
  getFilteredMarkets: () => {
    const { markets, statusFilter, typeFilter } = get();
    return markets.filter((market) => {
      const statusMatch = statusFilter === 'ALL' || market.status === statusFilter;
      const typeMatch = typeFilter === 'ALL' || market.type === typeFilter;
      return statusMatch && typeMatch;
    });
  },

  getOpenMarkets: () => {
    return get().markets.filter((m) => m.status === 'OPEN');
  },

  getPendingPredictions: () => {
    return get().userPredictions.filter((p) => p.status === 'PENDING');
  },

  getTotalStakedInMarket: (marketId) => {
    return get()
      .userPredictions.filter((p) => p.marketId === marketId)
      .reduce((total, p) => total + p.amount, 0);
  },
}));
