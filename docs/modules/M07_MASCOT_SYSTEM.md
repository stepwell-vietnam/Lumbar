# M07: MASCOT SYSTEM - Task File for MISA

> **Module:** M07 - Mascot System  
> **Phase:** Phase 2: Personality & Polish  
> **Priority:** P1 (High)  
> **Estimated Time:** 3-4 ngày

---

## 🎯 MỤC TIÊU

Xây dựng hệ thống mascot động (Lumbar - Khúc gỗ dễ thương 🪵) với:
- 4 trạng thái cảm xúc (Happy, Sad, Angry, Sleeping)
- Animations cho mỗi trạng thái
- Tích hợp vào Dashboard và Break Overlay
- Dynamic messages theo context

---

## 📋 CHECKLIST (12 TASKS)

### Task 1: Mascot Assets [Frontend]

**File:** `src/assets/mascots/`

**Tạo hoặc tìm SVG/emoji cho 4 states:**

| State | Emoji | Trigger | Animation |
|-------|-------|---------|-----------|
| 😊 **Happy** | 🪵😊 | User nghỉ đúng giờ | Bounce, celebrate |
| 😢 **Sad** | 🪵😢 | User làm quá lâu | Droop, sigh |
| 😤 **Angry** | 🪵😤 | User spam snooze | Shake, huff |
| 😴 **Sleeping** | 🪵😴 | User idle | Z-z-z effect |

**MVP Approach:** Dùng emoji trước, sau này có thể thay bằng custom SVG.

---

### Task 2: Mascot Store [Frontend State]

**File:** `src/stores/mascotStore.ts`

```typescript
import { create } from 'zustand';

export type MascotState = 'happy' | 'sad' | 'angry' | 'sleeping' | 'neutral';

interface MascotStore {
    currentState: MascotState;
    previousState: MascotState;
    snoozeCount: number;
    
    // Actions
    setState: (state: MascotState) => void;
    setHappy: () => void;
    setSad: () => void;
    setAngry: () => void;
    setSleeping: () => void;
    resetSnoozeCount: () => void;
    incrementSnoozeCount: () => void;
    
    // Computed
    getMascotEmoji: () => string;
    getMascotMessage: () => string;
}

export const useMascotStore = create<MascotStore>((set, get) => ({
    currentState: 'neutral',
    previousState: 'neutral',
    snoozeCount: 0,
    
    setState: (state) => set((s) => ({ 
        previousState: s.currentState,
        currentState: state 
    })),
    
    setHappy: () => get().setState('happy'),
    setSad: () => get().setState('sad'),
    setAngry: () => get().setState('angry'),
    setSleeping: () => get().setState('sleeping'),
    
    resetSnoozeCount: () => set({ snoozeCount: 0 }),
    incrementSnoozeCount: () => {
        const count = get().snoozeCount + 1;
        set({ snoozeCount: count });
        
        // Auto update state based on snooze count
        if (count >= 3) {
            get().setAngry();
        } else if (count >= 1) {
            get().setSad();
        }
    },
    
    getMascotEmoji: () => {
        const state = get().currentState;
        const emojis: Record<MascotState, string> = {
            happy: '😊',
            sad: '😢',
            angry: '😤',
            sleeping: '😴',
            neutral: '😐',
        };
        return emojis[state];
    },
    
    getMascotMessage: () => {
        // Sẽ implement trong Task 5
        return '';
    },
}));
```

---

### Task 3: Mascot Component [Frontend UI]

**File:** `src/components/Mascot/Mascot.tsx`

```typescript
import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMascotStore } from '../../stores/mascotStore';

interface MascotProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showMessage?: boolean;
}

export const Mascot: FC<MascotProps> = ({ 
    size = 'md',
    showMessage = false 
}) => {
    const { currentState, getMascotEmoji } = useMascotStore();
    
    // Size mapping
    const sizeMap = {
        sm: 'text-4xl',   // 36px
        md: 'text-6xl',   // 60px
        lg: 'text-8xl',   // 96px
        xl: 'text-9xl',   // 128px
    };
    
    // Animation variants per state
    const animations = {
        happy: {
            animate: { 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
            },
            transition: { 
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
            },
        },
        sad: {
            animate: { 
                y: [0, 3, 0],
                scale: [1, 0.95, 1],
            },
            transition: { 
                duration: 2,
                repeat: Infinity,
            },
        },
        angry: {
            animate: { 
                x: [-2, 2, -2, 2, 0],
                rotate: [0, -3, 3, -3, 0],
            },
            transition: { 
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 1,
            },
        },
        sleeping: {
            animate: { 
                scale: [1, 1.02, 1],
                opacity: [1, 0.8, 1],
            },
            transition: { 
                duration: 2,
                repeat: Infinity,
            },
        },
        neutral: {
            animate: {},
            transition: {},
        },
    };
    
    return (
        <div className="flex flex-col items-center gap-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentState}
                    className={`${sizeMap[size]}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ 
                        scale: 1, 
                        rotate: 0,
                        ...animations[currentState].animate,
                    }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        ...animations[currentState].transition,
                    }}
                >
                    🪵{getMascotEmoji()}
                </motion.div>
            </AnimatePresence>
            
            {/* Z-z-z effect for sleeping */}
            {currentState === 'sleeping' && (
                <motion.div
                    className="absolute text-2xl text-gray-500"
                    initial={{ opacity: 0, x: 20, y: -20 }}
                    animate={{ 
                        opacity: [0, 1, 0],
                        x: [20, 40],
                        y: [-20, -40],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                >
                    💤
                </motion.div>
            )}
        </div>
    );
};
```

---

### Task 4: Export Mascot Component [Frontend]

**File:** `src/components/Mascot/index.ts`

```typescript
export { Mascot } from './Mascot';
```

---

### Task 5: Dynamic Messages [i18n]

**File:** `src/locales/vi.json` (thêm section mascot)

```json
{
  "mascot": {
    "happy": {
      "messages": [
        "Tuyệt vời! Bạn làm tốt lắm! 🎉",
        "Mắt bạn cảm ơn bạn đấy! 👀",
        "Nghỉ ngơi xứng đáng! ☕"
      ]
    },
    "sad": {
      "messages": [
        "Lâu quá rồi... 😢",
        "Mắt mình mỏi quá...",
        "Bạn có nhớ mình không? 🥺"
      ]
    },
    "angry": {
      "messages": [
        "Thôi kệ bạn! 😤",
        "Lại hoãn nữa à?!",
        "Mình hết kiên nhẫn rồi! 💢"
      ]
    },
    "sleeping": {
      "messages": [
        "Zzz... 😴",
        "Mình đang ngủ...",
        "Bạn đi đâu rồi? 💤"
      ]
    },
    "neutral": {
      "messages": [
        "Sẵn sàng làm việc! 💪",
        "Cùng bắt đầu thôi!",
        "Mình ở đây nè! 🪵"
      ]
    }
  }
}
```

**File:** `src/locales/en.json` (thêm section mascot)

```json
{
  "mascot": {
    "happy": {
      "messages": [
        "Great job! You did it! 🎉",
        "Your eyes thank you! 👀",
        "Well-deserved break! ☕"
      ]
    },
    "sad": {
      "messages": [
        "It's been so long... 😢",
        "My eyes are tired...",
        "Do you remember me? 🥺"
      ]
    },
    "angry": {
      "messages": [
        "Fine, whatever! 😤",
        "Snoozing again?!",
        "I've lost my patience! 💢"
      ]
    },
    "sleeping": {
      "messages": [
        "Zzz... 😴",
        "I'm sleeping...",
        "Where did you go? 💤"
      ]
    },
    "neutral": {
      "messages": [
        "Ready to work! 💪",
        "Let's get started!",
        "I'm here! 🪵"
      ]
    }
  }
}
```

---

### Task 6: Message Helper Function [Frontend]

**Update:** `src/stores/mascotStore.ts`

Thêm function `getMascotMessage` đầy đủ:

```typescript
import i18n from '../i18n';

// Inside the store:
getMascotMessage: () => {
    const state = get().currentState;
    const messages = i18n.t(`mascot.${state}.messages`, { returnObjects: true }) as string[];
    
    // Random message from array
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex] || '';
},
```

---

### Task 7: Integrate Mascot into Dashboard [Frontend]

**Update:** `src/screens/Dashboard/Dashboard.tsx`

Thêm Mascot component vào header hoặc timer section:

```typescript
import { Mascot } from '../../components/Mascot';

// Inside Dashboard component, thêm vào layout:
<div className="flex items-center justify-center mb-4">
    <Mascot size="md" />
</div>
```

---

### Task 8: Integrate Mascot into Break Overlay [Frontend]

**Update:** `src/components/Overlay/BreakOverlay.tsx`

Replace static emoji với Mascot component:

```typescript
import { Mascot } from '../Mascot';
import { useMascotStore } from '../../stores/mascotStore';

// Inside BreakOverlay component:
const { getMascotMessage } = useMascotStore();

// Replace static mascot section:
<div className="text-center mb-6">
    <Mascot size="xl" />
    <p className="text-gray-700 mt-4 text-lg italic">
        "{getMascotMessage()}"
    </p>
</div>
```

---

### Task 9: Connect Snooze to Mascot State [Frontend]

**Update:** `src/stores/notificationStore.ts`

Trong function `snooze()`:

```typescript
import { useMascotStore } from './mascotStore';

// Inside snooze action:
snooze: async (minutes: number) => {
    const mascotStore = useMascotStore.getState();
    mascotStore.incrementSnoozeCount(); // This auto-updates mascot state
    
    // ... existing snooze logic
},

// Inside takeBreak action:
takeBreak: async () => {
    const mascotStore = useMascotStore.getState();
    mascotStore.resetSnoozeCount();
    mascotStore.setHappy();
    
    // ... existing take break logic
},
```

---

### Task 10: Connect Idle to Mascot State [Frontend]

**Update:** `src/stores/idleStore.ts`

```typescript
import { useMascotStore } from './mascotStore';

// When idle detected:
if (idleSeconds >= threshold) {
    useMascotStore.getState().setSleeping();
}

// When activity resumed:
if (wasIdle && !isIdle) {
    useMascotStore.getState().setHappy();
}
```

---

### Task 11: Connect Timer to Mascot State [Frontend]

**Update:** `src/stores/timerStore.ts`

```typescript
import { useMascotStore } from './mascotStore';

// When timer completes (break time):
// If user responds quickly → Happy
// If user ignores → Sad

// When break is taken:
useMascotStore.getState().setHappy();
```

---

### Task 12: Testing & Verification

**Manual Tests:**

1. **Dashboard Test:**
   - [ ] Mở app, thấy mascot ở trạng thái neutral
   - [ ] Mascot có animation nhẹ

2. **Idle Test:**
   - [ ] Để máy idle 2 phút
   - [ ] Mascot chuyển sang sleeping (😴) với animation Z-z-z

3. **Overlay + Snooze Test:**
   - [ ] Trigger break overlay
   - [ ] Thấy mascot lớn + message
   - [ ] Click "Take Break" → mascot happy
   - [ ] Reset, trigger lại
   - [ ] Click "Snooze" 1 lần → mascot sad
   - [ ] Click "Snooze" 3+ lần → mascot angry + angry message

4. **Message Randomization:**
   - [ ] Trigger overlay nhiều lần
   - [ ] Messages thay đổi ngẫu nhiên

---

## 📁 FILES TO CREATE/MODIFY

### New Files:
```
src/
├── components/
│   └── Mascot/
│       ├── Mascot.tsx      [NEW]
│       └── index.ts        [NEW]
└── stores/
    └── mascotStore.ts      [NEW]
```

### Modify Files:
```
src/
├── locales/
│   ├── vi.json             [MODIFY - add mascot section]
│   └── en.json             [MODIFY - add mascot section]
├── screens/
│   └── Dashboard/
│       └── Dashboard.tsx   [MODIFY - add Mascot]
├── components/
│   └── Overlay/
│       └── BreakOverlay.tsx [MODIFY - replace emoji with Mascot]
└── stores/
    ├── notificationStore.ts [MODIFY - connect snooze to mascot]
    ├── idleStore.ts        [MODIFY - connect idle to mascot]
    └── timerStore.ts       [MODIFY - connect timer to mascot]
```

---

## 🎨 DESIGN NOTES

### Mascot Size Guidelines:

| Context | Size | Emoji Scale |
|---------|------|-------------|
| Dashboard header | md | 60px |
| Break Overlay | xl | 128px |
| Toast notification | sm | 36px |
| System tray (future) | sm | 24px |

### Animation Principles:

1. **Subtle:** Animations không quá nhanh/mạnh
2. **Meaningful:** Mỗi state có animation riêng
3. **Smooth:** Dùng spring physics cho tự nhiên
4. **Non-blocking:** Không ảnh hưởng performance

---

## ⚠️ NOTES FOR MISA

1. **Sử dụng emoji trước** - Sau đó có thể upgrade lên custom SVG
2. **Test trên cả light và dark mode** - Đảm bảo mascot hiển thị tốt
3. **Performance** - Animation không được làm chậm app
4. **i18n** - Tất cả messages phải có cả VI và EN

---

## ✅ COMPLETION CRITERIA

- [ ] Mascot hiển thị đúng trong Dashboard
- [ ] Mascot hiển thị đúng trong Break Overlay
- [ ] 4 states hoạt động với animations
- [ ] Messages thay đổi theo state
- [ ] Snooze count ảnh hưởng mascot state
- [ ] Idle detection ảnh hưởng mascot state
- [ ] i18n hoạt động cho tất cả messages
- [ ] Không có console errors

---

*Created by LUMB for MISA - 2026-01-29*
