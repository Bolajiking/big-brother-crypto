'use client';

import { create } from 'zustand';
import type { Contestant, ContestantWithVotes, VotingWindow, Vote, ContestantStatus } from '@/types';

interface ContestantState {
  // Contestant data
  contestants: Contestant[];
  selectedContestant: Contestant | null;
  isLoading: boolean;
  error: string | null;

  // Voting
  activeVotingWindow: VotingWindow | null;
  userVotes: Vote[];
  voteResults: ContestantWithVotes[];

  // Filters
  statusFilter: ContestantStatus | 'ALL';

  // Actions
  setContestants: (contestants: Contestant[]) => void;
  updateContestant: (contestantId: string, updates: Partial<Contestant>) => void;
  setSelectedContestant: (contestant: Contestant | null) => void;
  setActiveVotingWindow: (window: VotingWindow | null) => void;
  setUserVotes: (votes: Vote[]) => void;
  addVote: (vote: Vote) => void;
  setVoteResults: (results: ContestantWithVotes[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStatusFilter: (status: ContestantStatus | 'ALL') => void;

  // Computed
  getActiveContestants: () => Contestant[];
  getNominatedContestants: () => Contestant[];
  getEvictedContestants: () => Contestant[];
  getHeadOfHouse: () => Contestant | null;
  getUserVotesForWindow: (windowId: string) => Vote[];
  getTotalUserVotes: () => number;
}

export const useContestantStore = create<ContestantState>()((set, get) => ({
  // Initial state
  contestants: [],
  selectedContestant: null,
  isLoading: false,
  error: null,
  activeVotingWindow: null,
  userVotes: [],
  voteResults: [],
  statusFilter: 'ALL',

  // Actions
  setContestants: (contestants) => set({ contestants }),

  updateContestant: (contestantId, updates) => {
    set((state) => ({
      contestants: state.contestants.map((c) =>
        c.id === contestantId ? { ...c, ...updates } : c
      ),
      selectedContestant:
        state.selectedContestant?.id === contestantId
          ? { ...state.selectedContestant, ...updates }
          : state.selectedContestant,
    }));
  },

  setSelectedContestant: (contestant) => set({ selectedContestant: contestant }),

  setActiveVotingWindow: (window) => set({ activeVotingWindow: window }),

  setUserVotes: (votes) => set({ userVotes: votes }),

  addVote: (vote) => {
    set((state) => ({
      userVotes: [...state.userVotes, vote],
    }));
  },

  setVoteResults: (results) => set({ voteResults: results }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  // Computed helpers
  getActiveContestants: () => {
    return get().contestants.filter((c) => c.status === 'ACTIVE');
  },

  getNominatedContestants: () => {
    return get().contestants.filter((c) => c.isNominated && c.status === 'ACTIVE');
  },

  getEvictedContestants: () => {
    return get()
      .contestants.filter((c) => c.status === 'EVICTED')
      .sort((a, b) => (b.evictionRank ?? 0) - (a.evictionRank ?? 0));
  },

  getHeadOfHouse: () => {
    return get().contestants.find((c) => c.isHoH && c.status === 'ACTIVE') ?? null;
  },

  getUserVotesForWindow: (windowId) => {
    return get().userVotes.filter((v) => v.windowId === windowId);
  },

  getTotalUserVotes: () => {
    return get().userVotes.reduce((total, v) => total + v.voteCount, 0);
  },
}));
