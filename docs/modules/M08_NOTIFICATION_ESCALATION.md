# M08: NOTIFICATION ESCALATION & SNOOZE LOGIC - Task File for MISA

> **Module:** M08 - Notification Escalation & Snooze Logic  
> **Phase:** Phase 2: Personality & Polish  
> **Priority:** P1 (High)  
> **Estimated Time:** 2-3 ngày

---

## 🎯 MỤC TIÊU

Xây dựng hệ thống nhắc nhở leo thang 3 cấp và logic snooze thông minh:
- 3 notification levels: Hint → Toast → Overlay
- Escalation tự động theo thời gian
- Snooze với giới hạn và passive-aggressive messaging
- Native OS notifications (Toast)

---

## 📊 NOTIFICATION ESCALATION FLOW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION ESCALATION FLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    TIMER ENDS                                                            │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────┐     +30s      ┌─────────────┐     +60s     ┌─────────┐ │
│  │   Level 1   │ ─────────────►│   Level 2   │ ────────────►│ Level 3 │ │
│  │    HINT     │  no response  │    TOAST    │  no response │ OVERLAY │ │
│  │  (Subtle)   │               │  (Moderate) │              │ (Strong)│ │
│  │    🟡       │               │     🟠      │              │   🔴    │ │
│  └──────┬──────┘               └──────┬──────┘              └────┬────┘ │
│         │                             │                          │      │
│         ▼                             ▼                          ▼      │
│   Tray icon                    OS Toast                   Fullscreen    │
│   changes color                notification               blur overlay  │
│   + mascot hint                + sound                    + mascot      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 CHECKLIST (12 TASKS)

### Task 1: Notification Level Types [Rust Backend]

**File:** `src-tauri/src/core/notification_types.rs`

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NotificationLevel {
    Hint,    // Level 1: Subtle - tray icon change
    Toast,   // Level 2: Moderate - OS notification
    Overlay, // Level 3: Strong - fullscreen overlay
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationConfig {
    pub hint_to_toast_delay_secs: u64,   // Default: 30s
    pub toast_to_overlay_delay_secs: u64, // Default: 60s
    pub max_escalation_level: NotificationLevel,
}

impl Default for EscalationConfig {
    fn default() -> Self {
        Self {
            hint_to_toast_delay_secs: 30,
            toast_to_overlay_delay_secs: 60,
            max_escalation_level: NotificationLevel::Overlay,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnoozeConfig {
    pub max_snooze_count: u32,        // Default: 3
    pub snooze_durations: Vec<u32>,   // [5, 10] minutes
}

impl Default for SnoozeConfig {
    fn default() -> Self {
        Self {
            max_snooze_count: 3,
            snooze_durations: vec![5, 10],
        }
    }
}
```

---

### Task 2: Escalation Manager [Rust Backend]

**File:** `src-tauri/src/core/escalation_manager.rs`

```rust
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{sleep, Duration};
use tauri::{AppHandle, Emitter};

use super::notification_types::{NotificationLevel, EscalationConfig};

pub struct EscalationManager {
    current_level: NotificationLevel,
    config: EscalationConfig,
    is_escalating: bool,
    snooze_count: u32,
}

impl EscalationManager {
    pub fn new() -> Self {
        Self {
            current_level: NotificationLevel::Hint,
            config: EscalationConfig::default(),
            is_escalating: false,
            snooze_count: 0,
        }
    }
    
    /// Start escalation process
    pub async fn start_escalation(&mut self, app_handle: &AppHandle) {
        self.is_escalating = true;
        self.current_level = NotificationLevel::Hint;
        
        // Level 1: Hint
        self.emit_notification(app_handle, NotificationLevel::Hint);
        
        // Wait for hint_to_toast delay
        sleep(Duration::from_secs(self.config.hint_to_toast_delay_secs)).await;
        
        if self.is_escalating {
            // Level 2: Toast
            self.current_level = NotificationLevel::Toast;
            self.emit_notification(app_handle, NotificationLevel::Toast);
            
            // Wait for toast_to_overlay delay
            sleep(Duration::from_secs(self.config.toast_to_overlay_delay_secs)).await;
            
            if self.is_escalating {
                // Level 3: Overlay
                self.current_level = NotificationLevel::Overlay;
                self.emit_notification(app_handle, NotificationLevel::Overlay);
            }
        }
    }
    
    /// Stop escalation (user responded)
    pub fn stop_escalation(&mut self) {
        self.is_escalating = false;
    }
    
    /// Handle snooze
    pub fn snooze(&mut self, minutes: u32) -> Result<(), String> {
        if self.snooze_count >= 3 {
            return Err("Đã hết lượt hoãn!".to_string());
        }
        
        self.snooze_count += 1;
        self.stop_escalation();
        Ok(())
    }
    
    /// Reset snooze count (user took break)
    pub fn reset_snooze(&mut self) {
        self.snooze_count = 0;
        self.stop_escalation();
    }
    
    /// Get current snooze count
    pub fn get_snooze_count(&self) -> u32 {
        self.snooze_count
    }
    
    /// Emit notification event to frontend
    fn emit_notification(&self, app_handle: &AppHandle, level: NotificationLevel) {
        let event_name = match level {
            NotificationLevel::Hint => "notification:hint",
            NotificationLevel::Toast => "notification:toast",
            NotificationLevel::Overlay => "notification:overlay",
        };
        
        let _ = app_handle.emit(event_name, serde_json::json!({
            "level": level,
            "snooze_count": self.snooze_count,
            "can_snooze": self.snooze_count < 3,
        }));
    }
}
```

---

### Task 3: Escalation Commands [Rust Backend]

**File:** `src-tauri/src/commands/escalation_commands.rs`

```rust
use tauri::{command, AppHandle, State};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::core::EscalationManager;

pub type EscalationManagerState = Arc<Mutex<EscalationManager>>;

/// Get current escalation state
#[command]
pub async fn escalation_get_state(
    manager: State<'_, EscalationManagerState>,
) -> Result<EscalationState, String> {
    let m = manager.lock().await;
    Ok(EscalationState {
        snooze_count: m.get_snooze_count(),
        can_snooze: m.get_snooze_count() < 3,
        max_snooze: 3,
    })
}

/// Snooze notification
#[command]
pub async fn escalation_snooze(
    manager: State<'_, EscalationManagerState>,
    minutes: u32,
) -> Result<SnoozeResult, String> {
    let mut m = manager.lock().await;
    m.snooze(minutes)?;
    
    Ok(SnoozeResult {
        success: true,
        snooze_count: m.get_snooze_count(),
        can_snooze: m.get_snooze_count() < 3,
    })
}

/// Acknowledge break (user took break)
#[command]
pub async fn escalation_acknowledge(
    manager: State<'_, EscalationManagerState>,
) -> Result<(), String> {
    let mut m = manager.lock().await;
    m.reset_snooze();
    Ok(())
}

// Response types
#[derive(serde::Serialize)]
pub struct EscalationState {
    pub snooze_count: u32,
    pub can_snooze: bool,
    pub max_snooze: u32,
}

#[derive(serde::Serialize)]
pub struct SnoozeResult {
    pub success: bool,
    pub snooze_count: u32,
    pub can_snooze: bool,
}
```

---

### Task 4: Native Toast Notifications [Rust Backend]

**Update:** `src-tauri/src/core/notification.rs`

Sử dụng `tauri-plugin-notification` cho OS native toasts:

```rust
use tauri_plugin_notification::NotificationExt;

impl NotificationManager {
    /// Send OS native toast notification
    pub fn send_toast(&self, app_handle: &AppHandle, title: &str, body: &str) {
        let _ = app_handle
            .notification()
            .builder()
            .title(title)
            .body(body)
            .show();
    }
}
```

---

### Task 5: Escalation Store [Frontend State]

**File:** `src/stores/escalationStore.ts`

```typescript
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export type NotificationLevel = 'hint' | 'toast' | 'overlay';

interface EscalationPayload {
    level: NotificationLevel;
    snooze_count: number;
    can_snooze: boolean;
}

interface EscalationState {
    currentLevel: NotificationLevel | null;
    snoozeCount: number;
    canSnooze: boolean;
    maxSnooze: number;
    isInitialized: boolean;
    
    // Actions
    initialize: () => Promise<void>;
    handleHint: (payload: EscalationPayload) => void;
    handleToast: (payload: EscalationPayload) => void;
    handleOverlay: (payload: EscalationPayload) => void;
    snooze: (minutes: number) => Promise<boolean>;
    acknowledge: () => Promise<void>;
}

// Detect if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

export const useEscalationStore = create<EscalationState>((set, get) => ({
    currentLevel: null,
    snoozeCount: 0,
    canSnooze: true,
    maxSnooze: 3,
    isInitialized: false,
    
    initialize: async () => {
        if (get().isInitialized) return;
        
        if (isTauri) {
            // Listen for escalation events
            await listen<EscalationPayload>('notification:hint', (event) => {
                get().handleHint(event.payload);
            });
            
            await listen<EscalationPayload>('notification:toast', (event) => {
                get().handleToast(event.payload);
            });
            
            await listen<EscalationPayload>('notification:overlay', (event) => {
                get().handleOverlay(event.payload);
            });
        }
        
        set({ isInitialized: true });
    },
    
    handleHint: (payload) => {
        console.log('🟡 Level 1: Hint notification');
        set({
            currentLevel: 'hint',
            snoozeCount: payload.snooze_count,
            canSnooze: payload.can_snooze,
        });
        // Update tray icon (via mascot or dedicated tray store)
    },
    
    handleToast: (payload) => {
        console.log('🟠 Level 2: Toast notification');
        set({
            currentLevel: 'toast',
            snoozeCount: payload.snooze_count,
            canSnooze: payload.can_snooze,
        });
        // Toast is handled by OS via Rust backend
    },
    
    handleOverlay: (payload) => {
        console.log('🔴 Level 3: Overlay notification');
        set({
            currentLevel: 'overlay',
            snoozeCount: payload.snooze_count,
            canSnooze: payload.can_snooze,
        });
        // Trigger overlay show
        // This should connect to notificationStore.showOverlay()
    },
    
    snooze: async (minutes: number) => {
        if (!get().canSnooze) {
            console.warn('No more snoozes available!');
            return false;
        }
        
        if (isTauri) {
            try {
                const result = await invoke<{ success: boolean; snooze_count: number; can_snooze: boolean }>(
                    'escalation_snooze',
                    { minutes }
                );
                
                set({
                    snoozeCount: result.snooze_count,
                    canSnooze: result.can_snooze,
                    currentLevel: null,
                });
                
                return result.success;
            } catch (error) {
                console.error('Snooze failed:', error);
                return false;
            }
        } else {
            // Browser mock
            const newCount = get().snoozeCount + 1;
            set({
                snoozeCount: newCount,
                canSnooze: newCount < 3,
                currentLevel: null,
            });
            return true;
        }
    },
    
    acknowledge: async () => {
        if (isTauri) {
            await invoke('escalation_acknowledge');
        }
        
        set({
            snoozeCount: 0,
            canSnooze: true,
            currentLevel: null,
        });
    },
}));
```

---

### Task 6: Snooze Button Component [Frontend UI]

**File:** `src/components/Snooze/SnoozeButton.tsx`

```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle } from 'lucide-react';
import { useEscalationStore } from '../../stores/escalationStore';

interface SnoozeButtonProps {
    minutes?: number;
    onSnooze?: () => void;
}

export const SnoozeButton: FC<SnoozeButtonProps> = ({ 
    minutes = 5,
    onSnooze 
}) => {
    const { t } = useTranslation();
    const { snoozeCount, canSnooze, maxSnooze, snooze } = useEscalationStore();
    
    // Passive-aggressive text based on snooze count
    const getSnoozeText = (): string => {
        if (snoozeCount === 0) {
            return t('snooze.first', { minutes });
        } else if (snoozeCount === 1) {
            return t('snooze.second', { minutes });
        } else if (snoozeCount === 2) {
            return t('snooze.third', { minutes });
        } else {
            return t('snooze.denied');
        }
    };
    
    const handleSnooze = async () => {
        if (canSnooze) {
            await snooze(minutes);
            onSnooze?.();
        }
    };
    
    if (!canSnooze) {
        return (
            <div className="flex items-center justify-center gap-2 text-red-500 py-3">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{t('snooze.no_more')}</span>
            </div>
        );
    }
    
    return (
        <motion.button
            onClick={handleSnooze}
            className="w-full py-3 bg-gray-200/60 hover:bg-gray-300/60 text-gray-700 font-medium rounded-xl border border-gray-300/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                {getSnoozeText()}
            </span>
            <span className="text-xs text-gray-500 mt-1 block">
                ({snoozeCount}/{maxSnooze} {t('snooze.used')})
            </span>
        </motion.button>
    );
};
```

---

### Task 7: Snooze i18n Messages [i18n]

**Update:** `src/locales/vi.json`

```json
{
  "snooze": {
    "first": "Hoãn {{minutes}} phút",
    "second": "Lại hoãn {{minutes}} phút nữa...",
    "third": "Kệ tôi thêm {{minutes}} phút cuối...",
    "denied": "Đã hết lượt hoãn!",
    "no_more": "😤 Hết kiên nhẫn rồi! Nghỉ đi!",
    "used": "lần hoãn"
  },
  "notification": {
    "hint": {
      "title": "Sắp đến giờ nghỉ!",
      "body": "Còn 30 giây để chuẩn bị..."
    },
    "toast": {
      "title": "Đến giờ nghỉ rồi!",
      "body": "Hãy nghỉ mắt một chút nhé 👀"
    },
    "overlay": {
      "title": "NGHỈ NGAY!",
      "body": "Bạn đã làm việc quá lâu rồi! 😤"
    }
  }
}
```

**Update:** `src/locales/en.json`

```json
{
  "snooze": {
    "first": "Snooze {{minutes}} min",
    "second": "Snooze {{minutes}} more min...",
    "third": "Just {{minutes}} more min, please...",
    "denied": "No more snoozes!",
    "no_more": "😤 No patience left! Take a break!",
    "used": "snoozes used"
  },
  "notification": {
    "hint": {
      "title": "Break time coming!",
      "body": "30 seconds to prepare..."
    },
    "toast": {
      "title": "Time for a break!",
      "body": "Rest your eyes for a moment 👀"
    },
    "overlay": {
      "title": "TAKE A BREAK NOW!",
      "body": "You've been working too long! 😤"
    }
  }
}
```

---

### Task 8: Export Snooze Component [Frontend]

**File:** `src/components/Snooze/index.ts`

```typescript
export { SnoozeButton } from './SnoozeButton';
```

---

### Task 9: Update Break Overlay with Snooze [Frontend]

**Update:** `src/components/Overlay/BreakOverlay.tsx`

Thay thế logic snooze cũ với SnoozeButton component:

```typescript
import { SnoozeButton } from '../Snooze';
import { useEscalationStore } from '../../stores/escalationStore';

// Inside BreakOverlay:
const { acknowledge } = useEscalationStore();

const handleTakeBreak = async () => {
    await acknowledge();
    hideOverlay();
};

// In JSX, replace snooze button section:
<div className="flex flex-col gap-3">
    {/* Primary: Take Break */}
    <motion.button
        onClick={handleTakeBreak}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
    >
        ☕ {t('overlay.take_break')}
    </motion.button>
    
    {/* Secondary: Snooze */}
    <SnoozeButton 
        minutes={5} 
        onSnooze={() => hideOverlay()} 
    />
</div>
```

---

### Task 10: Connect Escalation to Timer [Frontend]

**Update:** `src/stores/timerStore.ts`

Khi timer ends, trigger escalation:

```typescript
import { useEscalationStore } from './escalationStore';

// When timer completes (remaining_seconds === 0):
// Emit event to backend to start escalation
// Or directly trigger via escalationStore
```

---

### Task 11: Initialize Escalation Store [Frontend]

**Update:** `src/App.tsx`

```typescript
import { useEscalationStore } from './stores/escalationStore';

// Inside App component:
const initEscalation = useEscalationStore(state => state.initialize);

useEffect(() => {
    const initializeApp = async () => {
        // ... existing inits
        await initEscalation();
    };
    
    initializeApp();
}, [/* deps */]);
```

---

### Task 12: Testing & Verification

**Test Scenarios:**

1. **Escalation Flow Test:**
   - [ ] Timer ends → Level 1 (Hint) triggers
   - [ ] +30s no response → Level 2 (Toast) triggers
   - [ ] +60s no response → Level 3 (Overlay) triggers

2. **Snooze Test:**
   - [ ] Snooze lần 1 → Text: "Hoãn 5 phút"
   - [ ] Snooze lần 2 → Text: "Lại hoãn..." (sad tone)
   - [ ] Snooze lần 3 → Text: "Kệ tôi thêm..." (last chance)
   - [ ] Snooze lần 4 → Từ chối, hiển thị "Hết lượt!"

3. **Take Break Test:**
   - [ ] Click "Take Break" → Snooze count reset về 0
   - [ ] Lần break tiếp theo → Có đủ 3 snoozes

4. **Toast Notification Test:**
   - [ ] OS notification hiển thị với tiêu đề đúng
   - [ ] Click notification → Open app

---

## 📁 FILES TO CREATE/MODIFY

### New Files:
```
src-tauri/src/
├── core/
│   ├── notification_types.rs   [NEW - hoặc update existing]
│   └── escalation_manager.rs   [NEW]
└── commands/
    └── escalation_commands.rs  [NEW]

src/
├── components/
│   └── Snooze/
│       ├── SnoozeButton.tsx    [NEW]
│       └── index.ts            [NEW]
└── stores/
    └── escalationStore.ts      [NEW]
```

### Modify Files:
```
src-tauri/src/
├── core/
│   ├── mod.rs                  [MODIFY - export new modules]
│   └── notification.rs         [MODIFY - add toast]
├── commands/mod.rs             [MODIFY - export new commands]
└── lib.rs                      [MODIFY - register commands]

src/
├── locales/
│   ├── vi.json                 [MODIFY - add snooze/notification]
│   └── en.json                 [MODIFY - add snooze/notification]
├── components/
│   └── Overlay/
│       └── BreakOverlay.tsx    [MODIFY - integrate SnoozeButton]
└── App.tsx                     [MODIFY - init escalation store]
```

---

## ⚠️ NOTES FOR MISA

1. **Escalation là background process** - Cần chạy với tokio::spawn
2. **Native Toast** - Dùng tauri-plugin-notification (đã có sẵn)
3. **Snooze limit** - Hardcode 3 lần, sau có thể config trong Settings
4. **Passive-aggressive tone** - Quan trọng cho UX của app

---

## ✅ COMPLETION CRITERIA

- [ ] 3 notification levels hoạt động đúng thứ tự
- [ ] Escalation tự động với đúng delay (30s, 60s)
- [ ] Snooze giới hạn 3 lần
- [ ] Snooze text thay đổi theo count (passive-aggressive)
- [ ] Native toast notification hoạt động
- [ ] Take Break reset snooze count
- [ ] i18n đầy đủ VI/EN
- [ ] Không có console errors

---

*Created by LUMB for MISA - 2026-01-29*
