# M10: GAMIFICATION - STATS & ACHIEVEMENTS - Task File for MISA

> **Module:** M10 - Gamification (Stats & Achievements)  
> **Phase:** Phase 3: Gamification  
> **Priority:** P3 (Future Enhancement)  
> **Estimated Time:** 3-4 ngày

---

## 🎯 MỤC TIÊU

Xây dựng hệ thống thống kê và gamification để tăng động lực cho người dùng:
- Daily/Weekly streak tracking
- Break statistics (today, week, all-time)
- Achievement badges
- Stats Dashboard UI

---

## 📊 FEATURES (từ PRD)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F12.1 | Daily streak | Chuỗi ngày tuân thủ liên tiếp |
| F12.2 | Weekly report | Biểu đồ tuần làm việc/nghỉ |
| F12.3 | Break counter | Tổng số lần nghỉ |
| F12.4 | Achievements | Huy hiệu thành tựu |

---

## 📋 CHECKLIST (12 TASKS)

### Task 1: Stats Data Types [TypeScript]

**File:** `src/types/stats.ts`

```typescript
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
```

---

### Task 2: Stats Store [Frontend State]

**File:** `src/stores/statsStore.ts`

```typescript
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { DailyStats, WeeklyStats, AllTimeStats, Achievement } from '../types/stats';

interface StatsState {
    todayStats: DailyStats | null;
    weeklyStats: WeeklyStats | null;
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

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

export const useStatsStore = create<StatsState>((set, get) => ({
    todayStats: null,
    weeklyStats: null,
    allTimeStats: null,
    achievements: [],
    isLoading: false,
    
    initialize: async () => {
        set({ isLoading: true });
        await get().refreshStats();
        await get().checkAchievements();
        set({ isLoading: false });
    },
    
    recordBreakCompleted: async () => {
        if (isTauri) {
            await invoke('stats_record_break', { completed: true });
        }
        await get().refreshStats();
        await get().checkAchievements();
    },
    
    recordBreakMissed: async () => {
        if (isTauri) {
            await invoke('stats_record_break', { completed: false });
        }
        await get().refreshStats();
    },
    
    recordSnooze: async () => {
        if (isTauri) {
            await invoke('stats_record_snooze');
        }
        // Update local state
        const today = get().todayStats;
        if (today) {
            set({
                todayStats: {
                    ...today,
                    snoozeCount: today.snoozeCount + 1
                }
            });
        }
    },
    
    refreshStats: async () => {
        if (isTauri) {
            try {
                const [today, weekly, allTime] = await Promise.all([
                    invoke<DailyStats>('stats_get_today'),
                    invoke<WeeklyStats>('stats_get_weekly'),
                    invoke<AllTimeStats>('stats_get_all_time'),
                ]);
                set({ todayStats: today, weeklyStats: weekly, allTimeStats: allTime });
            } catch (error) {
                console.error('Failed to refresh stats:', error);
            }
        } else {
            // Browser mock
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
                }
            });
        }
    },
    
    checkAchievements: async () => {
        if (isTauri) {
            const achievements = await invoke<Achievement[]>('stats_get_achievements');
            set({ achievements });
            return achievements;
        }
        return [];
    },
}));
```

---

### Task 3: Achievements Data [Frontend Data]

**File:** `src/data/achievements.ts`

```typescript
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
```

---

### Task 4: Achievements i18n [i18n]

**Update:** `src/locales/vi.json`

```json
{
  "achievements": {
    "title": "🏆 Thành tựu",
    "locked": "Chưa mở khóa",
    "streak_3": {
      "title": "Bắt đầu tốt!",
      "description": "Duy trì streak 3 ngày"
    },
    "streak_7": {
      "title": "Một tuần hoàn hảo",
      "description": "Duy trì streak 7 ngày"
    },
    "streak_30": {
      "title": "Thói quen bền vững",
      "description": "Duy trì streak 30 ngày"
    },
    "breaks_10": {
      "title": "Khởi động",
      "description": "Hoàn thành 10 lần nghỉ"
    },
    "breaks_50": {
      "title": "Chăm chỉ",
      "description": "Hoàn thành 50 lần nghỉ"
    },
    "breaks_100": {
      "title": "Century Club",
      "description": "Hoàn thành 100 lần nghỉ"
    },
    "breaks_500": {
      "title": "Huyền thoại",
      "description": "Hoàn thành 500 lần nghỉ"
    },
    "no_snooze_day": {
      "title": "Kỷ luật thép",
      "description": "Một ngày không snooze"
    },
    "early_bird": {
      "title": "Dậy sớm",
      "description": "Nghỉ ngơi trước 8h sáng"
    }
  },
  "stats": {
    "title": "📊 Thống kê",
    "today": "Hôm nay",
    "this_week": "Tuần này",
    "all_time": "Tổng cộng",
    "breaks_completed": "Lần nghỉ",
    "snoozes": "Lần hoãn",
    "current_streak": "Streak hiện tại",
    "longest_streak": "Streak dài nhất",
    "work_hours": "Giờ làm việc",
    "days": "ngày"
  }
}
```

**Update:** `src/locales/en.json`

```json
{
  "achievements": {
    "title": "🏆 Achievements",
    "locked": "Locked",
    "streak_3": {
      "title": "Good Start!",
      "description": "Maintain a 3-day streak"
    },
    "streak_7": {
      "title": "Perfect Week",
      "description": "Maintain a 7-day streak"
    },
    "streak_30": {
      "title": "Habit Master",
      "description": "Maintain a 30-day streak"
    },
    "breaks_10": {
      "title": "Getting Started",
      "description": "Complete 10 breaks"
    },
    "breaks_50": {
      "title": "Dedicated",
      "description": "Complete 50 breaks"
    },
    "breaks_100": {
      "title": "Century Club",
      "description": "Complete 100 breaks"
    },
    "breaks_500": {
      "title": "Legend",
      "description": "Complete 500 breaks"
    },
    "no_snooze_day": {
      "title": "Iron Will",
      "description": "A day without snoozing"
    },
    "early_bird": {
      "title": "Early Bird",
      "description": "Take a break before 8 AM"
    }
  },
  "stats": {
    "title": "📊 Statistics",
    "today": "Today",
    "this_week": "This Week",
    "all_time": "All Time",
    "breaks_completed": "Breaks",
    "snoozes": "Snoozes",
    "current_streak": "Current Streak",
    "longest_streak": "Longest Streak",
    "work_hours": "Work Hours",
    "days": "days"
  }
}
```

---

### Task 5: Stats Card Component [Frontend UI]

**File:** `src/components/Stats/StatsCard.tsx`

```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    icon: string;
    label: string;
    value: string | number;
    subValue?: string;
    color?: 'orange' | 'teal' | 'purple' | 'gray';
}

export const StatsCard: FC<StatsCardProps> = ({
    icon,
    label,
    value,
    subValue,
    color = 'gray'
}) => {
    const colorClasses = {
        orange: 'bg-orange-100 text-orange-600',
        teal: 'bg-teal-100 text-teal-600',
        purple: 'bg-purple-100 text-purple-600',
        gray: 'bg-gray-100 text-gray-600',
    };
    
    return (
        <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm"
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-xl font-bold text-gray-800">{value}</p>
                    {subValue && (
                        <p className="text-xs text-gray-400">{subValue}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
```

---

### Task 6: Streak Display Component [Frontend UI]

**File:** `src/components/Stats/StreakDisplay.tsx`

```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';

interface StreakDisplayProps {
    currentStreak: number;
    longestStreak: number;
}

export const StreakDisplay: FC<StreakDisplayProps> = ({
    currentStreak,
    longestStreak
}) => {
    const { t } = useTranslation();
    
    // Generate flame icons based on streak
    const getFlames = (count: number) => {
        if (count >= 30) return '🔥🔥🔥';
        if (count >= 7) return '🔥🔥';
        if (count >= 3) return '🔥';
        return '✨';
    };
    
    return (
        <motion.div
            className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm">{t('stats.current_streak')}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{currentStreak}</span>
                        <span className="text-lg">{t('stats.days')}</span>
                    </div>
                </div>
                <div className="text-4xl">
                    {getFlames(currentStreak)}
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/60 text-xs">
                    {t('stats.longest_streak')}: {longestStreak} {t('stats.days')}
                </p>
            </div>
        </motion.div>
    );
};
```

---

### Task 7: Achievement Badge Component [Frontend UI]

**File:** `src/components/Stats/AchievementBadge.tsx`

```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { Achievement } from '../../types/stats';

interface AchievementBadgeProps {
    achievement: Achievement;
    showProgress?: boolean;
}

export const AchievementBadge: FC<AchievementBadgeProps> = ({
    achievement,
    showProgress = true
}) => {
    const { t } = useTranslation();
    const isUnlocked = achievement.unlockedAt !== null;
    
    return (
        <motion.div
            className={`
                relative rounded-xl p-4 border transition-all
                ${isUnlocked 
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-300' 
                    : 'bg-gray-100 border-gray-200 opacity-60'}
            `}
            whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
        >
            {/* Icon */}
            <div className="text-center mb-2">
                <span className={`text-3xl ${!isUnlocked && 'grayscale'}`}>
                    {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 mx-auto text-gray-400" />}
                </span>
            </div>
            
            {/* Title */}
            <p className={`text-sm font-semibold text-center ${isUnlocked ? 'text-amber-800' : 'text-gray-500'}`}>
                {t(achievement.titleKey)}
            </p>
            
            {/* Description */}
            <p className="text-xs text-center text-gray-500 mt-1">
                {t(achievement.descriptionKey)}
            </p>
            
            {/* Progress bar (for locked) */}
            {!isUnlocked && showProgress && (
                <div className="mt-3">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${achievement.progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1">
                        {Math.round(achievement.progress)}%
                    </p>
                </div>
            )}
            
            {/* Unlocked date */}
            {isUnlocked && achievement.unlockedAt && (
                <p className="text-xs text-amber-600 text-center mt-2">
                    ✓ {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
            )}
        </motion.div>
    );
};
```

---

### Task 8: Stats Dashboard Screen [Frontend UI]

**File:** `src/screens/Stats/StatsScreen.tsx`

```typescript
import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, TrendingUp, Calendar, Award } from 'lucide-react';
import { useStatsStore } from '../../stores/statsStore';
import { StatsCard } from '../../components/Stats/StatsCard';
import { StreakDisplay } from '../../components/Stats/StreakDisplay';
import { AchievementBadge } from '../../components/Stats/AchievementBadge';

interface StatsScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StatsScreen: FC<StatsScreenProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { 
        todayStats, 
        allTimeStats, 
        achievements, 
        isLoading, 
        initialize 
    } = useStatsStore();
    
    useEffect(() => {
        if (isOpen) {
            initialize();
        }
    }, [isOpen, initialize]);
    
    if (!isOpen) return null;
    
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">
                        {t('stats.title')}
                    </h1>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 space-y-6">
                    {/* Streak Section */}
                    <StreakDisplay
                        currentStreak={allTimeStats?.currentStreak ?? 0}
                        longestStreak={allTimeStats?.longestStreak ?? 0}
                    />
                    
                    {/* Today Stats */}
                    <section>
                        <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {t('stats.today')}
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <StatsCard
                                icon="☕"
                                label={t('stats.breaks_completed')}
                                value={todayStats?.breaksCompleted ?? 0}
                                color="teal"
                            />
                            <StatsCard
                                icon="⏸️"
                                label={t('stats.snoozes')}
                                value={todayStats?.snoozeCount ?? 0}
                                color="orange"
                            />
                        </div>
                    </section>
                    
                    {/* All Time Stats */}
                    <section>
                        <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            {t('stats.all_time')}
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <StatsCard
                                icon="🎯"
                                label={t('stats.breaks_completed')}
                                value={allTimeStats?.totalBreaks ?? 0}
                                color="purple"
                            />
                            <StatsCard
                                icon="⏱️"
                                label={t('stats.work_hours')}
                                value={allTimeStats?.totalWorkHours ?? 0}
                                subValue="hours"
                                color="gray"
                            />
                        </div>
                    </section>
                    
                    {/* Achievements */}
                    <section>
                        <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {t('achievements.title')}
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {achievements.map(achievement => (
                                <AchievementBadge
                                    key={achievement.id}
                                    achievement={achievement}
                                    showProgress
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </motion.div>
        </motion.div>
    );
};
```

---

### Task 9: Export Stats Components [Frontend]

**File:** `src/components/Stats/index.ts`

```typescript
export { StatsCard } from './StatsCard';
export { StreakDisplay } from './StreakDisplay';
export { AchievementBadge } from './AchievementBadge';
```

**File:** `src/screens/Stats/index.ts`

```typescript
export { StatsScreen } from './StatsScreen';
```

---

### Task 10: Backend Stats Commands [Rust] (Optional)

**File:** `src-tauri/src/commands/stats_commands.rs`

```rust
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DailyStats {
    pub date: String,
    pub breaks_completed: u32,
    pub breaks_missed: u32,
    pub snooze_count: u32,
    pub total_work_minutes: u32,
    pub total_break_minutes: u32,
}

#[command]
pub async fn stats_get_today() -> Result<DailyStats, String> {
    // TODO: Load from store
    Ok(DailyStats {
        date: chrono::Local::now().format("%Y-%m-%d").to_string(),
        breaks_completed: 5,
        breaks_missed: 1,
        snooze_count: 2,
        total_work_minutes: 180,
        total_break_minutes: 15,
    })
}

#[command]
pub async fn stats_record_break(completed: bool) -> Result<(), String> {
    // TODO: Update store
    Ok(())
}

#[command]
pub async fn stats_record_snooze() -> Result<(), String> {
    // TODO: Update store
    Ok(())
}
```

---

### Task 11: Add Stats Button to Dashboard [Frontend]

**Update:** `src/screens/Dashboard/Dashboard.tsx`

Thêm nút mở Stats screen:

```typescript
import { BarChart2 } from 'lucide-react';
import { StatsScreen } from '../Stats';

// Add state:
const [isStatsOpen, setIsStatsOpen] = useState(false);

// Add button in header:
<button
    onClick={() => setIsStatsOpen(true)}
    className="p-2 hover:bg-gray-200/50 rounded-lg"
    title={t('stats.title')}
>
    <BarChart2 className="w-5 h-5 text-gray-600" />
</button>

// Add screen:
<StatsScreen
    isOpen={isStatsOpen}
    onClose={() => setIsStatsOpen(false)}
/>
```

---

### Task 12: Testing & Verification

**Test Scenarios:**

1. **Stats Display Test:**
   - [ ] Mở Stats screen từ Dashboard
   - [ ] Streak hiển thị đúng
   - [ ] Today stats hiển thị đúng
   - [ ] All-time stats hiển thị đúng

2. **Achievement Test:**
   - [ ] Locked achievements hiển thị với lock icon
   - [ ] Unlocked achievements hiển thị với emoji icon
   - [ ] Progress bar hiển thị cho locked achievements

3. **i18n Test:**
   - [ ] Chuyển VI → EN → Tất cả text thay đổi

4. **Responsive Test:**
   - [ ] Stats screen hiển thị đúng trên 380x340

---

## 📁 FILES TO CREATE/MODIFY

### New Files:
```
src/
├── types/
│   └── stats.ts                    [NEW]
├── data/
│   └── achievements.ts             [NEW]
├── stores/
│   └── statsStore.ts               [NEW]
├── components/
│   └── Stats/
│       ├── StatsCard.tsx           [NEW]
│       ├── StreakDisplay.tsx       [NEW]
│       ├── AchievementBadge.tsx    [NEW]
│       └── index.ts                [NEW]
└── screens/
    └── Stats/
        ├── StatsScreen.tsx         [NEW]
        └── index.ts                [NEW]
```

### Modify Files:
```
src/
├── locales/
│   ├── vi.json     [MODIFY - add stats/achievements]
│   └── en.json     [MODIFY - add stats/achievements]
└── screens/
    └── Dashboard/
        └── Dashboard.tsx   [MODIFY - add stats button]
```

---

## ⚠️ NOTES FOR MISA

1. **Phase 3 feature** - Đây là tính năng nâng cao, không cần hoàn hảo ngay
2. **Mock data first** - Sử dụng browser mock trước, backend sau
3. **Small window** - Stats screen phải fit trong 380x340
4. **Streak logic** - Streak reset nếu user miss một ngày

---

## ✅ COMPLETION CRITERIA

- [ ] Stats Dashboard hiển thị đúng
- [ ] Streak display với flame icons
- [ ] 3+ stats cards hoạt động
- [ ] 5+ achievement badges
- [ ] Progress bar cho locked achievements
- [ ] i18n đầy đủ VI/EN
- [ ] Button mở Stats từ Dashboard
- [ ] Không có console errors

---

*Created by LUMB for MISA - 2026-01-30*
