# MODULE M02: TIMER ENGINE

> **Module:** M02 - Timer Engine  
> **Priority:** P0 (Critical)  
> **Assigned to:** MISA  
> **Created by:** LUMB  
> **Date:** 2026-01-29

---

## 📋 TỔNG QUAN

| Thông tin | Chi tiết |
|-----------|----------|
| **Mục tiêu** | Xây dựng Timer Engine với Rust backend và React frontend |
| **Thời gian dự kiến** | 2-3 ngày |
| **Dependencies** | M01: Project Setup ✅ |
| **Output** | Timer đếm ngược chính xác, hiển thị trên Mini Dashboard |

---

## 🎯 MỤC TIÊU CHI TIẾT

Sau khi hoàn thành M02:
1. ✅ Timer Rust chạy chính xác ở background
2. ✅ 2 loại timer: Micro-break (20 phút) và Rest-break (60 phút)
3. ✅ IPC commands: start, pause, resume, reset, get_state
4. ✅ Frontend hiển thị countdown realtime
5. ✅ State được sync giữa Rust và React (via Zustand)

---

## 📐 KIẾN TRÚC TIMER

```
┌─────────────────────────────────────────────────────────────────┐
│                         TIMER ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    Events     ┌─────────────────────────────┐ │
│  │   RUST      │ ─────────────►│       REACT FRONTEND        │ │
│  │  BACKEND    │               │                             │ │
│  │             │◄───────────── │                             │ │
│  │  timer.rs   │   Commands    │  timerStore.ts + Timer.tsx  │ │
│  └─────────────┘               └─────────────────────────────┘ │
│        │                                    │                   │
│        ▼                                    ▼                   │
│  ┌─────────────┐               ┌─────────────────────────────┐ │
│  │ TimerState  │               │     UI Components           │ │
│  │ - Running   │               │     - Countdown display     │ │
│  │ - Paused    │               │     - Progress bar          │ │
│  │ - Idle      │               │     - Control buttons       │ │
│  └─────────────┘               └─────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 DANH SÁCH CÔNG VIỆC

### Task 1: Tạo Timer Types (Rust)

**Mô tả:** Định nghĩa các types cho Timer

**File: `src-tauri/src/core/timer_types.rs`**
```rust
use serde::{Deserialize, Serialize};

/// Loại timer
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum TimerType {
    MicroBreak,  // 20 phút → nghỉ 20 giây
    RestBreak,   // 60 phút → nghỉ 5-10 phút
}

/// Trạng thái timer
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum TimerStatus {
    Idle,     // Chưa bắt đầu
    Running,  // Đang đếm ngược
    Paused,   // Tạm dừng
    Break,    // Đang trong thời gian nghỉ
}

/// State của timer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub status: TimerStatus,
    pub timer_type: TimerType,
    pub remaining_seconds: u64,    // Thời gian còn lại (giây)
    pub total_seconds: u64,        // Tổng thời gian (giây)
    pub is_break_time: bool,       // Đang trong break hay work
}

impl Default for TimerState {
    fn default() -> Self {
        Self {
            status: TimerStatus::Idle,
            timer_type: TimerType::MicroBreak,
            remaining_seconds: 20 * 60, // 20 phút default
            total_seconds: 20 * 60,
            is_break_time: false,
        }
    }
}

/// Settings cho timer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerSettings {
    pub micro_break_interval: u64,   // Mặc định 20 phút
    pub micro_break_duration: u64,   // Mặc định 20 giây
    pub rest_break_interval: u64,    // Mặc định 60 phút
    pub rest_break_duration: u64,    // Mặc định 5 phút
}

impl Default for TimerSettings {
    fn default() -> Self {
        Self {
            micro_break_interval: 20 * 60,  // 20 phút
            micro_break_duration: 20,        // 20 giây
            rest_break_interval: 60 * 60,   // 60 phút
            rest_break_duration: 5 * 60,    // 5 phút
        }
    }
}
```

**File: `src-tauri/src/core/mod.rs`**
```rust
pub mod timer_types;
pub mod timer;

pub use timer_types::*;
pub use timer::*;
```

**Verification:**
- [ ] Code compile không lỗi: `cargo check`
- [ ] Types được export đúng

---

### Task 2: Implement Timer Logic (Rust)

**Mô tả:** Logic chính của Timer Engine

**File: `src-tauri/src/core/timer.rs`**
```rust
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{interval, Duration};
use tauri::{AppHandle, Emitter};

use super::timer_types::{TimerState, TimerStatus, TimerType, TimerSettings};

pub struct TimerEngine {
    state: Arc<Mutex<TimerState>>,
    settings: Arc<Mutex<TimerSettings>>,
    is_ticking: Arc<Mutex<bool>>,
}

impl TimerEngine {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(TimerState::default())),
            settings: Arc::new(Mutex::new(TimerSettings::default())),
            is_ticking: Arc::new(Mutex::new(false)),
        }
    }

    /// Lấy state hiện tại
    pub async fn get_state(&self) -> TimerState {
        self.state.lock().await.clone()
    }

    /// Lấy settings
    pub async fn get_settings(&self) -> TimerSettings {
        self.settings.lock().await.clone()
    }

    /// Cập nhật settings
    pub async fn update_settings(&self, new_settings: TimerSettings) {
        let mut settings = self.settings.lock().await;
        *settings = new_settings;
    }

    /// Bắt đầu timer
    pub async fn start(&self, app_handle: AppHandle, timer_type: TimerType) {
        let mut state = self.state.lock().await;
        let settings = self.settings.lock().await;
        
        // Set initial time based on timer type
        let total_seconds = match timer_type {
            TimerType::MicroBreak => settings.micro_break_interval,
            TimerType::RestBreak => settings.rest_break_interval,
        };

        state.status = TimerStatus::Running;
        state.timer_type = timer_type;
        state.remaining_seconds = total_seconds;
        state.total_seconds = total_seconds;
        state.is_break_time = false;
        
        drop(state);
        drop(settings);

        // Start ticking
        self.start_tick(app_handle).await;
    }

    /// Bắt đầu tick (1 giây 1 lần)
    async fn start_tick(&self, app_handle: AppHandle) {
        let state = Arc::clone(&self.state);
        let settings = Arc::clone(&self.settings);
        let is_ticking = Arc::clone(&self.is_ticking);

        // Kiểm tra nếu đang tick rồi thì không start lại
        {
            let mut ticking = is_ticking.lock().await;
            if *ticking {
                return;
            }
            *ticking = true;
        }

        tokio::spawn(async move {
            let mut ticker = interval(Duration::from_secs(1));

            loop {
                ticker.tick().await;

                let mut current_state = state.lock().await;
                
                // Chỉ tick khi đang Running
                if current_state.status != TimerStatus::Running {
                    if current_state.status == TimerStatus::Idle {
                        let mut ticking = is_ticking.lock().await;
                        *ticking = false;
                        break;
                    }
                    continue;
                }

                // Đếm ngược
                if current_state.remaining_seconds > 0 {
                    current_state.remaining_seconds -= 1;
                    
                    // Emit event to frontend
                    let _ = app_handle.emit("timer:tick", current_state.clone());
                } else {
                    // Hết giờ!
                    if current_state.is_break_time {
                        // Break xong → quay lại work
                        let settings_guard = settings.lock().await;
                        let interval = match current_state.timer_type {
                            TimerType::MicroBreak => settings_guard.micro_break_interval,
                            TimerType::RestBreak => settings_guard.rest_break_interval,
                        };
                        current_state.remaining_seconds = interval;
                        current_state.total_seconds = interval;
                        current_state.is_break_time = false;
                        drop(settings_guard);
                    } else {
                        // Work xong → bắt đầu break
                        let settings_guard = settings.lock().await;
                        let duration = match current_state.timer_type {
                            TimerType::MicroBreak => settings_guard.micro_break_duration,
                            TimerType::RestBreak => settings_guard.rest_break_duration,
                        };
                        current_state.remaining_seconds = duration;
                        current_state.total_seconds = duration;
                        current_state.is_break_time = true;
                        current_state.status = TimerStatus::Break;
                        drop(settings_guard);
                        
                        // Emit break event
                        let _ = app_handle.emit("timer:break", current_state.clone());
                    }
                }
            }
        });
    }

    /// Tạm dừng timer
    pub async fn pause(&self) {
        let mut state = self.state.lock().await;
        if state.status == TimerStatus::Running {
            state.status = TimerStatus::Paused;
        }
    }

    /// Tiếp tục timer
    pub async fn resume(&self, app_handle: AppHandle) {
        let mut state = self.state.lock().await;
        if state.status == TimerStatus::Paused {
            state.status = TimerStatus::Running;
            drop(state);
            self.start_tick(app_handle).await;
        }
    }

    /// Reset timer
    pub async fn reset(&self) {
        let mut state = self.state.lock().await;
        *state = TimerState::default();
        
        let mut is_ticking = self.is_ticking.lock().await;
        *is_ticking = false;
    }

    /// Skip to break (force trigger)
    pub async fn skip_to_break(&self, app_handle: AppHandle) {
        let mut state = self.state.lock().await;
        let settings = self.settings.lock().await;
        
        let duration = match state.timer_type {
            TimerType::MicroBreak => settings.micro_break_duration,
            TimerType::RestBreak => settings.rest_break_duration,
        };
        
        state.remaining_seconds = duration;
        state.total_seconds = duration;
        state.is_break_time = true;
        state.status = TimerStatus::Break;
        
        let _ = app_handle.emit("timer:break", state.clone());
    }

    /// Acknowledge break (user đã nghỉ)
    pub async fn acknowledge_break(&self, app_handle: AppHandle) {
        let mut state = self.state.lock().await;
        let settings = self.settings.lock().await;
        
        if state.status == TimerStatus::Break {
            let interval = match state.timer_type {
                TimerType::MicroBreak => settings.micro_break_interval,
                TimerType::RestBreak => settings.rest_break_interval,
            };
            
            state.remaining_seconds = interval;
            state.total_seconds = interval;
            state.is_break_time = false;
            state.status = TimerStatus::Running;
            
            drop(state);
            drop(settings);
            
            self.start_tick(app_handle).await;
        }
    }
}

impl Default for TimerEngine {
    fn default() -> Self {
        Self::new()
    }
}
```

**Verification:**
- [ ] `cargo check` pass
- [ ] Logic đếm ngược đúng

---

### Task 3: Tạo Tauri Commands

**Mô tả:** Expose timer functions qua Tauri commands

**File: `src-tauri/src/commands/timer_commands.rs`**
```rust
use tauri::{command, AppHandle, State};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::core::{TimerEngine, TimerState, TimerType, TimerSettings};

pub type TimerEngineState = Arc<Mutex<TimerEngine>>;

#[command]
pub async fn timer_start(
    app_handle: AppHandle,
    timer_engine: State<'_, TimerEngineState>,
    timer_type: String,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    
    let t_type = match timer_type.as_str() {
        "micro_break" => TimerType::MicroBreak,
        "rest_break" => TimerType::RestBreak,
        _ => return Err("Invalid timer type".to_string()),
    };
    
    engine.start(app_handle, t_type).await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_pause(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.pause().await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_resume(
    app_handle: AppHandle,
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.resume(app_handle).await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_reset(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.reset().await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_get_state(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_skip_to_break(
    app_handle: AppHandle,
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.skip_to_break(app_handle).await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_acknowledge_break(
    app_handle: AppHandle,
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.acknowledge_break(app_handle).await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_update_settings(
    timer_engine: State<'_, TimerEngineState>,
    settings: TimerSettings,
) -> Result<(), String> {
    let engine = timer_engine.lock().await;
    engine.update_settings(settings).await;
    Ok(())
}

#[command]
pub async fn timer_get_settings(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerSettings, String> {
    let engine = timer_engine.lock().await;
    Ok(engine.get_settings().await)
}
```

**File: `src-tauri/src/commands/mod.rs`**
```rust
pub mod timer_commands;

pub use timer_commands::*;
```

**Verification:**
- [ ] Commands compile không lỗi
- [ ] All commands exported

---

### Task 4: Register Commands trong main.rs

**Mô tả:** Đăng ký commands và state vào Tauri app

**File: `src-tauri/src/main.rs`** (cập nhật)
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod core;
mod commands;

use std::sync::Arc;
use tokio::sync::Mutex;

use core::TimerEngine;
use commands::{
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
};

fn main() {
    // Khởi tạo Timer Engine
    let timer_engine: TimerEngineState = Arc::new(Mutex::new(TimerEngine::new()));

    tauri::Builder::default()
        .manage(timer_engine)
        .invoke_handler(tauri::generate_handler![
            timer_start,
            timer_pause,
            timer_resume,
            timer_reset,
            timer_get_state,
            timer_skip_to_break,
            timer_acknowledge_break,
            timer_update_settings,
            timer_get_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Verification:**
- [ ] `cargo build` thành công
- [ ] App khởi động không lỗi

---

### Task 5: Tạo Timer Store (Frontend)

**Mô tả:** Zustand store để quản lý timer state ở frontend

**File: `src/stores/timerStore.ts`**
```typescript
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Types matching Rust structs
export type TimerType = 'micro_break' | 'rest_break';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'break';

export interface TimerState {
  status: TimerStatus;
  timer_type: TimerType;
  remaining_seconds: number;
  total_seconds: number;
  is_break_time: boolean;
}

export interface TimerSettings {
  micro_break_interval: number;
  micro_break_duration: number;
  rest_break_interval: number;
  rest_break_duration: number;
}

interface TimerStore {
  // State
  state: TimerState;
  settings: TimerSettings;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  start: (timerType: TimerType) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  reset: () => Promise<void>;
  skipToBreak: () => Promise<void>;
  acknowledgeBreak: () => Promise<void>;
  updateSettings: (settings: TimerSettings) => Promise<void>;
}

const defaultState: TimerState = {
  status: 'idle',
  timer_type: 'micro_break',
  remaining_seconds: 20 * 60,
  total_seconds: 20 * 60,
  is_break_time: false,
};

const defaultSettings: TimerSettings = {
  micro_break_interval: 20 * 60,
  micro_break_duration: 20,
  rest_break_interval: 60 * 60,
  rest_break_duration: 5 * 60,
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  state: defaultState,
  settings: defaultSettings,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      // Get initial state from Rust
      const state = await invoke<TimerState>('timer_get_state');
      const settings = await invoke<TimerSettings>('timer_get_settings');
      
      set({ state, settings, isInitialized: true });

      // Listen for tick events
      await listen<TimerState>('timer:tick', (event) => {
        set({ state: event.payload });
      });

      // Listen for break events
      await listen<TimerState>('timer:break', (event) => {
        set({ state: event.payload });
      });
    } catch (error) {
      console.error('Failed to initialize timer:', error);
    }
  },

  start: async (timerType: TimerType) => {
    try {
      const state = await invoke<TimerState>('timer_start', { timerType });
      set({ state });
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  },

  pause: async () => {
    try {
      const state = await invoke<TimerState>('timer_pause');
      set({ state });
    } catch (error) {
      console.error('Failed to pause timer:', error);
    }
  },

  resume: async () => {
    try {
      const state = await invoke<TimerState>('timer_resume');
      set({ state });
    } catch (error) {
      console.error('Failed to resume timer:', error);
    }
  },

  reset: async () => {
    try {
      const state = await invoke<TimerState>('timer_reset');
      set({ state });
    } catch (error) {
      console.error('Failed to reset timer:', error);
    }
  },

  skipToBreak: async () => {
    try {
      const state = await invoke<TimerState>('timer_skip_to_break');
      set({ state });
    } catch (error) {
      console.error('Failed to skip to break:', error);
    }
  },

  acknowledgeBreak: async () => {
    try {
      const state = await invoke<TimerState>('timer_acknowledge_break');
      set({ state });
    } catch (error) {
      console.error('Failed to acknowledge break:', error);
    }
  },

  updateSettings: async (settings: TimerSettings) => {
    try {
      await invoke('timer_update_settings', { settings });
      set({ settings });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
}));
```

**Verification:**
- [ ] Store imports không lỗi
- [ ] TypeScript types khớp với Rust types

---

### Task 6: Tạo Timer Display Component

**Mô tả:** Component hiển thị countdown timer

**File: `src/components/Timer/TimerDisplay.tsx`**
```typescript
import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTimerStore } from '../../stores/timerStore';

interface TimerDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export const TimerDisplay: FC<TimerDisplayProps> = ({ 
  size = 'md',
  showProgress = true 
}) => {
  const { state, initialize } = useTimerStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = state.total_seconds > 0 
    ? ((state.total_seconds - state.remaining_seconds) / state.total_seconds) * 100 
    : 0;

  // Size classes
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  // Status colors
  const statusColors = {
    idle: 'text-gray-400',
    running: 'text-white',
    paused: 'text-yellow-400',
    break: 'text-green-400',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Timer Display */}
      <motion.div
        className={`font-bold ${sizeClasses[size]} ${statusColors[state.status]}`}
        key={state.remaining_seconds}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        {formatTime(state.remaining_seconds)}
      </motion.div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-xs h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${state.is_break_time ? 'bg-green-400' : 'bg-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Status Badge */}
      <div className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${state.is_break_time ? 'bg-green-400/20 text-green-400' : 'bg-white/10 text-white/70'}
      `}>
        {state.is_break_time ? '🧘 Break Time' : '💻 Working'}
      </div>
    </div>
  );
};
```

**File: `src/components/Timer/index.ts`**
```typescript
export * from './TimerDisplay';
export * from './TimerControls';
```

**Verification:**
- [ ] Component render không lỗi
- [ ] Timer hiển thị đúng format MM:SS

---

### Task 7: Tạo Timer Controls Component

**Mô tả:** Nút điều khiển timer

**File: `src/components/Timer/TimerControls.tsx`**
```typescript
import { FC } from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { useTimerStore, TimerType } from '../../stores/timerStore';
import { Button } from '../ui/Button';

interface TimerControlsProps {
  showTypeSelector?: boolean;
}

export const TimerControls: FC<TimerControlsProps> = ({ 
  showTypeSelector = true 
}) => {
  const { state, start, pause, resume, reset, skipToBreak } = useTimerStore();

  const handlePlayPause = async () => {
    if (state.status === 'idle') {
      await start('micro_break');
    } else if (state.status === 'running') {
      await pause();
    } else if (state.status === 'paused') {
      await resume();
    }
  };

  const handleTimerTypeChange = async (type: TimerType) => {
    await reset();
    await start(type);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Timer Type Selector */}
      {showTypeSelector && state.status === 'idle' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleTimerTypeChange('micro_break')}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${state.timer_type === 'micro_break' 
                ? 'bg-primary text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'}
            `}
          >
            👀 Micro (20m)
          </button>
          <button
            onClick={() => handleTimerTypeChange('rest_break')}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${state.timer_type === 'rest_break' 
                ? 'bg-primary text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'}
            `}
          >
            🧘 Rest (60m)
          </button>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        {/* Reset Button */}
        <button
          onClick={reset}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          disabled={state.status === 'idle'}
        >
          <RotateCcw className="w-5 h-5 text-white/70" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="p-4 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-lg"
        >
          {state.status === 'running' ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white" />
          )}
        </button>

        {/* Skip to Break Button */}
        <button
          onClick={skipToBreak}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          disabled={state.status === 'idle' || state.is_break_time}
        >
          <FastForward className="w-5 h-5 text-white/70" />
        </button>
      </div>
    </div>
  );
};
```

**Verification:**
- [ ] Buttons hoạt động đúng
- [ ] State change khi click

---

### Task 8: Tích hợp vào Dashboard

**Mô tả:** Tạo Mini Dashboard screen với Timer

**File: `src/screens/Dashboard/Dashboard.tsx`**
```typescript
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../components/ui';
import { TimerDisplay, TimerControls } from '../../components/Timer';

export const Dashboard: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
      <GlassCard className="p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            🪵 {t('common.appName')}
          </h1>
          <p className="text-white/60 text-sm">
            {t('timer.nextBreak')}
          </p>
        </div>

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

**File: `src/screens/Dashboard/index.ts`**
```typescript
export * from './Dashboard';
```

**Update `src/App.tsx`:**
```typescript
import { Dashboard } from './screens/Dashboard';
import './lib/i18n';

function App() {
  return <Dashboard />;
}

export default App;
```

**Verification:**
- [ ] Dashboard hiển thị Timer
- [ ] Controls hoạt động
- [ ] Countdown chạy đúng

---

### Task 9: Final Testing

**Mô tả:** Test toàn bộ timer flow

**Test Cases:**

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 1 | Click Play | Timer bắt đầu đếm ngược | ⬜ |
| 2 | Click Pause | Timer tạm dừng | ⬜ |
| 3 | Click Resume | Timer tiếp tục | ⬜ |
| 4 | Click Reset | Timer về 20:00 | ⬜ |
| 5 | Click Skip | Trigger break mode | ⬜ |
| 6 | Wait for 0 | Tự động chuyển break | ⬜ |
| 7 | Switch timer type | Thời gian thay đổi | ⬜ |
| 8 | Refresh app | State được restore | ⬜ |

**Commands:**
```bash
# Chạy dev
npm run tauri dev

# Check Rust logs
# Terminal sẽ hiện logs từ Rust backend
```

**Verification:**
- [ ] Tất cả test cases pass
- [ ] Không có console errors
- [ ] Timer đồng bộ chính xác giữa Rust và React

---

## 📊 DELIVERABLES

```
src-tauri/src/
├── core/
│   ├── mod.rs
│   ├── timer_types.rs
│   └── timer.rs
├── commands/
│   ├── mod.rs
│   └── timer_commands.rs
└── main.rs (updated)

src/
├── stores/
│   └── timerStore.ts
├── components/
│   └── Timer/
│       ├── index.ts
│       ├── TimerDisplay.tsx
│       └── TimerControls.tsx
└── screens/
    └── Dashboard/
        ├── index.ts
        └── Dashboard.tsx
```

---

## 📝 BÁO CÁO HOÀN THÀNH

Sau khi hoàn thành, MISA tạo file: `docs/modules/M02_COMPLETED.md`

**Template:**
```markdown
# M02: TIMER ENGINE - BÁO CÁO HOÀN THÀNH

> **Completed by:** MISA
> **Date:** [YYYY-MM-DD]
> **Duration:** [X hours]

## ✅ TASKS COMPLETED

| # | Task | Status |
|---|------|--------|
| 1 | Tạo Timer Types | ✅ |
| 2 | Implement Timer Logic | ✅ |
| 3 | Tạo Tauri Commands | ✅ |
| 4 | Register Commands | ✅ |
| 5 | Tạo Timer Store | ✅ |
| 6 | Tạo TimerDisplay | ✅ |
| 7 | Tạo TimerControls | ✅ |
| 8 | Tích hợp Dashboard | ✅ |
| 9 | Final Testing | ✅ |

## 🧪 TEST RESULTS

| Test Case | Result |
|-----------|--------|
| Start timer | ✅ |
| Pause/Resume | ✅ |
| Reset | ✅ |
| Skip to break | ✅ |

## 📁 FILES CREATED

- src-tauri/src/core/timer_types.rs
- src-tauri/src/core/timer.rs
- [... list all]

## ⚠️ ISSUES ENCOUNTERED

[Mô tả vấn đề]

## 📌 NOTES FOR M03

[Ghi chú cho Idle Detection module]
```

---

## 🔗 THAM KHẢO

| Tài liệu | Mục đích |
|----------|----------|
| `docs/ARCHITECTURE.md` | IPC design |
| `docs/PRD.md` | Timer logic (F01) |
| Tauri Events | https://v2.tauri.app/develop/calling-rust/#events |

---

> **Module này do LUMB soạn cho MISA thực hiện.**  
> Dependencies: M01 ✅  
> Sau khi hoàn thành, tiến hành M03: Idle Detection
