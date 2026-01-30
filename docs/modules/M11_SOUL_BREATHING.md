# M11: SOUL BREATHING - CÁ NHÂN HÓA & COPYWRITING

> **Mục tiêu:** Biến Lumbar từ "ứng dụng nhắc nhở" thành "người bạn thực sự"  
> **Phong cách:** Passive-aggressive Duolingo - "Vừa đấm vừa xoa"  
> **Priority:** P1 - Core Personality  
> **Estimated:** 15 tasks

---

## 📋 TỔNG QUAN FEATURES

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | **Relationship Levels** | Nội dung tiến hóa theo thái độ user |
| 2 | **Time Context** | Nhắc nhở theo thời gian trong ngày |
| 3 | **Mascot Challenges** | Mini-games và nhiệm vụ gamified |
| 4 | **Deep Personalization** | Sử dụng data từ hệ thống |
| 5 | **Speech Bubbles UI** | UI bong bóng lời thoại từ Mascot |

---

## 🎭 FEATURE 1: RELATIONSHIP LEVELS

### Cấp độ quan hệ:

| Level | ID | Trigger | Màu | Mascot State |
|-------|-----|---------|-----|--------------|
| 🌟 **Thiên thần** | `angel` | Nghỉ đúng giờ 3 lần liên tiếp | Gold | Super Happy |
| ⚠️ **Cảnh báo** | `warning` | Snooze lần 1 | Orange | Neutral |
| 😈 **Phản diện** | `villain` | Snooze > 3 lần | Red | Angry |
| 🤝 **Hòa giải** | `reconcile` | Quay lại sau nghỉ | Green | Happy |
| 😴 **Ngủ đông** | `dormant` | Idle > 5 phút | Gray | Sleeping |

---

### Task 1: Relationship Types

**File:** `src/types/relationship.ts`

```typescript
export type RelationshipLevel = 'angel' | 'warning' | 'villain' | 'reconcile' | 'dormant';

export interface RelationshipState {
    currentLevel: RelationshipLevel;
    consecutiveBreaks: number;       // Số lần nghỉ đúng giờ liên tiếp
    consecutiveSnoozes: number;      // Số lần snooze liên tiếp trong ngày
    totalBreaksToday: number;        // Tổng số lần nghỉ hôm nay
    lastBreakTime: string | null;    // Timestamp lần nghỉ cuối
    moodHistory: RelationshipLevel[]; // Lịch sử mood (max 5)
}

export interface TimeContext {
    period: 'early_morning' | 'morning' | 'post_lunch' | 'afternoon' | 'evening' | 'late_night';
    hour: number;
}

export const TIME_PERIODS = {
    early_morning: { start: 6, end: 8 },   // 6h - 8h
    morning: { start: 8, end: 12 },        // 8h - 12h
    post_lunch: { start: 13, end: 14 },    // 13h - 14h (sau ăn trưa)
    afternoon: { start: 14, end: 17 },     // 14h - 17h
    evening: { start: 17, end: 22 },       // 17h - 22h
    late_night: { start: 22, end: 6 },     // 22h - 6h
};
```

---

### Task 2: Relationship Store

**File:** `src/stores/relationshipStore.ts`

```typescript
import { create } from 'zustand';
import { RelationshipLevel, RelationshipState, TimeContext, TIME_PERIODS } from '../types/relationship';

interface RelationshipStore extends RelationshipState {
    // Actions
    recordBreakCompleted: () => void;  // Gọi khi user nghỉ đúng giờ
    recordSnooze: () => void;          // Gọi khi user snooze
    recordReturn: () => void;          // Gọi khi user quay lại từ nghỉ
    setIdle: () => void;               // Gọi khi user idle
    resetDaily: () => void;            // Reset mỗi ngày mới
    
    // Getters
    getTimeContext: () => TimeContext;
    getCurrentLevel: () => RelationshipLevel;
    getMessageContext: () => MessageContext;
}

interface MessageContext {
    level: RelationshipLevel;
    timeContext: TimeContext;
    streak: number;
    consecutiveSnoozes: number;
    workMinutes: number;  // Từ timer
}

export const useRelationshipStore = create<RelationshipStore>((set, get) => ({
    currentLevel: 'warning',
    consecutiveBreaks: 0,
    consecutiveSnoozes: 0,
    totalBreaksToday: 0,
    lastBreakTime: null,
    moodHistory: [],
    
    recordBreakCompleted: () => {
        const { consecutiveBreaks, consecutiveSnoozes, moodHistory } = get();
        const newConsecutive = consecutiveBreaks + 1;
        
        let newLevel: RelationshipLevel = 'reconcile';
        if (newConsecutive >= 3) newLevel = 'angel';
        
        set({
            consecutiveBreaks: newConsecutive,
            consecutiveSnoozes: 0,  // Reset snooze count
            totalBreaksToday: get().totalBreaksToday + 1,
            currentLevel: newLevel,
            lastBreakTime: new Date().toISOString(),
            moodHistory: [...moodHistory.slice(-4), newLevel],
        });
    },
    
    recordSnooze: () => {
        const { consecutiveSnoozes, moodHistory } = get();
        const newSnoozeCount = consecutiveSnoozes + 1;
        
        let newLevel: RelationshipLevel = 'warning';
        if (newSnoozeCount >= 3) newLevel = 'villain';
        
        set({
            consecutiveSnoozes: newSnoozeCount,
            consecutiveBreaks: 0,  // Reset break streak
            currentLevel: newLevel,
            moodHistory: [...moodHistory.slice(-4), newLevel],
        });
    },
    
    recordReturn: () => {
        set({
            currentLevel: 'reconcile',
            moodHistory: [...get().moodHistory.slice(-4), 'reconcile'],
        });
    },
    
    setIdle: () => set({ currentLevel: 'dormant' }),
    
    resetDaily: () => set({
        consecutiveBreaks: 0,
        consecutiveSnoozes: 0,
        totalBreaksToday: 0,
        lastBreakTime: null,
        currentLevel: 'warning',
        moodHistory: [],
    }),
    
    getTimeContext: () => {
        const hour = new Date().getHours();
        for (const [period, range] of Object.entries(TIME_PERIODS)) {
            if (range.start <= hour && hour < range.end) {
                return { period: period as TimeContext['period'], hour };
            }
            // Special case for late_night crossing midnight
            if (range.start > range.end) {
                if (hour >= range.start || hour < range.end) {
                    return { period: period as TimeContext['period'], hour };
                }
            }
        }
        return { period: 'morning', hour };
    },
    
    getCurrentLevel: () => get().currentLevel,
    
    getMessageContext: () => ({
        level: get().currentLevel,
        timeContext: get().getTimeContext(),
        streak: get().consecutiveBreaks,
        consecutiveSnoozes: get().consecutiveSnoozes,
        workMinutes: 0, // Will be filled from timerStore
    }),
}));
```

---

## 🕐 FEATURE 2: TIME-BASED CONTENT

### Task 3: i18n Time Messages

**Thêm vào `src/locales/vi.json`:**

```json
{
    "time_messages": {
        "early_morning": {
            "greeting": "Khởi động ngày mới thôi!",
            "break_prompt": "Đừng để deadline nuốt chửng bạn ngay từ sáng thế chứ.",
            "tip": "Uống một ly nước ấm để khởi động cơ thể nào!"
        },
        "morning": {
            "greeting": "Chào buổi sáng!",
            "break_prompt": "20 phút rồi đấy, mắt bạn đang cần một giây nghỉ ngơi.",
            "tip": "Nhìn ra cửa sổ một chút đi!"
        },
        "post_lunch": {
            "greeting": "Mới ăn xong hả?",
            "break_prompt": "Mắt đang lim dim đúng không? Đứng dậy vươn vai một cái cho tỉnh táo nào!",
            "tip": "Đi dạo một vòng quanh phòng để tiêu hóa tốt hơn."
        },
        "afternoon": {
            "greeting": "Chiều rồi!",
            "break_prompt": "Deadline là nhất, cột sống là nhì. Bạn chọn cái nào?",
            "tip": "Uống nước đi, đừng để cơ thể khát mới uống."
        },
        "evening": {
            "greeting": "Sắp hết ngày rồi!",
            "break_prompt": "Về nhà thôi bạn ơi! Cái máy tính này không biết nhớ bạn đâu, nhưng người thân thì có đấy.",
            "tip": "Thu dọn bàn làm việc để sáng mai tinh thần hơn."
        },
        "late_night": {
            "greeting": "Cú đêm à?",
            "break_prompt": "Cẩn thận không là mắt thành gấu trúc đấy! Lumby đi ngủ trước đây!",
            "tip": "Tắt đèn xanh màn hình, mắt sẽ đỡ mỏi hơn."
        }
    }
}
```

**Thêm vào `src/locales/en.json`:**

```json
{
    "time_messages": {
        "early_morning": {
            "greeting": "Good morning, early bird!",
            "break_prompt": "Don't let deadlines consume you this early!",
            "tip": "Start with a warm glass of water!"
        },
        "morning": {
            "greeting": "Morning!",
            "break_prompt": "It's been 20 minutes, your eyes need a quick rest.",
            "tip": "Look out the window for a bit!"
        },
        "post_lunch": {
            "greeting": "Just had lunch?",
            "break_prompt": "Feeling sleepy? Stand up and stretch to wake up!",
            "tip": "Take a short walk to help digestion."
        },
        "afternoon": {
            "greeting": "Afternoon!",
            "break_prompt": "Deadline is priority, spine is second. Which do you choose?",
            "tip": "Drink water, don't wait until you're thirsty."
        },
        "evening": {
            "greeting": "Almost done for the day!",
            "break_prompt": "Go home! Your computer won't miss you, but your loved ones will.",
            "tip": "Tidy up your desk for a fresher start tomorrow."
        },
        "late_night": {
            "greeting": "Night owl, huh?",
            "break_prompt": "Watch out or you'll have panda eyes! Lumby is heading to bed!",
            "tip": "Turn on blue light filter to protect your eyes."
        }
    }
}
```

---

## 🎮 FEATURE 3: MASCOT CHALLENGES

### Task 4: Challenge Types

**File:** `src/types/challenges.ts`

```typescript
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
        descriptionKey: 'challenges.eye_follow.description',
        durationSeconds: 20,
        icon: '👀',
        animation: 'rotate',
    },
    {
        id: 'water_check',
        type: 'water_reminder',
        titleKey: 'challenges.water_check.title',
        descriptionKey: 'challenges.water_check.description',
        durationSeconds: 10,
        icon: '💧',
        animation: 'bounce',
    },
    {
        id: 'stretch_now',
        type: 'stretch_prompt',
        titleKey: 'challenges.stretch_now.title',
        descriptionKey: 'challenges.stretch_now.description',
        durationSeconds: 30,
        icon: '🙆',
        animation: 'pulse',
    },
    {
        id: 'deep_breath',
        type: 'deep_breath',
        titleKey: 'challenges.deep_breath.title',
        descriptionKey: 'challenges.deep_breath.description',
        durationSeconds: 15,
        icon: '🧘',
        animation: 'pulse',
    },
];
```

### Task 5: i18n Challenges

**Thêm vào `vi.json`:**

```json
{
    "challenges": {
        "eye_follow": {
            "title": "Thử thách đảo mắt!",
            "description": "Nhìn theo con trỏ chuột của tôi nào! Di chuyển mắt theo để thư giãn."
        },
        "water_check": {
            "title": "Kiểm tra nước!",
            "description": "Chụp một bức ảnh ly nước của bạn gửi cho tôi xem nào! (Đùa thôi, nhưng uống nước đi nhé!)"
        },
        "stretch_now": {
            "title": "Vươn vai ngay!",
            "description": "Đứng dậy, giơ tay lên cao, và vươn người thật mạnh! 3... 2... 1..."
        },
        "deep_breath": {
            "title": "Hít thở sâu",
            "description": "Hít vào 4 giây... Giữ 4 giây... Thở ra 4 giây..."
        }
    }
}
```

---

## 💬 FEATURE 4: RELATIONSHIP-BASED MESSAGES

### Task 6: i18n Relationship Messages

**Thêm vào `vi.json`:**

```json
{
    "relationship": {
        "angel": {
            "messages": [
                "Ôi, ai mà có kỷ luật thép thế này? Thưởng cho bạn một tràng pháo tay (và một ly nước)! 🎉",
                "Bạn là ngôi sao của Lumby đấy! Tiếp tục phát huy nhé! ⭐",
                "3 lần liên tiếp! Bạn đang trở thành huyền thoại rồi đó! 🏆",
                "Cột sống bạn đang hát ca vui sướng! 🎵",
                "Ai đó xứng đáng được nghỉ ngơi... chính là bạn đấy! 💕"
            ],
            "emoji": "😇"
        },
        "warning": {
            "messages": [
                "Tôi thấy rồi nhé. 5 phút nữa mà không đứng dậy là tôi dỗi đấy. 😤",
                "Bạn đang đùa với lửa (và với lưng) đấy...",
                "Một snooze thôi nhé, lần sau tôi không nhẹ tay đâu!",
                "Hmm, bạn biết tôi đang nhìn không? 👀",
                "5 phút à? Được rồi, nhưng tôi sẽ nhớ mãi lần này..."
            ],
            "emoji": "😐"
        },
        "villain": {
            "messages": [
                "Bạn định hóa thạch trên cái ghế này luôn à? Để tôi đặt lịch khám cột sống hộ bạn nhé. 💀",
                "Thôi kệ bạn! Tự chịu trách nhiệm với đôi mắt thâm quầng nhé!",
                "Nếu bạn không đứng dậy, tôi sẽ bắt đầu nhảy múa che hết đống code này đấy! 💃",
                "Mắt bạn đang gửi tín hiệu SOS đấy, bạn có nghe thấy không?",
                "Còn snooze nữa là tôi kể với HR đấy! 📞"
            ],
            "emoji": "😈"
        },
        "reconcile": {
            "messages": [
                "Chào mừng trở lại! Mắt sáng hơn rồi đúng không? Làm việc tiếp thôi! 🌟",
                "Đấy, nghỉ một chút có sao đâu nào! Bạn làm tốt lắm! 💪",
                "Tôi tha thứ cho bạn rồi! (Nhưng lần sau đừng snooze nhiều quá nhé)",
                "Wow, bạn quay lại thật rồi! Lumby vui quá! 🎉",
                "Thấy chưa, nghỉ một chút là tỉnh táo hẳn!"
            ],
            "emoji": "🤗"
        },
        "dormant": {
            "messages": [
                "Zzz... Lumby cũng đi ngủ đây... Zzz...",
                "(Ngáp) Wake me up when you're back...",
                "💤 ...hzzz... deadline... hzzz... coffee...",
                "Tôi đang mơ thấy bạn làm việc... chờ, bạn đâu rồi?",
                "Idle mode activated. Lumby sleeping... 😴"
            ],
            "emoji": "😴"
        }
    }
}
```

---

### Task 7: Guilt-Trip Button Texts

**Thêm vào `vi.json`:**

```json
{
    "guilt_buttons": {
        "skip": {
            "text": "Tôi chấp nhận đau lưng",
            "mascot_reaction": "💀 Ôi không... Lumby buồn quá...",
            "mascot_state": "sad"
        },
        "continue_work": {
            "text": "Mắt tôi không quan trọng",
            "mascot_reaction": "😢 Bạn nói thật à?!",
            "mascot_state": "sad"
        },
        "snooze_aggressive": {
            "text": "Kệ tôi thêm {{minutes}} phút...",
            "mascot_reaction": "😤 Tôi ghi nhớ rồi đấy!",
            "mascot_state": "angry"
        },
        "take_break_positive": {
            "text": "Cứu lấy đôi mắt này 👀",
            "mascot_reaction": "🎉 Tuyệt vời! Bạn là người tốt!",
            "mascot_state": "happy"
        }
    }
}
```

---

## 🎨 FEATURE 5: SPEECH BUBBLES UI

### Task 8: SpeechBubble Component

**File:** `src/components/Mascot/SpeechBubble.tsx`

```typescript
import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
    message: string;
    isVisible: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    variant?: 'normal' | 'angry' | 'happy' | 'sad';
}

export const SpeechBubble: FC<SpeechBubbleProps> = ({
    message,
    isVisible,
    position = 'top',
    variant = 'normal',
}) => {
    const variantColors = {
        normal: 'bg-white border-gray-200',
        angry: 'bg-red-50 border-red-200',
        happy: 'bg-green-50 border-green-200',
        sad: 'bg-blue-50 border-blue-200',
    };

    const positionClasses = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };

    const tailClasses = {
        top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45',
        bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
        left: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rotate-45',
        right: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`absolute ${positionClasses[position]} z-50`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <div className={`relative px-4 py-2 rounded-xl border shadow-lg ${variantColors[variant]} max-w-[200px]`}>
                        <p className="text-sm text-gray-800 font-medium">{message}</p>
                        
                        {/* Bubble tail */}
                        <div 
                            className={`absolute w-3 h-3 ${variantColors[variant]} border ${tailClasses[position]}`}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
```

---

### Task 9: Enhanced Mascot with Speech

**Cập nhật:** `src/components/Mascot/Mascot.tsx`

Thêm integration với SpeechBubble:

```typescript
// Import thêm
import { SpeechBubble } from './SpeechBubble';
import { useRelationshipStore } from '../../stores/relationshipStore';

// Trong component
const { currentLevel, getTimeContext } = useRelationshipStore();

// Message sẽ được lấy từ relationship + time context
const getContextualMessage = () => {
    const time = getTimeContext();
    // Logic lấy message phù hợp với level + time
    return t(`relationship.${currentLevel}.messages`);
};
```

---

### Task 10: Contextual Message Helper

**File:** `src/utils/messageHelper.ts`

```typescript
import i18n from 'i18next';
import { RelationshipLevel, TimeContext } from '../types/relationship';

interface MessageContext {
    level: RelationshipLevel;
    timeContext: TimeContext;
    streak: number;
    consecutiveSnoozes: number;
    workMinutes: number;
}

export const getContextualMessage = (context: MessageContext): string => {
    const { level, timeContext, streak, workMinutes } = context;
    
    // 1. Priority: Streak-based messages
    if (streak >= 7) {
        return i18n.t('relationship.streak_messages.week', { days: streak });
    }
    
    // 2. Work intensity messages
    if (workMinutes >= 45) {
        return i18n.t('relationship.intensity_messages.long_session', { minutes: workMinutes });
    }
    
    // 3. Time-based messages
    const timeMessages = i18n.t(`time_messages.${timeContext.period}`, { returnObjects: true });
    if (timeMessages && Math.random() > 0.5) {
        return timeMessages.break_prompt;
    }
    
    // 4. Fallback: Relationship level messages
    const levelMessages = i18n.t(`relationship.${level}.messages`, { returnObjects: true }) as string[];
    if (Array.isArray(levelMessages) && levelMessages.length > 0) {
        return levelMessages[Math.floor(Math.random() * levelMessages.length)];
    }
    
    return i18n.t('mascot.neutral.messages.0');
};

export const getButtonText = (action: 'skip' | 'snooze' | 'take_break', context: MessageContext): string => {
    const { level } = context;
    
    if (level === 'villain' && action === 'skip') {
        return i18n.t('guilt_buttons.skip.text');
    }
    
    if (action === 'take_break') {
        return i18n.t('guilt_buttons.take_break_positive.text');
    }
    
    return i18n.t(`snooze.${action}`);
};
```

---

### Task 11: Streak-based Messages

**Thêm vào `vi.json`:**

```json
{
    "relationship": {
        "streak_messages": {
            "week": "Bạn đã duy trì thói quen nghỉ ngơi được {{days}} ngày rồi. Đừng để con số này quay về 0 chỉ vì 5 phút làm cố nhé!",
            "month": "30 ngày liên tiếp! Bạn là huyền thoại! 🏆",
            "broken": "Ôi không, streak bị reset rồi! Bắt đầu lại thôi! 💪"
        },
        "intensity_messages": {
            "long_session": "Bạn đã gõ phím liên tục {{minutes}} phút rồi, đôi tay này xứng đáng được nghỉ ngơi một chút.",
            "very_long": "80 phút liên tục?! Bạn là máy hay là người vậy? 🤖"
        }
    }
}
```

---

### Task 12: Update BreakOverlay với Guilt Buttons

**Cập nhật:** `src/components/Overlay/BreakOverlay.tsx`

```typescript
// Thay thế các nút hiện tại với guilt buttons

const getSkipButtonText = (): string => {
    if (snoozeCount >= 3) {
        return t('guilt_buttons.skip.text');
    }
    return t('snooze.skip', { minutes: 5 });
};

const getTakeBreakText = (): string => {
    return t('guilt_buttons.take_break_positive.text'); // "Cứu lấy đôi mắt này 👀"
};

// Khi click Skip với guilt button
const handleGuiltSkip = () => {
    mascotStore.setSad();
    // Show mascot reaction
    setMascotReaction(t('guilt_buttons.skip.mascot_reaction'));
    setTimeout(() => {
        handleSnooze(5);
    }, 1500);
};
```

---

### Task 13: Integrate với Existing Stores

**Cập nhật `escalationStore.ts`:**

```typescript
// Import relationship store
import { useRelationshipStore } from './relationshipStore';

// Trong snooze function
snooze: async () => {
    const relationshipStore = useRelationshipStore.getState();
    relationshipStore.recordSnooze();
    // ... existing snooze logic
};

// Trong acknowledge function  
acknowledge: async () => {
    const relationshipStore = useRelationshipStore.getState();
    relationshipStore.recordBreakCompleted();
    // ... existing acknowledge logic
};
```

---

### Task 14: Daily Reset Logic

**Cập nhật `App.tsx`:**

```typescript
// Thêm daily reset check
useEffect(() => {
    const checkDayChange = () => {
        const lastDate = localStorage.getItem('lastActiveDate');
        const today = new Date().toDateString();
        
        if (lastDate !== today) {
            useRelationshipStore.getState().resetDaily();
            localStorage.setItem('lastActiveDate', today);
        }
    };
    
    checkDayChange();
    const interval = setInterval(checkDayChange, 60000); // Check mỗi phút
    
    return () => clearInterval(interval);
}, []);
```

---

### Task 15: Export và Index

**File:** `src/components/Mascot/index.ts`

```typescript
export { Mascot } from './Mascot';
export { SpeechBubble } from './SpeechBubble';
```

**File:** `src/types/index.ts`

```typescript
export * from './stats';
export * from './relationship';
export * from './challenges';
```

---

## 🧪 TESTING SCENARIOS

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Nghỉ đúng giờ 3 lần | Level → `angel`, messages vui vẻ |
| 2 | Snooze 1 lần | Level → `warning`, mascot neutral |
| 3 | Snooze 3+ lần | Level → `villain`, messages đe dọa |
| 4 | Quay lại sau nghỉ | Level → `reconcile`, chào mừng |
| 5 | Idle 5 phút | Level → `dormant`, Zzz animation |
| 6 | 8h sáng | Time context messages sáng sớm |
| 7 | 22h đêm | Time context messages cú đêm |
| 8 | Streak 7 ngày | Streak-based message |
| 9 | Click "Skip" với villain | Mascot reaction 💀 |
| 10 | Click "Cứu lấy đôi mắt này" | Mascot happy 🎉 |

---

## 📁 FILES SUMMARY

### New Files (9):
```
src/types/relationship.ts
src/types/challenges.ts
src/stores/relationshipStore.ts
src/components/Mascot/SpeechBubble.tsx
src/utils/messageHelper.ts
```

### Modified Files (6):
```
src/locales/vi.json (thêm 4 sections)
src/locales/en.json (thêm 4 sections)
src/components/Mascot/Mascot.tsx
src/components/Overlay/BreakOverlay.tsx
src/stores/escalationStore.ts
src/App.tsx
```

---

*Created by LUMB - 2026-01-30*
