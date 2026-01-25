'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, WalletBalance, Transaction, UserTier } from '@/types';

interface UserState {
  // User data
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Wallet
  balance: WalletBalance;
  transactions: Transaction[];

  // Actions
  setUser: (user: User | null) => void;
  updateBalance: (balance: Partial<WalletBalance>) => void;
  addClout: (amount: number) => void;
  deductClout: (amount: number) => boolean;
  addStakes: (amount: number) => void;
  deductStakes: (amount: number) => boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;

  // Computed
  canAffordClout: (amount: number) => boolean;
  canAffordStakes: (amount: number) => boolean;
  getVoteMultiplier: () => number;
}

const TIER_MULTIPLIERS: Record<UserTier, number> = {
  FREE: 1,
  BRONZE: 1.5,
  SILVER: 2,
  GOLD: 2.5,
  PLATINUM: 3,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,
      balance: { clout: 0, stakes: 0 },
      transactions: [],

      // Actions
      setUser: (user) => {
        set({
          user,
          balance: user
            ? { clout: user.cloutBalance, stakes: user.stakesBalance }
            : { clout: 0, stakes: 0 },
        });
      },

      updateBalance: (newBalance) => {
        set((state) => ({
          balance: { ...state.balance, ...newBalance },
          user: state.user
            ? {
                ...state.user,
                cloutBalance: newBalance.clout ?? state.user.cloutBalance,
                stakesBalance: newBalance.stakes ?? state.user.stakesBalance,
              }
            : null,
        }));
      },

      addClout: (amount) => {
        set((state) => ({
          balance: { ...state.balance, clout: state.balance.clout + amount },
          user: state.user
            ? { ...state.user, cloutBalance: state.user.cloutBalance + amount }
            : null,
        }));
      },

      deductClout: (amount) => {
        const state = get();
        if (state.balance.clout < amount) return false;
        set((state) => ({
          balance: { ...state.balance, clout: state.balance.clout - amount },
          user: state.user
            ? { ...state.user, cloutBalance: state.user.cloutBalance - amount }
            : null,
        }));
        return true;
      },

      addStakes: (amount) => {
        set((state) => ({
          balance: { ...state.balance, stakes: state.balance.stakes + amount },
          user: state.user
            ? { ...state.user, stakesBalance: state.user.stakesBalance + amount }
            : null,
        }));
      },

      deductStakes: (amount) => {
        const state = get();
        if (state.balance.stakes < amount) return false;
        set((state) => ({
          balance: { ...state.balance, stakes: state.balance.stakes - amount },
          user: state.user
            ? { ...state.user, stakesBalance: state.user.stakesBalance - amount }
            : null,
        }));
        return true;
      },

      setTransactions: (transactions) => set({ transactions }),

      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        }));
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      logout: () => {
        set({
          user: null,
          balance: { clout: 0, stakes: 0 },
          transactions: [],
          error: null,
        });
      },

      // Computed helpers
      canAffordClout: (amount) => get().balance.clout >= amount,

      canAffordStakes: (amount) => get().balance.stakes >= amount,

      getVoteMultiplier: () => {
        const user = get().user;
        return user ? TIER_MULTIPLIERS[user.tier] : 1;
      },
    }),
    {
      name: 'bbc-user-storage',
      partialize: (state) => ({
        // Only persist minimal data, refetch user from API on app load
        user: state.user ? { id: state.user.id, username: state.user.username } : null,
      }),
    }
  )
);
