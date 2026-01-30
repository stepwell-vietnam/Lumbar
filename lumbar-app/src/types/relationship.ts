// M11: Soul Breathing - Relationship System Types

export type RelationshipLevel = 'angel' | 'warning' | 'villain' | 'reconcile' | 'dormant';

export interface RelationshipState {
    currentLevel: RelationshipLevel;
    consecutiveBreaks: number;       // Số lần nghỉ đúng giờ liên tiếp
    consecutiveSnoozes: number;      // Số lần snooze liên tiếp trong ngày
    totalBreaksToday: number;        // Tổng số lần nghỉ hôm nay
    lastBreakTime: string | null;    // Timestamp lần nghỉ cuối
    moodHistory: RelationshipLevel[]; // Lịch sử mood (max 5)
}

export type TimePeriod = 'early_morning' | 'morning' | 'post_lunch' | 'afternoon' | 'evening' | 'late_night';

export interface TimeContext {
    period: TimePeriod;
    hour: number;
}

export const TIME_PERIODS: Record<TimePeriod, { start: number; end: number }> = {
    early_morning: { start: 6, end: 8 },   // 6h - 8h
    morning: { start: 8, end: 12 },        // 8h - 12h
    post_lunch: { start: 13, end: 14 },    // 13h - 14h (sau ăn trưa)
    afternoon: { start: 14, end: 17 },     // 14h - 17h
    evening: { start: 17, end: 22 },       // 17h - 22h
    late_night: { start: 22, end: 6 },     // 22h - 6h
};

export interface MessageContext {
    level: RelationshipLevel;
    timeContext: TimeContext;
    streak: number;
    consecutiveSnoozes: number;
    workMinutes: number;
}

// Challenge types
export type ChallengeType = 'eye_follow' | 'water_reminder' | 'stretch_prompt' | 'deep_breath';

export interface MascotChallenge {
    id: string;
    type: ChallengeType;
    titleKey: string;
    descriptionKey: string;
    durationSeconds: number;
    icon: string;
    animation?: 'bounce' | 'rotate' | 'pulse' | 'shake';
}

export const mascotChallenges: MascotChallenge[] = [
    {
        id: 'eye_follow',
        type: 'eye_follow',
        titleKey: 'challenges.eye_follow.title',
        descriptionKey: 'challenges.eye_follow.prompts',
        durationSeconds: 20,
        icon: '👀',
        animation: 'rotate',
    },
    {
        id: 'water_check',
        type: 'water_reminder',
        titleKey: 'challenges.water_check.title',
        descriptionKey: 'challenges.water_check.prompts',
        durationSeconds: 10,
        icon: '💧',
        animation: 'bounce',
    },
    {
        id: 'stretch_now',
        type: 'stretch_prompt',
        titleKey: 'challenges.stretch_now.title',
        descriptionKey: 'challenges.stretch_now.prompts',
        durationSeconds: 30,
        icon: '🙆',
        animation: 'pulse',
    },
    {
        id: 'deep_breath',
        type: 'deep_breath',
        titleKey: 'challenges.deep_breath.title',
        descriptionKey: 'challenges.deep_breath.prompts',
        durationSeconds: 15,
        icon: '🧘',
        animation: 'pulse',
    },
];
