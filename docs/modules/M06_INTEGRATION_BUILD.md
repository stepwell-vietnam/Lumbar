# M06: INTEGRATION & MVP BUILD

> **Module:** M06 - Integration & MVP Build  
> **Priority:** P0 (Critical)  
> **Assigned:** MISA  
> **Estimated:** 2 ngày  
> **Prerequisites:** M01 ✅, M02 ✅, M03 ✅, M04, M05  
> **Cập nhật:** 2026-01-29

---

## 📋 MỤC TIÊU

Hoàn thiện MVP Phase 1:

1. **Full Integration** - Kết nối tất cả modules (Timer ↔ Idle ↔ Notifications ↔ Settings)
2. **Timer-Notification Flow** - Timer hết → Tự động show overlay
3. **Settings Apply** - Thay đổi settings → Apply vào timer/idle ngay
4. **Production Build** - Build .dmg (macOS) và .msi (Windows)
5. **Final Testing** - End-to-end testing

---

## 🏗️ KIẾN TRÚC TÍCH HỢP

### Luồng hoạt động hoàn chỉnh

```
┌────────────────────────────────────────────────────────────────────────┐
│                         LUMBAR MVP FLOW                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────────────┐  │
│  │  Timer  │───►│  Idle   │───►│ Notify  │───►│   Break Overlay     │  │
│  │ Engine  │    │ Monitor │    │ Manager │    │   (Full Screen)     │  │
│  └────┬────┘    └────┬────┘    └────┬────┘    └──────────┬──────────┘  │
│       │              │              │                     │             │
│       │              │              │                     │             │
│       ▼              ▼              ▼                     ▼             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       SETTINGS STORE                             │   │
│  │  • Timer intervals/durations                                     │   │
│  │  • Idle threshold                                                │   │
│  │  • Notification level                                            │   │
│  │  • Snooze limit                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Event Flow

```
Timer tick (remaining = 0)
    │
    ▼
Emit "timer:break" event
    │
    ▼
NotificationStore receives event
    │
    ▼
Check notification_level from Settings
    │
    ├─ Level 1 → Hint only (icon change)
    ├─ Level 2 → Toast notification
    └─ Level 3 → Show Break Overlay
    │
    ▼
User responds:
    ├─ "Take Break" → timer.acknowledgeBreak() → Reset timer
    └─ "Snooze" → Check snooze_limit → Delay timer
```

---

## ✅ DANH SÁCH TASKS

### TASK 1: Kết nối Timer → Notification

**Mô tả:** Khi timer hết, tự động trigger notification/overlay.

**File:** `src/stores/timerStore.ts` (MODIFY)

```typescript
// THÊM import
import { useNotificationStore } from './notificationStore';
import { useSettingsStore } from './settingsStore';

// Trong phần initialize(), thêm listener:
await listen<TimerState>('timer:break', (event) => {
    console.log('⏰ Break time!', event.payload);
    set({ state: event.payload });
    
    // Trigger notification based on settings
    const settings = useSettingsStore.getState().settings;
    const notificationStore = useNotificationStore.getState();
    
    const level = settings.notification.notification_level;
    
    if (level >= 3) {
        // Show overlay
        notificationStore.showOverlay({
            level: 'overlay',
            title: event.payload.timer_type === 'micro_break' 
                ? 'Nghỉ mắt thôi!' 
                : 'Đứng dậy vận động!',
            message: 'Hãy chăm sóc sức khỏe của bạn',
            timer_type: event.payload.timer_type,
        });
    } else if (level >= 2) {
        // Toast notification (handled by Rust)
        console.log('📢 Toast notification');
    } else {
        // Hint only
        console.log('💡 Hint notification');
    }
});
```

**Verification:**
- [ ] Timer hết → Overlay tự động xuất hiện
- [ ] Đổi notification_level → Behavior thay đổi

---

### TASK 2: Kết nối Overlay → Timer

**Mô tả:** Khi user click "Take Break" hoặc "Snooze", timer phản hồi đúng.

**File:** `src/stores/notificationStore.ts` (MODIFY)

```typescript
// THÊM import
import { useTimerStore } from './timerStore';

// Update takeBreak action:
takeBreak: async () => {
    set({ snoozeCount: 0 });
    get().hideOverlay();
    
    // Acknowledge break ve backend
    if (isTauri) {
        try {
            await invoke('notification_acknowledge');
            await invoke('timer_acknowledge_break'); // Restart timer cycle
        } catch (err) {
            console.error('Failed to acknowledge break:', err);
        }
    }
    
    // Update timer store
    const timerStore = useTimerStore.getState();
    await timerStore.acknowledgeBreak();
    
    console.log('✅ Break acknowledged, timer restarted');
},

// Update snooze action:
snooze: async (minutes: number) => {
    const { snoozeCount, maxSnooze } = get();
    const settings = useSettingsStore.getState().settings;
    
    // Use snooze_limit from settings
    const actualLimit = settings.notification.snooze_limit;
    
    if (snoozeCount >= actualLimit) {
        console.warn('⚠️ Max snooze limit reached!');
        return;
    }
    
    set({ snoozeCount: snoozeCount + 1 });
    get().hideOverlay();
    
    // TODO: Implement snooze timer (delay X minutes then show again)
    console.log(`⏸️ Snoozed for ${minutes} minutes`);
},
```

**Verification:**
- [ ] Click "Take Break" → Timer reset về 20:00
- [ ] Click "Snooze" → Overlay đóng (snooze logic)

---

### TASK 3: Kết nối Idle → Timer

**Mô tả:** Idle detection tự động pause/resume timer.

**File:** `src/App.tsx` hoặc tạo hook mới

```typescript
// THÊM useEffect để kết nối idle → timer
import { useIdleStore } from './stores/idleStore';
import { useTimerStore } from './stores/timerStore';

// Trong App component:
useEffect(() => {
    const idleState = useIdleStore.getState().state;
    const timerStore = useTimerStore.getState();
    
    // Subscribe to idle state changes
    const unsubscribe = useIdleStore.subscribe((state, prevState) => {
        if (state.state.is_idle !== prevState.state.is_idle) {
            if (state.state.is_idle) {
                // User went idle → pause timer
                console.log('😴 User idle, pausing timer');
                timerStore.pause();
            } else {
                // User returned → resume timer
                console.log('👋 User returned, resuming timer');
                timerStore.resume();
            }
        }
    });
    
    return () => unsubscribe();
}, []);
```

**Verification:**
- [ ] Không thao tác 2 phút → Timer pause
- [ ] Di chuột → Timer resume

---

### TASK 4: Apply Settings vào Timer

**Mô tả:** Khi save settings, apply vào timer engine.

**File:** `src/stores/settingsStore.ts` (MODIFY)

```typescript
// Update save action:
save: async () => {
    if (!isTauri) {
        set({ isDirty: false });
        return;
    }
    
    try {
        const settings = get().settings;
        
        // 1. Save to file
        await invoke('settings_save', { settings });
        
        // 2. Apply timer settings to backend
        await invoke('timer_update_settings', {
            settings: {
                micro_break_interval: settings.timer.micro_break_interval_min * 60, // to seconds
                micro_break_duration: settings.timer.micro_break_duration_sec,
                rest_break_interval: settings.timer.rest_break_interval_min * 60,
                rest_break_duration: settings.timer.rest_break_duration_min * 60,
            }
        });
        
        // 3. Apply idle settings
        await invoke('idle_update_settings', {
            settings: {
                idle_threshold_seconds: settings.general.idle_threshold_min * 60,
                enabled: true,
            }
        });
        
        set({ isDirty: false });
        console.log('✅ Settings saved and applied');
    } catch (err) {
        console.error('Failed to save settings:', err);
        throw err;
    }
},
```

**Verification:**
- [ ] Đổi interval từ 20 → 15 min → Timer hiển thị 15:00
- [ ] Đổi idle threshold → Idle detection thay đổi

---

### TASK 5: Load Settings on Startup

**Mô tả:** App khởi động → Load settings và apply.

**File:** `src/App.tsx` (MODIFY)

```typescript
import { useSettingsStore } from './stores/settingsStore';
import { useTimerStore } from './stores/timerStore';
import { useIdleStore } from './stores/idleStore';
import { useNotificationStore } from './stores/notificationStore';

function App() {
    const initSettings = useSettingsStore(s => s.initialize);
    const initTimer = useTimerStore(s => s.initialize);
    const initIdle = useIdleStore(s => s.initialize);
    const initNotifications = useNotificationStore(s => s.initialize);
    
    useEffect(() => {
        const initializeApp = async () => {
            console.log('🚀 Initializing Lumbar...');
            
            // 1. Load settings first
            await initSettings();
            
            // 2. Initialize other stores
            await Promise.all([
                initTimer(),
                initIdle(),
                initNotifications(),
            ]);
            
            console.log('✅ Lumbar ready!');
        };
        
        initializeApp();
    }, []);
    
    // ... rest of App
}
```

**Verification:**
- [ ] App start → Settings load từ file
- [ ] Timer/Idle có đúng settings

---

### TASK 6: Snooze Timer Implementation

**Mô tả:** Implement snooze delay timer.

**File:** `src/stores/notificationStore.ts` (MODIFY)

```typescript
// Thêm state
snoozeTimeoutId: number | null;

// Update snooze action:
snooze: async (minutes: number) => {
    const { snoozeCount, snoozeTimeoutId } = get();
    const settings = useSettingsStore.getState().settings;
    const actualLimit = settings.notification.snooze_limit;
    
    if (snoozeCount >= actualLimit) {
        console.warn('⚠️ Max snooze limit reached!');
        return;
    }
    
    // Clear previous timeout if exists
    if (snoozeTimeoutId) {
        clearTimeout(snoozeTimeoutId);
    }
    
    set({ snoozeCount: snoozeCount + 1 });
    get().hideOverlay();
    
    // Set timeout to show overlay again after X minutes
    const timeoutId = window.setTimeout(() => {
        console.log('⏰ Snooze ended, showing overlay again');
        get().showOverlay({
            level: 'overlay',
            title: 'Vẫn chưa nghỉ à?',
            message: `Đã snooze ${snoozeCount + 1} lần rồi đấy!`,
            timer_type: 'micro_break',
        });
    }, minutes * 60 * 1000);
    
    set({ snoozeTimeoutId: timeoutId });
    console.log(`⏸️ Snoozed for ${minutes} minutes (${snoozeCount + 1}/${actualLimit})`);
},
```

**Verification:**
- [ ] Click Snooze 5min → 5 phút sau overlay hiện lại
- [ ] Snooze 3 lần → Không cho snooze nữa

---

### TASK 7: Complete Dashboard UI

**Mô tả:** Tích hợp tất cả vào Dashboard screen.

**File:** `src/screens/Dashboard.tsx` hoặc `src/App.tsx`

```typescript
import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Moon, Sun } from 'lucide-react';

import { GlassCard } from '../components/ui/GlassCard';
import { TimerDisplay, TimerControls } from '../components/Timer';
import { IdleIndicator } from '../components/IdleIndicator';
import { BreakOverlay } from '../components/Overlay';
import { SettingsPanel } from '../components/Settings';

import { useTimerStore } from '../stores/timerStore';
import { useIdleStore } from '../stores/idleStore';

export const Dashboard: FC = () => {
    const { t } = useTranslation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const timerState = useTimerStore(s => s.state);
    const idleState = useIdleStore(s => s.state);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] flex items-center justify-center p-4">
            
            {/* Main Dashboard Card */}
            <GlassCard className="w-full max-w-md p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">🪵</span>
                        <h1 className="text-2xl font-bold text-white">Lumbar</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <IdleIndicator />
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
                
                {/* Timer Display */}
                <TimerDisplay />
                
                {/* Timer Controls */}
                <div className="mt-6">
                    <TimerControls />
                </div>
                
                {/* Status Message */}
                <div className="mt-6 text-center text-white/60 text-sm">
                    {timerState.status === 'running' && t('dashboard.working')}
                    {timerState.status === 'paused' && t('dashboard.paused')}
                    {timerState.status === 'break' && t('dashboard.on_break')}
                    {timerState.status === 'idle' && t('dashboard.ready')}
                </div>
            </GlassCard>
            
            {/* Settings Panel */}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
            
            {/* Break Overlay */}
            <BreakOverlay />
        </div>
    );
};
```

**Verification:**
- [ ] Dashboard hiển thị Timer + Controls + Settings button
- [ ] IdleIndicator hiển thị góc trên phải
- [ ] Click Settings → Panel mở

---

### TASK 8: Thêm i18n Dashboard Strings

**File:** `src/locales/vi.json` (THÊM)

```json
{
  "dashboard": {
    "working": "Đang làm việc...",
    "paused": "Tạm dừng",
    "on_break": "Đang nghỉ ngơi 🎉",
    "ready": "Sẵn sàng bắt đầu"
  }
}
```

**File:** `src/locales/en.json` (THÊM)

```json
{
  "dashboard": {
    "working": "Working...",
    "paused": "Paused",
    "on_break": "On break 🎉",
    "ready": "Ready to start"
  }
}
```

---

### TASK 9: Configure Production Build

**Mô tả:** Cấu hình build cho production.

**File:** `src-tauri/tauri.conf.json` (VERIFY/MODIFY)

```json
{
  "productName": "Lumbar",
  "version": "1.0.0",
  "identifier": "com.lumbar.app",
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "shortDescription": "Break Reminder - Your health companion",
    "longDescription": "Lumbar helps you take regular breaks to protect your eyes and body.",
    "macOS": {
      "minimumSystemVersion": "10.13"
    },
    "windows": {
      "wix": {
        "language": "en-US"
      }
    }
  }
}
```

**Verification:**
- [ ] App name hiển thị đúng
- [ ] Icon hiển thị đúng

---

### TASK 10: Create App Icons

**Mô tả:** Tạo icons cho app.

**Directory:** `src-tauri/icons/`

Cần các file:
- `32x32.png` - 32x32 pixels
- `128x128.png` - 128x128 pixels
- `128x128@2x.png` - 256x256 pixels
- `icon.icns` - macOS icon bundle
- `icon.ico` - Windows icon

**Tạm thời:** Có thể dùng emoji 🪵 hoặc placeholder icon.

---

### TASK 11: Build Production

**Mô tả:** Build app cho production.

**Commands:**

```bash
# Development test
npm run tauri dev

# Build production (macOS)
npm run tauri build

# Build production (với debug symbols nếu cần)
npm run tauri build -- --debug
```

**Output locations:**
- macOS: `src-tauri/target/release/bundle/dmg/Lumbar_1.0.0_x64.dmg`
- Windows: `src-tauri/target/release/bundle/msi/Lumbar_1.0.0_x64_en-US.msi`

**Verification:**
- [ ] Build thành công không lỗi
- [ ] Install file tạo ra đúng
- [ ] App chạy được sau khi install

---

### TASK 12: End-to-End Testing

**Mô tả:** Test toàn bộ flow từ đầu đến cuối.

**Test Scenarios:**

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | App startup | Dashboard hiển thị, timer 20:00 |
| 2 | Click Play | Timer bắt đầu đếm ngược |
| 3 | Wait 20 min (hoặc skip) | Overlay xuất hiện |
| 4 | Click "Take Break" | Overlay đóng, timer reset |
| 5 | Click Play → Snooze x3 | Snooze limit reached |
| 6 | Change settings | Settings lưu và apply |
| 7 | Restart app | Settings load đúng |
| 8 | Idle 2 min | Timer auto-pause |
| 9 | Move mouse | Timer auto-resume |
| 10 | Switch language | UI đổi ngôn ngữ |

---

## 📁 DELIVERABLES

### Modified Files:
- [ ] `src/stores/timerStore.ts` - Timer↔Notification integration
- [ ] `src/stores/notificationStore.ts` - Snooze timer, Take break action
- [ ] `src/stores/settingsStore.ts` - Apply settings to backend
- [ ] `src/App.tsx` - Full initialization flow
- [ ] `src/screens/Dashboard.tsx` - Complete Dashboard UI
- [ ] `src/locales/vi.json` - Dashboard strings
- [ ] `src/locales/en.json` - Dashboard strings
- [ ] `src-tauri/tauri.conf.json` - Production config

### New Files:
- [ ] `src-tauri/icons/` - App icons (32x32, 128x128, etc.)

### Build Outputs:
- [ ] `.dmg` file for macOS
- [ ] `.msi` file for Windows (nếu có Windows machine)

---

## 📝 BÁO CÁO HOÀN THÀNH

Sau khi hoàn thành, MISA ghi vào file `docs/modules/M06_COMPLETED.md`:

```markdown
# M06: INTEGRATION & MVP BUILD - BÁO CÁO HOÀN THÀNH

## ✅ Integration Checklist

- [ ] Timer → Notification connected
- [ ] Overlay → Timer connected
- [ ] Idle → Timer connected
- [ ] Settings → Timer/Idle applied
- [ ] Startup initialization

## 🧪 E2E Test Results

| # | Test | Status |
|---|------|--------|
| 1 | App startup | ✅ / ❌ |
| 2 | Timer countdown | ✅ / ❌ |
| 3 | Break overlay | ✅ / ❌ |
| 4 | Take break | ✅ / ❌ |
| 5 | Snooze limit | ✅ / ❌ |
| 6 | Settings save/load | ✅ / ❌ |
| 7 | Idle pause/resume | ✅ / ❌ |
| 8 | Language switch | ✅ / ❌ |

## 📦 Build Results

| Platform | File | Size | Status |
|----------|------|------|--------|
| macOS | Lumbar_1.0.0_x64.dmg | ___ MB | ✅ / ❌ |
| Windows | Lumbar_1.0.0_x64.msi | ___ MB | ✅ / ❌ |

## 📸 Screenshots

[Đính kèm screenshots]

## 🏆 MVP STATUS

✅ / ❌ MVP PHASE 1 COMPLETE
```

---

## 🚀 LỆNH CHO MISA

```
MISA, thực hiện M06: Integration & MVP Build.

## Đây là module CUỐI CÙNG của Phase 1 MVP!

## Tóm tắt:
- 12 tasks trong file docs/modules/M06_INTEGRATION_BUILD.md
- Kết nối tất cả modules lại với nhau
- Timer ↔ Notification ↔ Overlay ↔ Settings
- Idle ↔ Timer (auto pause/resume)
- Build production files (.dmg, .msi)

## Ưu tiên cao:
1. Task 1-4: Integration giữa các stores
2. Task 5-6: Startup flow + Snooze timer
3. Task 7-8: Dashboard UI hoàn chỉnh
4. Task 9-11: Production build
5. Task 12: End-to-End testing

## Sau khi hoàn thành:
- Tạo file docs/modules/M06_COMPLETED.md
- Chụp screenshots Dashboard hoàn chỉnh
- Báo cáo E2E test results
- Attach build files nếu có

## 🎯 MỤC TIÊU:
MVP Phase 1 hoàn chỉnh, sẵn sàng release!

Thực hiện từ Task 1 → Task 12.
```

---

*Generated by LUMB (Lumbar Advisor) - 2026-01-29*
