# M09: HEALTH TIPS & EXERCISES - Task File for MISA

> **Module:** M09 - Health Tips & Exercises  
> **Phase:** Phase 2: Personality & Polish  
> **Priority:** P2 (Medium)  
> **Estimated Time:** 1-2 ngày

---

## 🎯 MỤC TIÊU

Xây dựng hệ thống gợi ý bài tập sức khỏe trong Break Overlay:
- 5+ bài tập ngắn (20-30 giây mỗi bài)
- Card UI với hướng dẫn + animation
- Navigation giữa các bài tập
- Random selection theo break type

---

## 💪 DANH SÁCH BÀI TẬP (PRD)

| # | Tên | Icon | Mô tả | Thời gian |
|---|-----|------|-------|-----------|
| 1 | Nhìn xa | 👀 | Nhìn điểm xa 6m trong 20s | 20s |
| 2 | Xoay cổ | 🔄 | Xoay cổ 360° chậm rãi | 30s |
| 3 | Vươn vai | 💪 | Đứng dậy, vươn vai | 30s |
| 4 | Nháy mắt | 👁️ | Nháy mắt 20 lần | 10s |
| 5 | Hít thở | 🧘 | Hít sâu, thở chậm | 30s |
| 6 | Xoay cổ tay | ✋ | Xoay cổ tay theo vòng tròn | 20s |
| 7 | Duỗi lưng | 🪑 | Ngồi thẳng, ưỡn lưng | 20s |

---

## 📋 CHECKLIST (10 TASKS)

### Task 1: Health Tips Data [Frontend Data]

**File:** `src/data/healthTips.ts`

```typescript
export interface HealthTip {
    id: string;
    icon: string;
    titleKey: string;      // i18n key for title
    descriptionKey: string; // i18n key for description
    durationSeconds: number;
    category: 'eye' | 'body' | 'breathing' | 'stretch';
    forBreakType: 'micro' | 'rest' | 'both';
}

export const healthTips: HealthTip[] = [
    {
        id: 'look_away',
        icon: '👀',
        titleKey: 'tips.look_away.title',
        descriptionKey: 'tips.look_away.description',
        durationSeconds: 20,
        category: 'eye',
        forBreakType: 'micro', // Good for 20-20-20 rule
    },
    {
        id: 'neck_rotation',
        icon: '🔄',
        titleKey: 'tips.neck_rotation.title',
        descriptionKey: 'tips.neck_rotation.description',
        durationSeconds: 30,
        category: 'stretch',
        forBreakType: 'rest',
    },
    {
        id: 'shoulder_stretch',
        icon: '💪',
        titleKey: 'tips.shoulder_stretch.title',
        descriptionKey: 'tips.shoulder_stretch.description',
        durationSeconds: 30,
        category: 'stretch',
        forBreakType: 'rest',
    },
    {
        id: 'blink_exercise',
        icon: '👁️',
        titleKey: 'tips.blink_exercise.title',
        descriptionKey: 'tips.blink_exercise.description',
        durationSeconds: 10,
        category: 'eye',
        forBreakType: 'micro',
    },
    {
        id: 'deep_breathing',
        icon: '🧘',
        titleKey: 'tips.deep_breathing.title',
        descriptionKey: 'tips.deep_breathing.description',
        durationSeconds: 30,
        category: 'breathing',
        forBreakType: 'both',
    },
    {
        id: 'wrist_rotation',
        icon: '✋',
        titleKey: 'tips.wrist_rotation.title',
        descriptionKey: 'tips.wrist_rotation.description',
        durationSeconds: 20,
        category: 'stretch',
        forBreakType: 'both',
    },
    {
        id: 'back_stretch',
        icon: '🪑',
        titleKey: 'tips.back_stretch.title',
        descriptionKey: 'tips.back_stretch.description',
        durationSeconds: 20,
        category: 'body',
        forBreakType: 'rest',
    },
];

// Helper functions
export const getTipsForBreakType = (breakType: 'micro' | 'rest'): HealthTip[] => {
    return healthTips.filter(
        tip => tip.forBreakType === breakType || tip.forBreakType === 'both'
    );
};

export const getRandomTip = (breakType: 'micro' | 'rest'): HealthTip => {
    const tips = getTipsForBreakType(breakType);
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
};

export const getTipsByCategory = (category: HealthTip['category']): HealthTip[] => {
    return healthTips.filter(tip => tip.category === category);
};
```

---

### Task 2: Health Tips i18n [i18n]

**Update:** `src/locales/vi.json`

```json
{
  "tips": {
    "section_title": "💪 BÀI TẬP NGẮN",
    "look_away": {
      "title": "Nhìn xa 20 feet",
      "description": "Nhìn ra cửa sổ hoặc nhìn vào một điểm xa khoảng 6 mét trong 20 giây. Để mắt thư giãn."
    },
    "neck_rotation": {
      "title": "Xoay cổ",
      "description": "Từ từ xoay cổ theo chiều kim đồng hồ, sau đó ngược lại. Mỗi chiều 5 vòng."
    },
    "shoulder_stretch": {
      "title": "Vươn vai",
      "description": "Đứng dậy, đưa hai tay lên cao và vươn người. Cảm nhận các cơ lưng và vai được duỗi ra."
    },
    "blink_exercise": {
      "title": "Nháy mắt",
      "description": "Nháy mắt nhanh 20 lần để làm ẩm mắt và giảm khô mắt khi nhìn màn hình."
    },
    "deep_breathing": {
      "title": "Hít thở sâu",
      "description": "Hít vào bằng mũi trong 4 giây, giữ 4 giây, thở ra bằng miệng trong 6 giây. Lặp lại 3-5 lần."
    },
    "wrist_rotation": {
      "title": "Xoay cổ tay",
      "description": "Xoay cổ tay theo vòng tròn, 10 vòng theo mỗi chiều. Giúp giảm căng thẳng khi gõ phím."
    },
    "back_stretch": {
      "title": "Duỗi lưng",
      "description": "Ngồi thẳng trên ghế, từ từ ưỡn lưng về phía sau và giữ 10 giây. Lặp lại 3 lần."
    }
  }
}
```

**Update:** `src/locales/en.json`

```json
{
  "tips": {
    "section_title": "💪 QUICK EXERCISE",
    "look_away": {
      "title": "Look Away 20 feet",
      "description": "Look out the window or at a point about 6 meters away for 20 seconds. Let your eyes relax."
    },
    "neck_rotation": {
      "title": "Neck Rotation",
      "description": "Slowly rotate your neck clockwise, then counterclockwise. 5 rotations each direction."
    },
    "shoulder_stretch": {
      "title": "Shoulder Stretch",
      "description": "Stand up, raise both hands high and stretch. Feel your back and shoulders extend."
    },
    "blink_exercise": {
      "title": "Blink Exercise",
      "description": "Blink quickly 20 times to moisten your eyes and reduce screen-related dryness."
    },
    "deep_breathing": {
      "title": "Deep Breathing",
      "description": "Inhale through nose for 4 seconds, hold 4 seconds, exhale through mouth for 6 seconds. Repeat 3-5 times."
    },
    "wrist_rotation": {
      "title": "Wrist Rotation",
      "description": "Rotate your wrists in circles, 10 rotations each direction. Helps reduce typing strain."
    },
    "back_stretch": {
      "title": "Back Stretch",
      "description": "Sit straight in your chair, slowly arch your back backward and hold for 10 seconds. Repeat 3 times."
    }
  }
}
```

---

### Task 3: Health Tips Store [Frontend State]

**File:** `src/stores/healthTipsStore.ts`

```typescript
import { create } from 'zustand';
import { HealthTip, healthTips, getRandomTip, getTipsForBreakType } from '../data/healthTips';

interface HealthTipsState {
    currentTip: HealthTip | null;
    currentIndex: number;
    filteredTips: HealthTip[];
    breakType: 'micro' | 'rest';
    
    // Actions
    setBreakType: (type: 'micro' | 'rest') => void;
    selectRandomTip: () => void;
    nextTip: () => void;
    prevTip: () => void;
    goToTip: (index: number) => void;
    
    // Getters
    getTotalTips: () => number;
}

export const useHealthTipsStore = create<HealthTipsState>((set, get) => ({
    currentTip: null,
    currentIndex: 0,
    filteredTips: [],
    breakType: 'micro',
    
    setBreakType: (type) => {
        const tips = getTipsForBreakType(type);
        const randomIndex = Math.floor(Math.random() * tips.length);
        set({
            breakType: type,
            filteredTips: tips,
            currentIndex: randomIndex,
            currentTip: tips[randomIndex],
        });
    },
    
    selectRandomTip: () => {
        const { breakType, filteredTips } = get();
        const tips = filteredTips.length > 0 ? filteredTips : getTipsForBreakType(breakType);
        const randomIndex = Math.floor(Math.random() * tips.length);
        set({
            filteredTips: tips,
            currentIndex: randomIndex,
            currentTip: tips[randomIndex],
        });
    },
    
    nextTip: () => {
        const { currentIndex, filteredTips } = get();
        const nextIndex = (currentIndex + 1) % filteredTips.length;
        set({
            currentIndex: nextIndex,
            currentTip: filteredTips[nextIndex],
        });
    },
    
    prevTip: () => {
        const { currentIndex, filteredTips } = get();
        const prevIndex = currentIndex === 0 ? filteredTips.length - 1 : currentIndex - 1;
        set({
            currentIndex: prevIndex,
            currentTip: filteredTips[prevIndex],
        });
    },
    
    goToTip: (index) => {
        const { filteredTips } = get();
        if (index >= 0 && index < filteredTips.length) {
            set({
                currentIndex: index,
                currentTip: filteredTips[index],
            });
        }
    },
    
    getTotalTips: () => get().filteredTips.length,
}));
```

---

### Task 4: Health Tip Card Component [Frontend UI]

**File:** `src/components/HealthTips/HealthTipCard.tsx`

```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import { useHealthTipsStore } from '../../stores/healthTipsStore';

interface HealthTipCardProps {
    showNavigation?: boolean;
}

export const HealthTipCard: FC<HealthTipCardProps> = ({ 
    showNavigation = true 
}) => {
    const { t } = useTranslation();
    const { 
        currentTip, 
        currentIndex, 
        nextTip, 
        prevTip, 
        getTotalTips 
    } = useHealthTipsStore();
    
    if (!currentTip) return null;
    
    const totalTips = getTotalTips();
    
    return (
        <motion.div
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/50 max-w-sm mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    {t('tips.section_title')}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Timer className="w-4 h-4" />
                    <span>{currentTip.durationSeconds}s</span>
                </div>
            </div>
            
            {/* Tip Content */}
            <motion.div
                key={currentTip.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-center"
            >
                {/* Icon */}
                <div className="text-5xl mb-3">
                    {currentTip.icon}
                </div>
                
                {/* Title */}
                <h4 className="font-semibold text-lg text-gray-800 mb-2">
                    {t(currentTip.titleKey)}
                </h4>
                
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                    {t(currentTip.descriptionKey)}
                </p>
            </motion.div>
            
            {/* Navigation */}
            {showNavigation && totalTips > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200/50">
                    <button
                        onClick={prevTip}
                        className="p-2 rounded-full hover:bg-gray-200/60 transition-colors"
                        aria-label="Previous tip"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    {/* Pagination Dots */}
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalTips }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    idx === currentIndex 
                                        ? 'bg-[#FF6B35]' 
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    
                    <button
                        onClick={nextTip}
                        className="p-2 rounded-full hover:bg-gray-200/60 transition-colors"
                        aria-label="Next tip"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            )}
        </motion.div>
    );
};
```

---

### Task 5: Export Health Tips Components [Frontend]

**File:** `src/components/HealthTips/index.ts`

```typescript
export { HealthTipCard } from './HealthTipCard';
export { healthTips, getRandomTip, getTipsForBreakType } from '../../data/healthTips';
export type { HealthTip } from '../../data/healthTips';
```

---

### Task 6: Integrate into Break Overlay [Frontend]

**Update:** `src/components/Overlay/BreakOverlay.tsx`

Thêm HealthTipCard vào overlay:

```typescript
import { HealthTipCard } from '../HealthTips';
import { useHealthTipsStore } from '../../stores/healthTipsStore';
import { useTimerStore } from '../../stores/timerStore';

// Inside BreakOverlay component:
const { state: timerState } = useTimerStore();
const { setBreakType, selectRandomTip } = useHealthTipsStore();

// When overlay shows, select a random tip based on break type
useEffect(() => {
    const breakType = timerState.timer_type === 'micro_break' ? 'micro' : 'rest';
    setBreakType(breakType);
}, [isVisible, timerState.timer_type]);

// In JSX, add the card after mascot section:
{isVisible && (
    <div className="mt-6">
        <HealthTipCard showNavigation />
    </div>
)}
```

---

### Task 7: Mini Tip Display (Dashboard) [Frontend]

**File:** `src/components/HealthTips/MiniTip.tsx`

Component nhỏ hiển thị tip hiện tại trong Dashboard:

```typescript
import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';
import { useHealthTipsStore } from '../../stores/healthTipsStore';
import { getRandomTip } from '../../data/healthTips';

export const MiniTip: FC = () => {
    const { t } = useTranslation();
    const { currentTip, selectRandomTip } = useHealthTipsStore();
    
    // Select random tip on mount
    useEffect(() => {
        if (!currentTip) {
            selectRandomTip();
        }
    }, []);
    
    if (!currentTip) return null;
    
    return (
        <motion.div
            className="flex items-center gap-3 p-3 bg-amber-50/80 rounded-xl border border-amber-200/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            <div className="text-2xl">{currentTip.icon}</div>
            <div className="flex-1">
                <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    {t('tips.section_title')}
                </p>
                <p className="text-sm text-amber-900 font-medium">
                    {t(currentTip.titleKey)}
                </p>
            </div>
        </motion.div>
    );
};
```

Update export:

```typescript
// src/components/HealthTips/index.ts
export { HealthTipCard } from './HealthTipCard';
export { MiniTip } from './MiniTip';
```

---

### Task 8: Add to Dashboard [Frontend]

**Update:** `src/screens/Dashboard/Dashboard.tsx`

Thêm MiniTip vào dashboard (optional, có thể toggle):

```typescript
import { MiniTip } from '../../components/HealthTips';

// In JSX, add after timer controls or before footer:
<div className="mt-4">
    <MiniTip />
</div>
```

---

### Task 9: Category Filter (Optional) [Frontend]

**File:** `src/components/HealthTips/CategoryFilter.tsx`

Optional component cho phép user filter theo category:

```typescript
import { FC } from 'react';

const categories = [
    { id: 'all', icon: '🎯', label: 'Tất cả' },
    { id: 'eye', icon: '👀', label: 'Mắt' },
    { id: 'body', icon: '💪', label: 'Cơ thể' },
    { id: 'breathing', icon: '🧘', label: 'Hít thở' },
    { id: 'stretch', icon: '🔄', label: 'Duỗi người' },
];

interface CategoryFilterProps {
    selected: string;
    onSelect: (id: string) => void;
}

export const CategoryFilter: FC<CategoryFilterProps> = ({ 
    selected, 
    onSelect 
}) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={`
                        flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap
                        transition-all
                        ${selected === cat.id 
                            ? 'bg-[#FF6B35] text-white' 
                            : 'bg-gray-200/60 text-gray-700 hover:bg-gray-300/60'}
                    `}
                >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>
    );
};
```

---

### Task 10: Testing & Verification

**Test Scenarios:**

1. **Break Overlay Test:**
   - [ ] Mở overlay → Thấy HealthTipCard với tip ngẫu nhiên
   - [ ] Micro break → Chỉ thấy tips cho mắt/ngắn
   - [ ] Rest break → Thấy tips cho cơ thể/dài

2. **Navigation Test:**
   - [ ] Click next → Chuyển sang tip tiếp theo
   - [ ] Click prev → Quay lại tip trước
   - [ ] Pagination dots hiển thị đúng

3. **i18n Test:**
   - [ ] Chuyển sang English → Tất cả tips hiển thị tiếng Anh
   - [ ] Chuyển lại Vietnamese → Hiển thị tiếng Việt

4. **MiniTip Test (Optional):**
   - [ ] Dashboard hiển thị MiniTip
   - [ ] Tip thay đổi khi refresh

---

## 📁 FILES TO CREATE/MODIFY

### New Files:
```
src/
├── data/
│   └── healthTips.ts           [NEW]
├── components/
│   └── HealthTips/
│       ├── HealthTipCard.tsx   [NEW]
│       ├── MiniTip.tsx         [NEW]
│       ├── CategoryFilter.tsx  [NEW - Optional]
│       └── index.ts            [NEW]
└── stores/
    └── healthTipsStore.ts      [NEW]
```

### Modify Files:
```
src/
├── locales/
│   ├── vi.json                 [MODIFY - add tips section]
│   └── en.json                 [MODIFY - add tips section]
├── components/
│   └── Overlay/
│       └── BreakOverlay.tsx    [MODIFY - add HealthTipCard]
└── screens/
    └── Dashboard/
        └── Dashboard.tsx       [MODIFY - add MiniTip (optional)]
```

---

## ⚠️ NOTES FOR MISA

1. **Tips data** - Có thể mở rộng thêm tips sau này
2. **Break type filtering** - Quan trọng! Micro break nên focus mắt, Rest break nên focus cơ thể
3. **Animation** - Card cần có animation mượt khi chuyển tip
4. **Responsive** - Card phải fit trong overlay nhỏ

---

## ✅ COMPLETION CRITERIA

- [ ] 7 health tips với đầy đủ i18n (VI/EN)
- [ ] HealthTipCard hiển thị trong Break Overlay
- [ ] Navigation (prev/next) hoạt động
- [ ] Tips filter theo break type
- [ ] Animation mượt mà
- [ ] MiniTip hiển thị trong Dashboard (optional)
- [ ] Không có console errors

---

*Created by LUMB for MISA - 2026-01-29*
