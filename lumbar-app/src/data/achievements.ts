import { Achievement } from '../types/stats';

export const achievementDefinitions: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
    // Streak Achievements
    {
        id: 'streak_3',
        titleKey: 'achievements.streak_3.title',
        descriptionKey: 'achievements.streak_3.description',
        icon: '🔥',
        target: 3,
    },
    {
        id: 'streak_7',
        titleKey: 'achievements.streak_7.title',
        descriptionKey: 'achievements.streak_7.description',
        icon: '🔥🔥',
        target: 7,
    },
    {
        id: 'streak_30',
        titleKey: 'achievements.streak_30.title',
        descriptionKey: 'achievements.streak_30.description',
        icon: '🏆',
        target: 30,
    },

    // Break Count Achievements
    {
        id: 'breaks_10',
        titleKey: 'achievements.breaks_10.title',
        descriptionKey: 'achievements.breaks_10.description',
        icon: '☕',
        target: 10,
    },
    {
        id: 'breaks_50',
        titleKey: 'achievements.breaks_50.title',
        descriptionKey: 'achievements.breaks_50.description',
        icon: '🎯',
        target: 50,
    },
    {
        id: 'breaks_100',
        titleKey: 'achievements.breaks_100.title',
        descriptionKey: 'achievements.breaks_100.description',
        icon: '💯',
        target: 100,
    },
    {
        id: 'breaks_500',
        titleKey: 'achievements.breaks_500.title',
        descriptionKey: 'achievements.breaks_500.description',
        icon: '👑',
        target: 500,
    },

    // Special Achievements
    {
        id: 'no_snooze_day',
        titleKey: 'achievements.no_snooze_day.title',
        descriptionKey: 'achievements.no_snooze_day.description',
        icon: '💪',
        target: 1,
    },
    {
        id: 'early_bird',
        titleKey: 'achievements.early_bird.title',
        descriptionKey: 'achievements.early_bird.description',
        icon: '🌅',
        target: 1,
    },
];

// Helper to get mock achievements with progress
export const getMockAchievements = (totalBreaks: number, currentStreak: number): Achievement[] => {
    return achievementDefinitions.map(def => {
        let progress = 0;
        let unlockedAt: string | null = null;

        // Calculate progress based on achievement type
        if (def.id.startsWith('streak_')) {
            progress = Math.min((currentStreak / def.target) * 100, 100);
            if (currentStreak >= def.target) {
                unlockedAt = new Date().toISOString();
            }
        } else if (def.id.startsWith('breaks_')) {
            progress = Math.min((totalBreaks / def.target) * 100, 100);
            if (totalBreaks >= def.target) {
                unlockedAt = new Date().toISOString();
            }
        } else if (def.id === 'no_snooze_day') {
            // Mock: unlocked if streak > 0
            progress = currentStreak > 0 ? 100 : 0;
            if (currentStreak > 0) unlockedAt = new Date().toISOString();
        } else if (def.id === 'early_bird') {
            // Mock: not unlocked
            progress = 0;
        }

        return {
            ...def,
            progress,
            unlockedAt,
        };
    });
};
