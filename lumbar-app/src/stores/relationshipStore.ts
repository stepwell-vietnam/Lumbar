// M11: Soul Breathing - Relationship Store
import { create } from 'zustand';
import { RelationshipLevel, RelationshipState, TimeContext, TimePeriod, TIME_PERIODS, MessageContext } from '../types/relationship';

interface RelationshipStore extends RelationshipState {
    // Actions
    recordBreakCompleted: () => void;
    recordSnooze: () => void;
    recordReturn: () => void;
    setIdle: () => void;
    resetDaily: () => void;

    // Getters
    getTimeContext: () => TimeContext;
    getCurrentLevel: () => RelationshipLevel;
    getMessageContext: () => MessageContext;
}

export const useRelationshipStore = create<RelationshipStore>((set, get) => ({
    currentLevel: 'warning',
    consecutiveBreaks: 0,
    consecutiveSnoozes: 0,
    totalBreaksToday: 0,
    lastBreakTime: null,
    moodHistory: [],

    recordBreakCompleted: () => {
        const { consecutiveBreaks, moodHistory } = get();
        const newConsecutive = consecutiveBreaks + 1;

        let newLevel: RelationshipLevel = 'reconcile';
        if (newConsecutive >= 3) newLevel = 'angel';

        set({
            consecutiveBreaks: newConsecutive,
            consecutiveSnoozes: 0,
            totalBreaksToday: get().totalBreaksToday + 1,
            currentLevel: newLevel,
            lastBreakTime: new Date().toISOString(),
            moodHistory: [...moodHistory.slice(-4), newLevel],
        });

        console.log(`✅ Relationship: Break completed. Level: ${newLevel}, Streak: ${newConsecutive}`);
    },

    recordSnooze: () => {
        const { consecutiveSnoozes, moodHistory } = get();
        const newSnoozeCount = consecutiveSnoozes + 1;

        let newLevel: RelationshipLevel = 'warning';
        if (newSnoozeCount >= 3) newLevel = 'villain';

        set({
            consecutiveSnoozes: newSnoozeCount,
            consecutiveBreaks: 0,
            currentLevel: newLevel,
            moodHistory: [...moodHistory.slice(-4), newLevel],
        });

        console.log(`⚠️ Relationship: Snooze #${newSnoozeCount}. Level: ${newLevel}`);
    },

    recordReturn: () => {
        set({
            currentLevel: 'reconcile',
            moodHistory: [...get().moodHistory.slice(-4), 'reconcile'],
        });
        console.log('🤝 Relationship: User returned, level set to reconcile');
    },

    setIdle: () => {
        set({ currentLevel: 'dormant' });
        console.log('😴 Relationship: User idle, level set to dormant');
    },

    resetDaily: () => {
        set({
            consecutiveBreaks: 0,
            consecutiveSnoozes: 0,
            totalBreaksToday: 0,
            lastBreakTime: null,
            currentLevel: 'warning',
            moodHistory: [],
        });
        console.log('🔄 Relationship: Daily reset');
    },

    getTimeContext: (): TimeContext => {
        const hour = new Date().getHours();

        for (const [period, range] of Object.entries(TIME_PERIODS)) {
            // Special case for late_night crossing midnight
            if (range.start > range.end) {
                if (hour >= range.start || hour < range.end) {
                    return { period: period as TimePeriod, hour };
                }
            } else if (hour >= range.start && hour < range.end) {
                return { period: period as TimePeriod, hour };
            }
        }
        return { period: 'morning', hour };
    },

    getCurrentLevel: () => get().currentLevel,

    getMessageContext: (): MessageContext => ({
        level: get().currentLevel,
        timeContext: get().getTimeContext(),
        streak: get().consecutiveBreaks,
        consecutiveSnoozes: get().consecutiveSnoozes,
        workMinutes: 0,
    }),
}));
