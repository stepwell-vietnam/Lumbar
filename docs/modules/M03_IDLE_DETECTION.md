# MODULE M03: IDLE DETECTION

> **Module:** M03 - Idle Detection  
> **Priority:** P0 (Critical)  
> **Assigned to:** MISA  
> **Created by:** LUMB  
> **Date:** 2026-01-29

---

## 📋 TỔNG QUAN

| Thông tin | Chi tiết |
|-----------|----------|
| **Mục tiêu** | Phát hiện khi user không thao tác để tạm dừng timer tự động |
| **Thời gian dự kiến** | 1-2 ngày |
| **Dependencies** | M01 ✅, M02 ✅ |
| **Output** | Timer auto-pause khi idle > 2 phút, auto-resume khi user quay lại |

---

## 🎯 MỤC TIÊU CHI TIẾT

Sau khi hoàn thành M03:
1. ✅ Phát hiện mouse/keyboard activity trên cả macOS và Windows
2. ✅ Timer tự động pause khi không có thao tác > 2 phút
3. ✅ Timer tự động resume khi user quay lại
4. ✅ Mascot hiển thị trạng thái "sleeping" khi idle
5. ✅ Idle threshold có thể config trong Settings

---

## 📐 KIẾN TRÚC IDLE DETECTION

```
┌─────────────────────────────────────────────────────────────────┐
│                     IDLE DETECTION ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    RUST BACKEND                          │   │
│  │  ┌─────────────┐      ┌─────────────┐                   │   │
│  │  │ IdleMonitor │──────│ SystemAPI   │                   │   │
│  │  │             │      │ (per OS)    │                   │   │
│  │  │ - check()   │      │             │                   │   │
│  │  │ - start()   │      │ macOS: CGS  │                   │   │
│  │  │ - stop()    │      │ Win: GetLII │                   │   │
│  │  └─────────────┘      └─────────────┘                   │   │
│  │         │                                                │   │
│  │         ▼                                                │   │
│  │  ┌─────────────────────────────────────────┐            │   │
│  │  │              TimerEngine                 │            │   │
│  │  │  IF idle > threshold THEN pause()       │            │   │
│  │  │  IF input_detected THEN resume()        │            │   │
│  │  └─────────────────────────────────────────┘            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          │ Events                               │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   REACT FRONTEND                         │   │
│  │  - Show "sleeping" mascot                                │   │
│  │  - Update idle status indicator                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 DANH SÁCH CÔNG VIỆC

### Task 1: Thêm Dependencies (Cargo.toml)

**Mô tả:** Thêm thư viện để phát hiện idle

**File: `src-tauri/Cargo.toml`** (thêm dependencies)
```toml
[dependencies]
# ... existing dependencies ...

# Idle detection
user-idle = "0.6"
```

**Commands:**
```bash
cd src-tauri
cargo add user-idle
```

**Verification:**
- [ ] `cargo check` pass
- [ ] Thư viện `user-idle` được cài

---

### Task 2: Tạo Idle Types

**Mô tả:** Định nghĩa types cho Idle Detection

**File: `src-tauri/src/core/idle_types.rs`**
```rust
use serde::{Deserialize, Serialize};

/// Trạng thái idle của user
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum IdleStatus {
    Active,    // User đang thao tác
    Idle,      // User không thao tác
}

/// State của Idle Monitor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdleState {
    pub status: IdleStatus,
    pub idle_seconds: u64,           // Số giây đã idle
    pub threshold_seconds: u64,       // Ngưỡng để coi là idle
    pub last_activity_timestamp: u64, // Unix timestamp of last activity
}

impl Default for IdleState {
    fn default() -> Self {
        Self {
            status: IdleStatus::Active,
            idle_seconds: 0,
            threshold_seconds: 2 * 60, // 2 phút default
            last_activity_timestamp: 0,
        }
    }
}

/// Settings cho Idle Detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdleSettings {
    pub enabled: bool,
    pub threshold_seconds: u64,  // Mặc định 2 phút
    pub auto_pause_timer: bool,  // Tự động pause timer khi idle
    pub auto_resume_timer: bool, // Tự động resume khi active
}

impl Default for IdleSettings {
    fn default() -> Self {
        Self {
            enabled: true,
            threshold_seconds: 2 * 60, // 2 phút
            auto_pause_timer: true,
            auto_resume_timer: true,
        }
    }
}
```

**Cập nhật `src-tauri/src/core/mod.rs`:**
```rust
pub mod timer_types;
pub mod timer;
pub mod idle_types;
pub mod idle;

pub use timer_types::*;
pub use timer::*;
pub use idle_types::*;
pub use idle::*;
```

**Verification:**
- [ ] `cargo check` pass
- [ ] Types export đúng

---

### Task 3: Implement Idle Monitor

**Mô tả:** Logic chính phát hiện idle

**File: `src-tauri/src/core/idle.rs`**
```rust
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::Mutex;
use tokio::time::interval;
use tauri::{AppHandle, Emitter};
use user_idle::UserIdle;

use super::idle_types::{IdleSettings, IdleState, IdleStatus};

pub struct IdleMonitor {
    state: Arc<Mutex<IdleState>>,
    settings: Arc<Mutex<IdleSettings>>,
    is_monitoring: Arc<Mutex<bool>>,
}

impl IdleMonitor {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(IdleState::default())),
            settings: Arc::new(Mutex::new(IdleSettings::default())),
            is_monitoring: Arc::new(Mutex::new(false)),
        }
    }

    /// Lấy state hiện tại
    pub async fn get_state(&self) -> IdleState {
        self.state.lock().await.clone()
    }

    /// Lấy settings
    pub async fn get_settings(&self) -> IdleSettings {
        self.settings.lock().await.clone()
    }

    /// Cập nhật settings
    pub async fn update_settings(&self, new_settings: IdleSettings) {
        let mut settings = self.settings.lock().await;
        *settings = new_settings.clone();
        
        // Update threshold in state too
        let mut state = self.state.lock().await;
        state.threshold_seconds = new_settings.threshold_seconds;
    }

    /// Bắt đầu monitoring
    pub async fn start_monitoring(&self, app_handle: AppHandle) {
        // Kiểm tra nếu đang monitor rồi
        {
            let mut is_monitoring = self.is_monitoring.lock().await;
            if *is_monitoring {
                return;
            }
            *is_monitoring = true;
        }

        let state = Arc::clone(&self.state);
        let settings = Arc::clone(&self.settings);
        let is_monitoring = Arc::clone(&self.is_monitoring);

        tokio::spawn(async move {
            let idle_detector = UserIdle::get_time().unwrap_or_default();
            let mut ticker = interval(Duration::from_secs(1));
            let mut was_idle = false;

            loop {
                ticker.tick().await;

                // Check if still monitoring
                {
                    let monitoring = is_monitoring.lock().await;
                    if !*monitoring {
                        break;
                    }
                }

                // Get current settings
                let current_settings = settings.lock().await.clone();
                
                if !current_settings.enabled {
                    continue;
                }

                // Check idle time using user-idle crate
                let idle_duration = match UserIdle::get_time() {
                    Ok(idle) => idle.duration(),
                    Err(_) => Duration::from_secs(0),
                };
                
                let idle_seconds = idle_duration.as_secs();

                // Update state
                let mut current_state = state.lock().await;
                current_state.idle_seconds = idle_seconds;
                
                let now = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs();

                // Determine status
                let is_idle = idle_seconds >= current_state.threshold_seconds;
                
                if is_idle && !was_idle {
                    // Just became idle
                    current_state.status = IdleStatus::Idle;
                    was_idle = true;
                    
                    // Emit idle event
                    let _ = app_handle.emit("idle:became_idle", current_state.clone());
                    
                } else if !is_idle && was_idle {
                    // Just became active
                    current_state.status = IdleStatus::Active;
                    current_state.last_activity_timestamp = now;
                    was_idle = false;
                    
                    // Emit active event
                    let _ = app_handle.emit("idle:became_active", current_state.clone());
                }

                // Always emit status update for UI sync
                let _ = app_handle.emit("idle:status", current_state.clone());
            }
        });
    }

    /// Dừng monitoring
    pub async fn stop_monitoring(&self) {
        let mut is_monitoring = self.is_monitoring.lock().await;
        *is_monitoring = false;
    }

    /// Check một lần (không loop)
    pub async fn check_once(&self) -> IdleState {
        let idle_duration = match UserIdle::get_time() {
            Ok(idle) => idle.duration(),
            Err(_) => Duration::from_secs(0),
        };

        let mut state = self.state.lock().await;
        state.idle_seconds = idle_duration.as_secs();
        
        let is_idle = state.idle_seconds >= state.threshold_seconds;
        state.status = if is_idle { IdleStatus::Idle } else { IdleStatus::Active };
        
        state.clone()
    }
}

impl Default for IdleMonitor {
    fn default() -> Self {
        Self::new()
    }
}
```

**Verification:**
- [ ] `cargo check` pass
- [ ] Idle detection logic đúng

---

### Task 4: Tạo Idle Commands

**Mô tả:** Expose idle functions qua Tauri commands

**File: `src-tauri/src/commands/idle_commands.rs`**
```rust
use tauri::{command, AppHandle, State};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::core::{IdleMonitor, IdleState, IdleSettings};

pub type IdleMonitorState = Arc<Mutex<IdleMonitor>>;

#[command]
pub async fn idle_start_monitoring(
    app_handle: AppHandle,
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<(), String> {
    let monitor = idle_monitor.lock().await;
    monitor.start_monitoring(app_handle).await;
    Ok(())
}

#[command]
pub async fn idle_stop_monitoring(
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<(), String> {
    let monitor = idle_monitor.lock().await;
    monitor.stop_monitoring().await;
    Ok(())
}

#[command]
pub async fn idle_get_state(
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<IdleState, String> {
    let monitor = idle_monitor.lock().await;
    Ok(monitor.get_state().await)
}

#[command]
pub async fn idle_check_once(
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<IdleState, String> {
    let monitor = idle_monitor.lock().await;
    Ok(monitor.check_once().await)
}

#[command]
pub async fn idle_get_settings(
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<IdleSettings, String> {
    let monitor = idle_monitor.lock().await;
    Ok(monitor.get_settings().await)
}

#[command]
pub async fn idle_update_settings(
    idle_monitor: State<'_, IdleMonitorState>,
    settings: IdleSettings,
) -> Result<(), String> {
    let monitor = idle_monitor.lock().await;
    monitor.update_settings(settings).await;
    Ok(())
}
```

**Cập nhật `src-tauri/src/commands/mod.rs`:**
```rust
pub mod timer_commands;
pub mod idle_commands;

pub use timer_commands::*;
pub use idle_commands::*;
```

**Verification:**
- [ ] Commands compile
- [ ] All functions exported

---

### Task 5: Tích hợp vào main.rs

**Mô tả:** Đăng ký Idle Monitor và commands

**File: `src-tauri/src/main.rs`** (cập nhật)
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod core;
mod commands;

use std::sync::Arc;
use tokio::sync::Mutex;

use core::{TimerEngine, IdleMonitor};
use commands::{
    // Timer commands
    timer_start,
    timer_pause,
    timer_resume,
    timer_reset,
    timer_get_state,
    timer_skip_to_break,
    timer_acknowledge_break,
    timer_update_settings,
    timer_get_settings,
    TimerEngineState,
    // Idle commands
    idle_start_monitoring,
    idle_stop_monitoring,
    idle_get_state,
    idle_check_once,
    idle_get_settings,
    idle_update_settings,
    IdleMonitorState,
};

fn main() {
    // Khởi tạo states
    let timer_engine: TimerEngineState = Arc::new(Mutex::new(TimerEngine::new()));
    let idle_monitor: IdleMonitorState = Arc::new(Mutex::new(IdleMonitor::new()));

    tauri::Builder::default()
        .manage(timer_engine)
        .manage(idle_monitor)
        .invoke_handler(tauri::generate_handler![
            // Timer commands
            timer_start,
            timer_pause,
            timer_resume,
            timer_reset,
            timer_get_state,
            timer_skip_to_break,
            timer_acknowledge_break,
            timer_update_settings,
            timer_get_settings,
            // Idle commands
            idle_start_monitoring,
            idle_stop_monitoring,
            idle_get_state,
            idle_check_once,
            idle_get_settings,
            idle_update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Verification:**
- [ ] `cargo build` thành công
- [ ] App khởi động không lỗi

---

### Task 6: Tạo Idle Store (Frontend)

**Mô tả:** Zustand store để quản lý idle state

**File: `src/stores/idleStore.ts`**
```typescript
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export type IdleStatus = 'active' | 'idle';

export interface IdleState {
  status: IdleStatus;
  idle_seconds: number;
  threshold_seconds: number;
  last_activity_timestamp: number;
}

export interface IdleSettings {
  enabled: boolean;
  threshold_seconds: number;
  auto_pause_timer: boolean;
  auto_resume_timer: boolean;
}

interface IdleStore {
  // State
  state: IdleState;
  settings: IdleSettings;
  isMonitoring: boolean;

  // Actions
  initialize: () => Promise<void>;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  checkOnce: () => Promise<IdleState>;
  updateSettings: (settings: IdleSettings) => Promise<void>;
}

const defaultState: IdleState = {
  status: 'active',
  idle_seconds: 0,
  threshold_seconds: 120,
  last_activity_timestamp: 0,
};

const defaultSettings: IdleSettings = {
  enabled: true,
  threshold_seconds: 120,
  auto_pause_timer: true,
  auto_resume_timer: true,
};

export const useIdleStore = create<IdleStore>((set, get) => ({
  state: defaultState,
  settings: defaultSettings,
  isMonitoring: false,

  initialize: async () => {
    try {
      // Get initial settings
      const settings = await invoke<IdleSettings>('idle_get_settings');
      set({ settings });

      // Listen for idle events
      await listen<IdleState>('idle:status', (event) => {
        set({ state: event.payload });
      });

      await listen<IdleState>('idle:became_idle', (event) => {
        set({ state: event.payload });
        console.log('User became idle', event.payload);
      });

      await listen<IdleState>('idle:became_active', (event) => {
        set({ state: event.payload });
        console.log('User became active', event.payload);
      });
    } catch (error) {
      console.error('Failed to initialize idle store:', error);
    }
  },

  startMonitoring: async () => {
    try {
      await invoke('idle_start_monitoring');
      set({ isMonitoring: true });
    } catch (error) {
      console.error('Failed to start idle monitoring:', error);
    }
  },

  stopMonitoring: async () => {
    try {
      await invoke('idle_stop_monitoring');
      set({ isMonitoring: false });
    } catch (error) {
      console.error('Failed to stop idle monitoring:', error);
    }
  },

  checkOnce: async () => {
    try {
      const state = await invoke<IdleState>('idle_check_once');
      set({ state });
      return state;
    } catch (error) {
      console.error('Failed to check idle:', error);
      return get().state;
    }
  },

  updateSettings: async (settings: IdleSettings) => {
    try {
      await invoke('idle_update_settings', { settings });
      set({ settings });
    } catch (error) {
      console.error('Failed to update idle settings:', error);
    }
  },
}));
```

**Verification:**
- [ ] Store imports không lỗi
- [ ] Types khớp với Rust

---

### Task 7: Tích hợp Idle với Timer

**Mô tả:** Auto-pause timer khi idle, auto-resume khi active

**Cập nhật `src/stores/timerStore.ts`:**

Thêm logic để listen idle events và tự động pause/resume:

```typescript
// Thêm import
import { listen } from '@tauri-apps/api/event';

// Trong initialize function, thêm:
  initialize: async () => {
    if (get().isInitialized) return;

    try {
      // ... existing code ...

      // Listen for idle events to auto-pause/resume
      await listen<{ status: string }>('idle:became_idle', async () => {
        const currentState = get().state;
        if (currentState.status === 'running') {
          console.log('Auto-pausing timer due to idle');
          await get().pause();
        }
      });

      await listen<{ status: string }>('idle:became_active', async () => {
        const currentState = get().state;
        if (currentState.status === 'paused') {
          console.log('Auto-resuming timer - user is back');
          await get().resume();
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize timer:', error);
    }
  },
```

**Verification:**
- [ ] Timer auto-pause khi idle
- [ ] Timer auto-resume khi active

---

### Task 8: Tạo Idle Status Component

**Mô tả:** Component hiển thị trạng thái idle

**File: `src/components/ui/IdleIndicator.tsx`**
```typescript
import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Activity } from 'lucide-react';
import { useIdleStore } from '../../stores/idleStore';

interface IdleIndicatorProps {
  showText?: boolean;
}

export const IdleIndicator: FC<IdleIndicatorProps> = ({ showText = true }) => {
  const { state, initialize, startMonitoring } = useIdleStore();

  useEffect(() => {
    initialize().then(() => {
      startMonitoring();
    });
  }, [initialize, startMonitoring]);

  const isIdle = state.status === 'idle';

  // Format idle time
  const formatIdleTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.status}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          ${isIdle 
            ? 'bg-blue-500/20 text-blue-400' 
            : 'bg-green-500/20 text-green-400'}
        `}
      >
        {isIdle ? (
          <>
            <Moon className="w-4 h-4" />
            {showText && (
              <span className="text-sm">
                Idle {formatIdleTime(state.idle_seconds)}
              </span>
            )}
          </>
        ) : (
          <>
            <Activity className="w-4 h-4" />
            {showText && <span className="text-sm">Active</span>}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
```

**Cập nhật `src/components/ui/index.ts`:**
```typescript
export * from './GlassCard';
export * from './Button';
export * from './IdleIndicator';
```

**Verification:**
- [ ] Component render đúng
- [ ] Icon thay đổi theo status

---

### Task 9: Tích hợp vào Dashboard

**Mô tả:** Hiển thị Idle Indicator trong Dashboard

**Cập nhật `src/screens/Dashboard/Dashboard.tsx`:**
```typescript
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard, IdleIndicator } from '../../components/ui';
import { TimerDisplay, TimerControls } from '../../components/Timer';
import { useIdleStore } from '../../stores/idleStore';

export const Dashboard: FC = () => {
  const { t } = useTranslation();
  const { state: idleState } = useIdleStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
      <GlassCard className="p-8 w-full max-w-md">
        {/* Header with Idle Indicator */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">
            🪵 {t('common.appName')}
          </h1>
          <IdleIndicator showText={false} />
        </div>

        {/* Status Message */}
        <p className="text-white/60 text-sm text-center mb-8">
          {idleState.status === 'idle' 
            ? '😴 Đang nghỉ...' 
            : t('timer.nextBreak')}
        </p>

        {/* Timer Display */}
        <div className="mb-8">
          <TimerDisplay size="lg" showProgress />
        </div>

        {/* Timer Controls */}
        <TimerControls showTypeSelector />
      </GlassCard>
    </div>
  );
};
```

**Verification:**
- [ ] Idle Indicator hiển thị
- [ ] Status message thay đổi theo idle state

---

### Task 10: Final Testing

**Mô tả:** Test toàn bộ idle detection flow

**Test Cases:**

| # | Test Case | Cách test | Expected | Pass |
|---|-----------|-----------|----------|------|
| 1 | Idle detection | Không thao tác 2 phút | Status → "idle" | ⬜ |
| 2 | Active detection | Di chuột/gõ phím | Status → "active" | ⬜ |
| 3 | Timer auto-pause | Start timer, rồi idle | Timer tự pause | ⬜ |
| 4 | Timer auto-resume | Quay lại sau idle | Timer tiếp tục | ⬜ |
| 5 | Idle indicator | Xem Dashboard | Icon thay đổi | ⬜ |
| 6 | Settings update | Đổi threshold | Áp dụng đúng | ⬜ |

**Quick Test (2 phút là lâu, để test nhanh):**

Tạm thời đổi threshold xuống 10 giây để test:
```typescript
// Trong idle_types.rs
threshold_seconds: 10, // Tạm thời 10s để test
```

**Commands:**
```bash
npm run tauri dev

# Quan sát:
# 1. Không thao tác 10s → Icon đổi thành Moon
# 2. Di chuột → Icon đổi thành Activity
# 3. Timer đang chạy → không thao tác → Timer pause tự động
```

**Verification:**
- [ ] Tất cả test cases pass
- [ ] macOS hoạt động
- [ ] Windows hoạt động (nếu có)

---

## 📊 DELIVERABLES

```
src-tauri/src/
├── core/
│   ├── mod.rs              (updated)
│   ├── timer_types.rs
│   ├── timer.rs
│   ├── idle_types.rs       (NEW)
│   └── idle.rs             (NEW)
├── commands/
│   ├── mod.rs              (updated)
│   ├── timer_commands.rs
│   └── idle_commands.rs    (NEW)
├── Cargo.toml              (updated - user-idle)
└── main.rs                 (updated)

src/
├── stores/
│   ├── timerStore.ts       (updated)
│   └── idleStore.ts        (NEW)
├── components/
│   └── ui/
│       ├── IdleIndicator.tsx (NEW)
│       └── index.ts          (updated)
└── screens/
    └── Dashboard/
        └── Dashboard.tsx     (updated)
```

---

## 📝 BÁO CÁO HOÀN THÀNH

Sau khi hoàn thành, MISA tạo file: `docs/modules/M03_COMPLETED.md`

**Template:**
```markdown
# M03: IDLE DETECTION - BÁO CÁO HOÀN THÀNH

> **Completed by:** MISA
> **Date:** [YYYY-MM-DD]
> **Duration:** [X hours]

## ✅ TASKS COMPLETED

| # | Task | Status |
|---|------|--------|
| 1 | Thêm Dependencies | ✅ |
| 2 | Tạo Idle Types | ✅ |
| 3 | Implement Idle Monitor | ✅ |
| 4 | Tạo Idle Commands | ✅ |
| 5 | Tích hợp main.rs | ✅ |
| 6 | Tạo Idle Store | ✅ |
| 7 | Tích hợp với Timer | ✅ |
| 8 | Tạo IdleIndicator | ✅ |
| 9 | Tích hợp Dashboard | ✅ |
| 10 | Final Testing | ✅ |

## 🧪 TEST RESULTS

| Test Case | Result |
|-----------|--------|
| Idle detection | ✅ |
| Active detection | ✅ |
| Timer auto-pause | ✅ |
| Timer auto-resume | ✅ |

## ⚠️ ISSUES ENCOUNTERED

[Mô tả vấn đề]

## 📌 NOTES FOR M04

[Ghi chú cho System Tray module]
```

---

## 🔗 THAM KHẢO

| Tài liệu | Mục đích |
|----------|----------|
| `docs/PRD.md` | F02: Idle Detection logic |
| `docs/ARCHITECTURE.md` | IPC design |
| user-idle crate | https://crates.io/crates/user-idle |

---

> **Module này do LUMB soạn cho MISA thực hiện.**  
> Dependencies: M01 ✅, M02 ✅  
> Sau khi hoàn thành, tiến hành M04: System Tray
