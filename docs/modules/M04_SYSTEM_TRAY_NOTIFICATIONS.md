# M04: SYSTEM TRAY & NOTIFICATIONS

> **Module:** M04 - System Tray & Notifications  
> **Priority:** P0 (Critical)  
> **Assigned:** MISA  
> **Estimated:** 2-3 ngày  
> **Prerequisites:** M01 ✅, M02 ✅, M03 ✅  
> **Cập nhật:** 2026-01-29

---

## 📋 MỤC TIÊU

Xây dựng System Tray integration và Notification System cho Lumbar:

1. **System Tray Icon** - Icon trong khay hệ thống (macOS/Windows)
2. **Tray Menu** - Menu dropdown với timer info và quick actions
3. **Native Notifications** - Toast notifications level 1-2
4. **Break Overlay** - Fullscreen overlay level 3

---

## 🏗️ KIẾN TRÚC

### Luồng Notification Escalation

```
Timer hết giờ (remaining_seconds = 0)
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 1: HINT                                               │
│  • Tray icon đổi màu (xanh → cam)                           │
│  • Tray icon nhấp nháy                                       │
│  • Chờ 30 giây                                               │
└───────────────────────────────┬─────────────────────────────┘
                                │ User không phản hồi
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 2: TOAST                                              │
│  • Native notification góc màn hình                          │
│  • Có icon mascot + message                                  │
│  • Chờ 60 giây                                               │
└───────────────────────────────┬─────────────────────────────┘
                                │ User không phản hồi
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 3: OVERLAY                                            │
│  • Fullscreen overlay với backdrop blur                      │
│  • Mascot lớn + Health tip                                   │
│  • Buttons: Take Break + Snooze                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ DANH SÁCH TASKS

### TASK 1: Thêm Dependencies

**Mô tả:** Thêm các crates cần thiết cho system tray và notifications.

**File:** `src-tauri/Cargo.toml`

```toml
[dependencies]
# Đã có sẵn
tauri = { version = "2", features = ["tray-icon"] }

# Thêm mới
tauri-plugin-notification = "2"
```

**Verification:**
- [ ] Chạy `cargo build` không lỗi
- [ ] Check Cargo.lock có tauri-plugin-notification

---

### TASK 2: Tạo Tray Types

**Mô tả:** Định nghĩa types cho tray và notifications.

**File MỚI:** `src-tauri/src/core/tray_types.rs`

```rust
use serde::{Deserialize, Serialize};

/// Trạng thái của tray icon
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TrayIconState {
    /// Trạng thái bình thường (đang đếm)
    Normal,
    /// Timer hết - cần nhắc nghỉ (màu cam)
    Alert,
    /// User đang nghỉ (màu xanh lá)
    Break,
    /// Timer đang tạm dừng (màu xám)
    Paused,
}

/// Level của notification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NotificationLevel {
    /// Level 1: Icon hint (đổi màu + nhấp nháy)
    Hint,
    /// Level 2: Native toast notification  
    Toast,
    /// Level 3: Fullscreen overlay
    Overlay,
}

/// Dữ liệu gửi đến frontend để hiển thị notification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationPayload {
    pub level: NotificationLevel,
    pub title: String,
    pub message: String,
    pub timer_type: String,
}

impl Default for TrayIconState {
    fn default() -> Self {
        Self::Normal
    }
}

impl Default for NotificationLevel {
    fn default() -> Self {
        Self::Overlay
    }
}
```

**Verification:**
- [ ] File đã tạo tại đúng vị trí
- [ ] Types được export trong `mod.rs`

---

### TASK 3: Tạo Notification Manager (Rust)

**Mô tả:** Logic xử lý notification escalation.

**File MỚI:** `src-tauri/src/core/notification.rs`

```rust
use tauri::{AppHandle, Emitter};
use tauri_plugin_notification::NotificationExt;

use super::tray_types::{NotificationLevel, NotificationPayload, TrayIconState};

pub struct NotificationManager {
    current_level: NotificationLevel,
    escalation_count: u32,
}

impl NotificationManager {
    pub fn new() -> Self {
        Self {
            current_level: NotificationLevel::Hint,
            escalation_count: 0,
        }
    }

    /// Reset về level 1 khi user đã nghỉ
    pub fn reset(&mut self) {
        self.current_level = NotificationLevel::Hint;
        self.escalation_count = 0;
    }

    /// Leo thang notification level
    pub fn escalate(&mut self) -> NotificationLevel {
        self.current_level = match self.current_level {
            NotificationLevel::Hint => NotificationLevel::Toast,
            NotificationLevel::Toast => NotificationLevel::Overlay,
            NotificationLevel::Overlay => NotificationLevel::Overlay,
        };
        self.escalation_count += 1;
        self.current_level
    }

    /// Gửi notification
    pub async fn send_notification(
        &self,
        app_handle: &AppHandle,
        title: &str,
        message: &str,
        timer_type: &str,
    ) -> Result<(), String> {
        let payload = NotificationPayload {
            level: self.current_level,
            title: title.to_string(),
            message: message.to_string(),
            timer_type: timer_type.to_string(),
        };

        match self.current_level {
            NotificationLevel::Hint => {
                // Emit event để frontend đổi tray icon
                let _ = app_handle.emit("notification:hint", payload);
            }
            NotificationLevel::Toast => {
                // Gửi native notification
                let _ = app_handle
                    .notification()
                    .builder()
                    .title(title)
                    .body(message)
                    .show();
                
                // Emit event cho frontend
                let _ = app_handle.emit("notification:toast", payload);
            }
            NotificationLevel::Overlay => {
                // Emit event để frontend hiển thị overlay
                let _ = app_handle.emit("notification:overlay", payload);
            }
        }

        Ok(())
    }

    /// Cập nhật tray icon state
    pub fn update_tray_icon(&self, app_handle: &AppHandle, state: TrayIconState) {
        let _ = app_handle.emit("tray:update_icon", state);
    }
}

impl Default for NotificationManager {
    fn default() -> Self {
        Self::new()
    }
}
```

**Verification:**
- [ ] Compile thành công
- [ ] Export trong `mod.rs`

---

### TASK 4: Tạo Tray Commands

**Mô tả:** Tauri commands cho tray menu actions.

**File MỚI:** `src-tauri/src/commands/tray_commands.rs`

```rust
use tauri::{command, AppHandle, State, Manager};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::core::{TimerEngine, NotificationManager, TrayIconState};
use crate::commands::TimerEngineState;

pub type NotificationManagerState = Arc<Mutex<NotificationManager>>;

/// Lấy thông tin hiển thị cho tray menu
#[command]
pub async fn tray_get_info(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TrayMenuInfo, String> {
    let engine = timer_engine.lock().await;
    let state = engine.get_state().await;
    let settings = engine.get_settings().await;
    
    let next_break_text = format_time(state.remaining_seconds);
    let timer_type = match state.timer_type {
        crate::core::TimerType::MicroBreak => "micro_break",
        crate::core::TimerType::RestBreak => "rest_break",
    };
    
    Ok(TrayMenuInfo {
        next_break: next_break_text,
        timer_type: timer_type.to_string(),
        status: format!("{:?}", state.status).to_lowercase(),
        is_break_time: state.is_break_time,
    })
}

/// Trigger notification ngay (skip to notification)
#[command]
pub async fn tray_trigger_break(
    app_handle: AppHandle,
    notification_manager: State<'_, NotificationManagerState>,
) -> Result<(), String> {
    let manager = notification_manager.lock().await;
    manager.send_notification(
        &app_handle,
        "Đến giờ nghỉ rồi!",
        "Đứng dậy vận động chút nhé!",
        "micro_break"
    ).await?;
    Ok(())
}

/// Show break overlay
#[command]
pub async fn tray_show_overlay(
    app_handle: AppHandle,
) -> Result<(), String> {
    let payload = crate::core::NotificationPayload {
        level: crate::core::NotificationLevel::Overlay,
        title: "Đến giờ nghỉ!".to_string(),
        message: "Hãy nghỉ ngơi một chút".to_string(),
        timer_type: "micro_break".to_string(),
    };
    let _ = app_handle.emit("notification:overlay", payload);
    Ok(())
}

/// Reset notification manager sau khi user đã nghỉ
#[command]
pub async fn notification_acknowledge(
    notification_manager: State<'_, NotificationManagerState>,
) -> Result<(), String> {
    let mut manager = notification_manager.lock().await;
    manager.reset();
    Ok(())
}

// Helper structs
#[derive(serde::Serialize)]
pub struct TrayMenuInfo {
    pub next_break: String,
    pub timer_type: String,
    pub status: String,
    pub is_break_time: bool,
}

fn format_time(seconds: u32) -> String {
    let mins = seconds / 60;
    let secs = seconds % 60;
    format!("{:02}:{:02}", mins, secs)
}
```

**Verification:**
- [ ] Compile thành công
- [ ] Export trong commands/mod.rs

---

### TASK 5: Register Commands và Plugin

**Mô tả:** Cập nhật lib.rs để register notification plugin và commands.

**File:** `src-tauri/src/lib.rs`

```rust
// THÊM imports
use core::NotificationManager;
use commands::{
    // ... existing imports ...
    // Tray commands
    tray_get_info,
    tray_trigger_break,
    tray_show_overlay,
    notification_acknowledge,
    NotificationManagerState,
};

// Trong hàm run():
pub fn run() {
    let timer_engine: TimerEngineState = Arc::new(Mutex::new(TimerEngine::new()));
    let idle_monitor: IdleMonitorState = Arc::new(Mutex::new(IdleMonitor::new()));
    let notification_manager: NotificationManagerState = Arc::new(Mutex::new(NotificationManager::new())); // THÊM

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init()) // THÊM
        .manage(timer_engine)
        .manage(idle_monitor)
        .manage(notification_manager) // THÊM
        .invoke_handler(tauri::generate_handler![
            // ... existing commands ...
            // Tray commands - THÊM
            tray_get_info,
            tray_trigger_break,
            tray_show_overlay,
            notification_acknowledge,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Verification:**
- [ ] `cargo build` thành công
- [ ] App khởi động không lỗi

---

### TASK 6: Cập nhật core/mod.rs

**Mô tả:** Export các types và modules mới.

**File:** `src-tauri/src/core/mod.rs`

```rust
mod timer;
mod timer_types;
mod idle;
mod idle_types;
mod tray_types;      // THÊM
mod notification;    // THÊM

pub use timer::TimerEngine;
pub use timer_types::{TimerState, TimerStatus, TimerType, TimerSettings};
pub use idle::IdleMonitor;
pub use idle_types::{IdleState, IdleSettings};
pub use tray_types::{TrayIconState, NotificationLevel, NotificationPayload};  // THÊM
pub use notification::NotificationManager;  // THÊM
```

**Verification:**
- [ ] Compile thành công

---

### TASK 7: Tạo Notification Store (Frontend)

**Mô tả:** Zustand store để quản lý notification state.

**File MỚI:** `src/stores/notificationStore.ts`

```typescript
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

export type NotificationLevel = 'hint' | 'toast' | 'overlay';

export interface NotificationPayload {
    level: NotificationLevel;
    title: string;
    message: string;
    timer_type: string;
}

interface NotificationState {
    // State
    isOverlayVisible: boolean;
    currentPayload: NotificationPayload | null;
    snoozeCount: number;
    maxSnooze: number;

    // Actions
    initialize: () => Promise<void>;
    showOverlay: (payload: NotificationPayload) => void;
    hideOverlay: () => void;
    snooze: (minutes: number) => Promise<void>;
    takeBreak: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    // Initial state
    isOverlayVisible: false,
    currentPayload: null,
    snoozeCount: 0,
    maxSnooze: 3,

    // Initialize listeners
    initialize: async () => {
        if (!isTauri) {
            console.log('🌐 Notification store: browser mode - limited functionality');
            return;
        }

        // Listen for overlay event
        await listen<NotificationPayload>('notification:overlay', (event) => {
            console.log('📢 Received overlay notification:', event.payload);
            get().showOverlay(event.payload);
        });

        // Listen for hint event (for tray icon updates)
        await listen<NotificationPayload>('notification:hint', (event) => {
            console.log('💡 Received hint notification:', event.payload);
            // Hint is handled by tray, no UI action needed
        });

        // Listen for toast event
        await listen<NotificationPayload>('notification:toast', (event) => {
            console.log('🔔 Received toast notification:', event.payload);
            // Toast is handled by OS, but we can track it
        });

        console.log('✅ Notification store initialized');
    },

    // Show overlay
    showOverlay: (payload: NotificationPayload) => {
        set({
            isOverlayVisible: true,
            currentPayload: payload,
        });
    },

    // Hide overlay
    hideOverlay: () => {
        set({
            isOverlayVisible: false,
            currentPayload: null,
        });
    },

    // Snooze action
    snooze: async (minutes: number) => {
        const { snoozeCount, maxSnooze } = get();
        
        if (snoozeCount >= maxSnooze) {
            console.warn('⚠️ Max snooze limit reached!');
            return;
        }

        set({ snoozeCount: snoozeCount + 1 });
        get().hideOverlay();

        // TODO: Call timer snooze command when implemented
        console.log(`⏸️ Snoozed for ${minutes} minutes. Count: ${snoozeCount + 1}/${maxSnooze}`);
    },

    // Take break action
    takeBreak: async () => {
        set({ snoozeCount: 0 }); // Reset snooze count
        get().hideOverlay();

        // Notify backend
        if (isTauri) {
            try {
                await invoke('notification_acknowledge');
            } catch (err) {
                console.error('Failed to acknowledge notification:', err);
            }
        }

        console.log('✅ Break taken, snooze count reset');
    },
}));
```

**Verification:**
- [ ] TypeScript compile thành công
- [ ] Store được export

---

### TASK 8: Tạo Break Overlay Component

**Mô tả:** Fullscreen overlay hiển thị khi đến giờ nghỉ.

**File MỚI:** `src/components/Overlay/BreakOverlay.tsx`

```typescript
import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../stores/notificationStore';
import { useTranslation } from 'react-i18next';
import { Clock, Coffee, SkipForward } from 'lucide-react';

export const BreakOverlay: FC = () => {
    const { t } = useTranslation();
    const { isOverlayVisible, currentPayload, snoozeCount, maxSnooze, snooze, takeBreak } = useNotificationStore();

    const canSnooze = snoozeCount < maxSnooze;

    // Passive-aggressive messages based on snooze count
    const getSnoozeText = () => {
        if (snoozeCount === 0) return t('overlay.snooze_5min');
        if (snoozeCount === 1) return t('overlay.snooze_again');
        return t('overlay.snooze_really');
    };

    const getMascotState = () => {
        if (snoozeCount === 0) return '😊';
        if (snoozeCount === 1) return '😐';
        return '😤';
    };

    return (
        <AnimatePresence>
            {isOverlayVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Main card */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-white/30 shadow-2xl"
                    >
                        {/* Mascot */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="text-8xl text-center mb-6"
                        >
                            {getMascotState()}
                        </motion.div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-white text-center mb-2">
                            {currentPayload?.title || t('overlay.time_for_break')}
                        </h1>

                        {/* Message */}
                        <p className="text-white/80 text-center mb-8">
                            {currentPayload?.message || t('overlay.take_care')}
                        </p>

                        {/* Health Tip Card */}
                        <div className="bg-white/10 rounded-2xl p-4 mb-8 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Coffee className="w-5 h-5 text-[#FF6B35]" />
                                <span className="font-semibold text-white">{t('overlay.health_tip')}</span>
                            </div>
                            <p className="text-white/70 text-sm">
                                {t('overlay.tip_look_away')}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3">
                            {/* Take Break Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={takeBreak}
                                className="w-full py-4 bg-[#4ECDC4] hover:bg-[#3dbdb5] text-white font-bold rounded-xl shadow-lg transition-colors"
                            >
                                ☕ {t('overlay.take_break')}
                            </motion.button>

                            {/* Snooze Button (passive-aggressive) */}
                            {canSnooze ? (
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => snooze(5)}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white/70 font-medium rounded-xl border border-white/20 transition-all"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <SkipForward className="w-4 h-4" />
                                        {getSnoozeText()}
                                    </span>
                                    <span className="text-xs text-white/40 mt-1">
                                        ({snoozeCount}/{maxSnooze} {t('overlay.snooze_used')})
                                    </span>
                                </motion.button>
                            ) : (
                                <div className="text-center text-white/50 text-sm py-2">
                                    😤 {t('overlay.no_more_snooze')}
                                </div>
                            )}
                        </div>

                        {/* Break Timer */}
                        <div className="flex items-center justify-center gap-2 mt-6 text-white/50">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                                {t('overlay.break_for')} 20 {t('common.seconds')}
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
```

**Verification:**
- [ ] Component render không lỗi
- [ ] Animation hoạt động

---

### TASK 9: Tạo Component Index

**File MỚI:** `src/components/Overlay/index.ts`

```typescript
export { BreakOverlay } from './BreakOverlay';
```

---

### TASK 10: Thêm i18n Strings

**Mô tả:** Thêm strings cho overlay.

**File:** `src/locales/vi.json`

```json
{
  "overlay": {
    "time_for_break": "Đến giờ nghỉ rồi!",
    "take_care": "Hãy chăm sóc đôi mắt và cơ thể của bạn nhé",
    "health_tip": "Bài tập ngắn",
    "tip_look_away": "Nhìn ra xa 6 mét trong 20 giây để thư giãn mắt",
    "take_break": "Nghỉ ngơi đây!",
    "snooze_5min": "Kệ tôi thêm 5 phút...",
    "snooze_again": "Lại hoãn nữa à?",
    "snooze_really": "Mắt tôi không quan trọng 💀",
    "snooze_used": "lần đã dùng",
    "no_more_snooze": "Hết lượt hoãn rồi! Nghỉ đi!",
    "break_for": "Nghỉ khoảng"
  }
}
```

**File:** `src/locales/en.json`

```json
{
  "overlay": {
    "time_for_break": "Time for a break!",
    "take_care": "Take care of your eyes and body",
    "health_tip": "Quick Exercise",
    "tip_look_away": "Look at something 20 feet away for 20 seconds",
    "take_break": "Take a break!",
    "snooze_5min": "Let me work 5 more minutes...",
    "snooze_again": "Snoozing again?",
    "snooze_really": "My eyes don't matter 💀",
    "snooze_used": "used",
    "no_more_snooze": "No more snoozes! Take a break!",
    "break_for": "Break for"
  }
}
```

**Verification:**
- [ ] i18n strings load đúng
- [ ] Cả VI và EN đều có đủ keys

---

### TASK 11: Integrate Overlay vào App

**Mô tả:** Thêm BreakOverlay vào App.tsx.

**File:** `src/App.tsx`

```tsx
// THÊM imports
import { BreakOverlay } from './components/Overlay';
import { useNotificationStore } from './stores/notificationStore';
import { useEffect } from 'react';

function App() {
    const initializeNotifications = useNotificationStore(state => state.initialize);

    useEffect(() => {
        initializeNotifications();
    }, [initializeNotifications]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb]">
            {/* Existing content */}
            {/* ... */}
            
            {/* Break Overlay - THÊM */}
            <BreakOverlay />
        </div>
    );
}
```

**Verification:**
- [ ] App render không lỗi
- [ ] Overlay không hiển thị khi khởi động (ẩn mặc định)

---

### TASK 12: Test Overlay Manually

**Mô tả:** Thêm button test để trigger overlay (chỉ cho dev).

**File:** `src/App.tsx` hoặc Dashboard

```tsx
// THÊM button test (có thể xóa sau khi test xong)
const showTestOverlay = useNotificationStore(state => state.showOverlay);

// Trong JSX:
<button
    onClick={() => showTestOverlay({
        level: 'overlay',
        title: 'Test Break!',
        message: 'This is a test notification',
        timer_type: 'micro_break'
    })}
    className="px-4 py-2 bg-red-500 text-white rounded-lg"
>
    🧪 Test Overlay
</button>
```

---

## 🧪 VERIFICATION CHECKLIST

### Backend Tests:

| # | Test | Expected | Command |
|---|------|----------|---------|
| 1 | Cargo build | ✅ Success | `cd src-tauri && cargo build` |
| 2 | Notification plugin | ✅ Loaded | Check app startup logs |
| 3 | Commands registered | ✅ Available | No invoke errors |

### Frontend Tests:

| # | Test | Expected |
|---|------|----------|
| 1 | Click "Test Overlay" | Overlay xuất hiện với animation |
| 2 | Click "Take Break" | Overlay đóng |
| 3 | Click Snooze x3 | Snooze count tăng, sau 3 lần không cho snooze nữa |
| 4 | Overlay blur | Background bị blur mờ |
| 5 | i18n switch | Text đổi sang EN/VI đúng |

### Integration Tests:

| # | Test | Expected |
|---|------|----------|
| 1 | Timer hết giờ | Overlay tự động hiển thị (khi hook vào timer) |
| 2 | Snooze → Timer resume | Timer tiếp tục đếm |
| 3 | Take Break → Timer reset | Timer reset về 20:00 |

---

## 📁 DELIVERABLES

### Rust Files:
- [ ] `src-tauri/src/core/tray_types.rs` (NEW)
- [ ] `src-tauri/src/core/notification.rs` (NEW)
- [ ] `src-tauri/src/commands/tray_commands.rs` (NEW)
- [ ] `src-tauri/src/core/mod.rs` (MODIFIED)
- [ ] `src-tauri/src/commands/mod.rs` (MODIFIED)
- [ ] `src-tauri/src/lib.rs` (MODIFIED)
- [ ] `src-tauri/Cargo.toml` (MODIFIED)

### React Files:
- [ ] `src/stores/notificationStore.ts` (NEW)
- [ ] `src/components/Overlay/BreakOverlay.tsx` (NEW)
- [ ] `src/components/Overlay/index.ts` (NEW)
- [ ] `src/locales/vi.json` (MODIFIED)
- [ ] `src/locales/en.json` (MODIFIED)
- [ ] `src/App.tsx` (MODIFIED)

---

## 📝 BÁO CÁO HOÀN THÀNH

Sau khi hoàn thành, MISA ghi vào file `docs/modules/M04_COMPLETED.md`:

```markdown
# M04: SYSTEM TRAY & NOTIFICATIONS - BÁO CÁO HOÀN THÀNH

## ✅ Checklist

- [ ] Task 1: Dependencies
- [ ] Task 2: Tray Types
- [ ] Task 3: Notification Manager
- [ ] Task 4: Tray Commands
- [ ] Task 5: Register Commands
- [ ] Task 6: Update core/mod.rs
- [ ] Task 7: Notification Store
- [ ] Task 8: Break Overlay Component
- [ ] Task 9: Component Index
- [ ] Task 10: i18n Strings
- [ ] Task 11: Integrate into App
- [ ] Task 12: Manual Testing

## 🧪 Test Results

| Test | Status |
|------|--------|
| Overlay hiển thị | ✅ / ❌ |
| Take Break | ✅ / ❌ |
| Snooze limit | ✅ / ❌ |
| i18n | ✅ / ❌ |
| Animation | ✅ / ❌ |

## 📸 Screenshots

[Đính kèm screenshots]

## 🐛 Issues Found

[Liệt kê nếu có]

## 📝 Notes

[Ghi chú thêm]
```

---

## 🚀 LỆNH CHO MISA

```
MISA, thực hiện M04: System Tray & Notifications.

## Tóm tắt:
- 12 tasks chi tiết trong file docs/modules/M04_SYSTEM_TRAY_NOTIFICATIONS.md
- Tạo notification system với 3 levels: Hint → Toast → Overlay
- Tạo Break Overlay component với Glassmorphism UI
- Passive-aggressive snooze buttons
- i18n support VI/EN

## Ưu tiên:
1. Rust backend: tray_types.rs, notification.rs, tray_commands.rs
2. Frontend: notificationStore.ts, BreakOverlay.tsx
3. Integration: App.tsx

## Sau khi hoàn thành:
- Tạo file docs/modules/M04_COMPLETED.md
- Chụp screenshots overlay
- Báo cáo kết quả

Thực hiện theo thứ tự từ Task 1 → Task 12.
```

---

*Generated by LUMB (Lumbar Advisor) - 2026-01-29*
