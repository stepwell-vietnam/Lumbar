export interface DailyStats {
    date: string; // YYYY-MM-DD
    breaksCompleted: number;
    breaksMissed: number;
    snoozeCount: number;
    totalWorkMinutes: number;
    totalBreakMinutes: number;
}

export interface WeeklyStats {
    weekStart: string; // YYYY-MM-DD (Monday)
    days: DailyStats[];
    totalBreaks: number;
    avgBreaksPerDay: number;
    streak: number;
}

export interface AllTimeStats {
    totalBreaks: number;
    totalSnoozes: number;
    currentStreak: number;
    longestStreak: number;
    totalWorkHours: number;
    firstUseDate: string;
}

export interface Achievement {
    id: string;
    titleKey: string;
    descriptionKey: string;
    icon: string;
    unlockedAt: string | null; // null = locked
    progress: number; // 0-100
    target: number;
}
