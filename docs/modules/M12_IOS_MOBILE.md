# M12: iOS MOBILE - IPHONE DEPLOYMENT

> **Mục tiêu:** Deploy Lumbar lên iPhone sử dụng Tauri 2.0 iOS  
> **Platform:** iOS 15+  
> **Prerequisite:** M01-M11 hoàn thành, macOS build ổn định  
> **Estimated:** 2-3 tuần

---

## 📱 TỔNG QUAN

### Tauri 2.0 Mobile Support:
- ✅ Tái sử dụng React UI
- ✅ Rust backend chạy native
- ✅ iOS/Android từ cùng codebase
- ⚠️ Một số APIs khác biệt

### Thay đổi chính:
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Layout | Fixed 420px | Full screen responsive |
| Navigation | Single page | Bottom tab bar |
| Timer | Background process | Background tasks (limited) |
| Notifications | System tray | Push notifications |
| Idle Detection | Mouse/keyboard | ❌ Removed |

---

## 🛠️ PHASE 1: SETUP (Day 1-2)

### Task 1: Environment Setup

**Yêu cầu:**
```bash
# 1. Xcode 15+ từ App Store

# 2. iOS Rust targets
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim
rustup target add x86_64-apple-ios  # Intel simulator

# 3. iOS init
cd lumbar-app
npm run tauri ios init
```

**Files tạo mới:**
```
lumbar-app/
├── src-tauri/
│   ├── gen/
│   │   └── apple/           # iOS project files
│   ├── Cargo.toml           # Update với iOS dependencies
│   └── tauri.conf.json      # Update iOS config
```

---

### Task 2: tauri.conf.json iOS Config

**Thêm vào `tauri.conf.json`:**

```json
{
  "bundle": {
    "iOS": {
      "developmentTeam": "YOUR_TEAM_ID",
      "minVersion": "15.0"
    }
  },
  "app": {
    "withGlobalTauri": true
  },
  "plugins": {
    "notification": {
      "permittedPermissions": ["alert", "badge", "sound"]
    }
  }
}
```

---

## 🎨 PHASE 2: RESPONSIVE UI (Day 3-7)

### Task 3: Tailwind Responsive Setup

**Cập nhật `tailwind.config.js`:**

```javascript
module.exports = {
  theme: {
    screens: {
      'mobile': '320px',      // iPhone SE
      'mobile-lg': '390px',   // iPhone 14
      'tablet': '768px',      // iPad
      'desktop': '1024px',    // macOS
    },
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    }
  }
}
```

---

### Task 4: Platform Detection Hook

**File:** `src/hooks/usePlatform.ts`

```typescript
import { useState, useEffect } from 'react';

type Platform = 'ios' | 'android' | 'macos' | 'windows' | 'web';

export const usePlatform = (): Platform => {
    const [platform, setPlatform] = useState<Platform>('web');
    
    useEffect(() => {
        const detectPlatform = async () => {
            if ('__TAURI__' in window) {
                const { platform: tauriPlatform } = await import('@tauri-apps/plugin-os');
                const os = await tauriPlatform();
                setPlatform(os as Platform);
            }
        };
        detectPlatform();
    }, []);
    
    return platform;
};

export const isMobile = (platform: Platform) => 
    platform === 'ios' || platform === 'android';

export const isDesktop = (platform: Platform) => 
    platform === 'macos' || platform === 'windows';
```

---

### Task 5: Responsive Layout Component

**File:** `src/components/Layout/MobileLayout.tsx`

```typescript
import { FC, ReactNode } from 'react';
import { usePlatform, isMobile } from '../../hooks/usePlatform';
import { BottomTabBar } from './BottomTabBar';

interface MobileLayoutProps {
    children: ReactNode;
}

export const MobileLayout: FC<MobileLayoutProps> = ({ children }) => {
    const platform = usePlatform();
    
    if (!isMobile(platform)) {
        return <>{children}</>;
    }
    
    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-sky-100 to-teal-100">
            {/* Safe area padding for notch */}
            <div className="pt-safe-top" />
            
            {/* Main content */}
            <main className="flex-1 overflow-y-auto px-4 pb-20">
                {children}
            </main>
            
            {/* Bottom tab bar */}
            <BottomTabBar />
            
            {/* Safe area padding for home indicator */}
            <div className="pb-safe-bottom" />
        </div>
    );
};
```

---

### Task 6: Bottom Tab Bar

**File:** `src/components/Layout/BottomTabBar.tsx`

```typescript
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, BarChart2, Settings, Award } from 'lucide-react';
import { motion } from 'framer-motion';

type TabId = 'home' | 'stats' | 'settings' | 'awards';

interface BottomTabBarProps {
    activeTab?: TabId;
    onTabChange?: (tab: TabId) => void;
}

export const BottomTabBar: FC<BottomTabBarProps> = ({ 
    activeTab = 'home', 
    onTabChange 
}) => {
    const { t } = useTranslation();
    
    const tabs = [
        { id: 'home', icon: Home, label: t('nav.home') },
        { id: 'stats', icon: BarChart2, label: t('nav.stats') },
        { id: 'settings', icon: Settings, label: t('nav.settings') },
        { id: 'awards', icon: Award, label: t('nav.awards') },
    ] as const;
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe-bottom">
            <div className="flex justify-around items-center h-16">
                {tabs.map(({ id, icon: Icon, label }) => (
                    <motion.button
                        key={id}
                        onClick={() => onTabChange?.(id)}
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
                            activeTab === id ? 'text-orange-500' : 'text-gray-500'
                        }`}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{label}</span>
                        
                        {activeTab === id && (
                            <motion.div
                                className="absolute bottom-1 w-1 h-1 bg-orange-500 rounded-full"
                                layoutId="activeTab"
                            />
                        )}
                    </motion.button>
                ))}
            </div>
        </nav>
    );
};
```

---

### Task 7: Update Dashboard for Mobile

**File:** `src/screens/Dashboard/MobileDashboard.tsx`

```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mascot } from '../../components/Mascot';
import { useTimerStore } from '../../stores/timerStore';
import { useStatsStore } from '../../stores/statsStore';

export const MobileDashboard: FC = () => {
    const { t } = useTranslation();
    const { timeRemaining, mode, isRunning } = useTimerStore();
    const { allTimeStats } = useStatsStore();
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            {/* Mascot */}
            <Mascot size="lg" showMessage />
            
            {/* Timer Card */}
            <motion.div 
                className="w-full max-w-xs bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <p className="text-center text-gray-500 text-sm mb-2">
                    {t('timer.nextBreak')}
                </p>
                <p className="text-center text-6xl font-bold text-gray-800">
                    {formatTime(timeRemaining)}
                </p>
                <p className="text-center text-gray-500 text-sm mt-2">
                    {mode === 'micro' ? '👀 Micro Break' : '🧘 Rest Break'}
                </p>
            </motion.div>
            
            {/* Streak Display */}
            <motion.div 
                className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full"
                whileTap={{ scale: 0.95 }}
            >
                <span className="text-2xl">🔥</span>
                <span className="text-orange-600 font-bold">
                    {allTimeStats?.currentStreak || 0} {t('stats.days')}
                </span>
            </motion.div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
                <div className="bg-teal-100 px-4 py-2 rounded-xl text-center">
                    <span className="text-2xl">☕</span>
                    <p className="text-teal-700 font-bold">{allTimeStats?.totalBreaks || 0}</p>
                </div>
                <div className="bg-orange-100 px-4 py-2 rounded-xl text-center">
                    <span className="text-2xl">⏸️</span>
                    <p className="text-orange-700 font-bold">{allTimeStats?.totalSnoozes || 0}</p>
                </div>
            </div>
            
            {/* Action Button */}
            <motion.button
                className="w-full max-w-xs bg-gradient-to-r from-orange-400 to-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
                whileTap={{ scale: 0.98 }}
            >
                {isRunning ? '⏸️ Pause' : '▶️ Start Working'}
            </motion.button>
        </div>
    );
};
```

---

## 🔔 PHASE 3: iOS NOTIFICATIONS (Day 8-10)

### Task 8: iOS Push Notifications

**File:** `src/services/iosNotifications.ts`

```typescript
import { 
    isPermissionGranted, 
    requestPermission, 
    sendNotification,
    registerActionTypes,
    onAction
} from '@tauri-apps/plugin-notification';

export const initIOSNotifications = async () => {
    // Check permission
    let permissionGranted = await isPermissionGranted();
    
    if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
    }
    
    if (!permissionGranted) {
        console.warn('⚠️ Notification permission denied');
        return false;
    }
    
    // Register action types
    await registerActionTypes([
        {
            id: 'break-reminder',
            actions: [
                { id: 'take-break', title: 'Take Break 🎉' },
                { id: 'snooze-5', title: 'Snooze 5 min' },
            ]
        }
    ]);
    
    // Listen for actions
    onAction((action) => {
        if (action.actionId === 'take-break') {
            // Handle take break
        } else if (action.actionId === 'snooze-5') {
            // Handle snooze
        }
    });
    
    console.log('✅ iOS notifications initialized');
    return true;
};

export const sendBreakNotification = async (type: 'micro' | 'rest') => {
    await sendNotification({
        title: type === 'micro' ? '👀 Micro Break!' : '🧘 Rest Time!',
        body: type === 'micro' 
            ? 'Look away from screen for 20 seconds' 
            : 'Time to stand up and stretch!',
        actionTypeId: 'break-reminder',
        sound: 'default',
    });
};
```

---

### Task 9: Background Timer (iOS)

**File:** `src/services/iosBackgroundTimer.ts`

```typescript
// iOS Background Tasks có giới hạn ~30 giây
// Sử dụng Background App Refresh cho timer dài hơn

import { invoke } from '@tauri-apps/api/core';

export const scheduleBackgroundNotification = async (
    delayMinutes: number,
    type: 'micro' | 'rest'
) => {
    // Schedule local notification cho tương lai
    await invoke('schedule_notification', {
        delaySeconds: delayMinutes * 60,
        title: type === 'micro' ? '👀 Micro Break!' : '🧘 Rest Time!',
        body: 'Time to take a break!',
    });
};

export const cancelScheduledNotifications = async () => {
    await invoke('cancel_all_notifications');
};
```

---

## 🎯 PHASE 4: FEATURE ADAPTATION (Day 11-14)

### Task 10: Remove Desktop-Only Features

**Tạo file:** `src/utils/platformFeatures.ts`

```typescript
import { usePlatform, isMobile, isDesktop } from '../hooks/usePlatform';

export const FEATURES = {
    // Desktop only
    systemTray: false,      // No menu bar on iOS
    idleDetection: false,   // No mouse/keyboard on iOS
    windowVibrancy: false,  // macOS only
    overlay: false,         // Full screen overlay không có trên iOS
    
    // Mobile only
    hapticFeedback: true,   // Vibration
    pushNotifications: true,
    bottomTabBar: true,
    
    // Both
    timer: true,
    mascot: true,
    healthTips: true,
    stats: true,
    settings: true,
    i18n: true,
};

export const getFeatures = (platform: string) => {
    if (platform === 'ios' || platform === 'android') {
        return {
            ...FEATURES,
            systemTray: false,
            idleDetection: false,
            windowVibrancy: false,
            overlay: false,
        };
    }
    return {
        ...FEATURES,
        hapticFeedback: false,
        bottomTabBar: false,
    };
};
```

---

### Task 11: Haptic Feedback

**File:** `src/hooks/useHaptic.ts`

```typescript
import { usePlatform } from './usePlatform';

export const useHaptic = () => {
    const platform = usePlatform();
    
    const trigger = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
        if (platform !== 'ios') return;
        
        // Sử dụng Tauri iOS haptic API
        // Hoặc native WebKit API nếu có
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30],
                success: [10, 50, 10],
                error: [50, 100, 50],
            };
            navigator.vibrate(patterns[type]);
        }
    };
    
    return { trigger };
};
```

---

### Task 12: i18n Mobile Navigation

**Thêm vào `vi.json`:**

```json
{
    "nav": {
        "home": "Trang chủ",
        "stats": "Thống kê",
        "settings": "Cài đặt",
        "awards": "Thành tựu"
    },
    "mobile": {
        "break_reminder": "Đến giờ nghỉ rồi!",
        "tap_to_open": "Nhấn để mở app",
        "streak_notification": "Đừng phá streak {{days}} ngày của bạn!",
        "permission_required": "Cần quyền thông báo để nhắc nghỉ"
    }
}
```

---

## 📦 PHASE 5: BUILD & TEST (Day 15-18)

### Task 13: iOS Build Commands

```bash
# Development (Simulator)
npm run tauri ios dev

# Development (Device) - cần Developer Account
npm run tauri ios dev -- --device

# Production build
npm run tauri ios build

# With specific team
npm run tauri ios build -- --team YOUR_TEAM_ID
```

---

### Task 14: Testing Checklist

| Test Case | Simulator | Device |
|-----------|-----------|--------|
| App launches | ☐ | ☐ |
| Timer starts/stops | ☐ | ☐ |
| Notifications appear | ☐ | ☐ |
| Tab navigation | ☐ | ☐ |
| Settings save | ☐ | ☐ |
| Stats display | ☐ | ☐ |
| Mascot animations | ☐ | ☐ |
| Safe areas (notch) | ☐ | ☐ |
| Dark mode | ☐ | ☐ |
| Background notifications | ☐ | ☐ |
| Orientation (portrait lock) | ☐ | ☐ |

---

### Task 15: App Store Preparation

| Requirement | Status |
|-------------|--------|
| App Icon (1024x1024) | ☐ |
| Screenshots (6.5", 5.5") | ☐ |
| App description | ☐ |
| Privacy policy URL | ☐ |
| Support URL | ☐ |
| Age rating | ☐ |
| TestFlight build | ☐ |
| Beta testing | ☐ |

---

## 📁 FILES SUMMARY

### New Files (12):
```
src/hooks/usePlatform.ts
src/hooks/useHaptic.ts
src/components/Layout/MobileLayout.tsx
src/components/Layout/BottomTabBar.tsx
src/screens/Dashboard/MobileDashboard.tsx
src/services/iosNotifications.ts
src/services/iosBackgroundTimer.ts
src/utils/platformFeatures.ts
```

### Modified Files (6):
```
tailwind.config.js
tauri.conf.json
src/App.tsx
src/locales/vi.json
src/locales/en.json
Cargo.toml
```

---

## 🗓️ TIMELINE

| Week | Phase | Tasks |
|------|-------|-------|
| 1 | Setup + UI | Tasks 1-7 |
| 2 | Notifications + Features | Tasks 8-12 |
| 3 | Build + Test | Tasks 13-15 |

---

*Created by LUMB - 2026-01-30*
