import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { DailyStats, AllTimeStats, Achievement } from '../types/stats';
import { getMockAchievements } from '../data/achievements';

interface StatsState {
    todayStats: DailyStats | null;
    allTimeStats: AllTimeStats | null;
    achievements: Achievement[];
    isLoading: boolean;

    // Actions
    initialize: () => Promise<void>;
    recordBreakCompleted: () => Promise<void>;
    recordBreakMissed: () => Promise<void>;
    recordSnooze: () => Promise<void>;
    refreshStats: () => Promise<void>;
    checkAchievements: () => Promise<Achievement[]>;
}

const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

export const useStatsStore = create<StatsState>((set, get) => ({
    todayStats: null,
    allTimeStats: null,
    achievements: [],
    isLoading: false,

    initialize: async () => {
        set({ isLoading: true });
        await get().refreshStats();
        await get().checkAchievements();
        set({ isLoading: false });
        console.log('✅ Stats store initialized');
    },

    recordBreakCompleted: async () => {
        if (isTauri) {
            try {
                await invoke('stats_record_break', { completed: true });
            } catch (error) {
                console.error('Failed to record break:', error);
            }
        }

        // Update local state
        const today = get().todayStats;
        const allTime = get().allTimeStats;
        if (today && allTime) {
            set({
                todayStats: {
                    ...today,
                    breaksCompleted: today.breaksCompleted + 1,
                },
                allTimeStats: {
                    ...allTime,
                    totalBreaks: allTime.totalBreaks + 1,
                },
            });
        }

        await get().checkAchievements();
    },

    recordBreakMissed: async () => {
        if (isTauri) {
            try {
                await invoke('stats_record_break', { completed: false });
            } catch (error) {
                console.error('Failed to record missed break:', error);
            }
        }

        const today = get().todayStats;
        if (today) {
            set({
                todayStats: {
                    ...today,
                    breaksMissed: today.breaksMissed + 1,
                },
            });
        }
    },

    recordSnooze: async () => {
        if (isTauri) {
            try {
                await invoke('stats_record_snooze');
            } catch (error) {
                console.error('Failed to record snooze:', error);
            }
        }

        const today = get().todayStats;
        const allTime = get().allTimeStats;
        if (today && allTime) {
            set({
                todayStats: {
                    ...today,
                    snoozeCount: today.snoozeCount + 1,
                },
                allTimeStats: {
                    ...allTime,
                    totalSnoozes: allTime.totalSnoozes + 1,
                },
            });
        }
    },

    refreshStats: async () => {
        if (isTauri) {
            try {
                const [today, allTime] = await Promise.all([
                    invoke<DailyStats>('stats_get_today'),
                    invoke<AllTimeStats>('stats_get_all_time'),
                ]);
                set({ todayStats: today, allTimeStats: allTime });
            } catch (error) {
                console.error('Failed to refresh stats:', error);
            }
        } else {
            // Browser mock data
            set({
                todayStats: {
                    date: new Date().toISOString().split('T')[0],
                    breaksCompleted: 5,
                    breaksMissed: 1,
                    snoozeCount: 2,
                    totalWorkMinutes: 180,
                    totalBreakMinutes: 15,
                },
                allTimeStats: {
                    totalBreaks: 126,
                    totalSnoozes: 24,
                    currentStreak: 7,
                    longestStreak: 14,
                    totalWorkHours: 42,
                    firstUseDate: '2026-01-22',
                },
            });
        }
    },

    checkAchievements: async () => {
        const allTime = get().allTimeStats;
        if (!allTime) return [];

        if (isTauri) {
            try {
                const achievements = await invoke<Achievement[]>('stats_get_achievements');
                set({ achievements });
                return achievements;
            } catch (error) {
                console.error('Failed to check achievements:', error);
            }
        }

        // Browser mock
        const achievements = getMockAchievements(allTime.totalBreaks, allTime.currentStreak);
        set({ achievements });
        return achievements;
    },
}));
