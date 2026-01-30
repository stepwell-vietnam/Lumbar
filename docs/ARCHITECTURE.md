# LUMBAR - KIẾN TRÚC HỆ THỐNG

> **Tài liệu:** System Architecture  
> **Version:** 1.0  
> **Cập nhật:** 2026-01-29

---

## 📋 MỤC LỤC

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Tech Stack](#2-tech-stack)
3. [Kiến Trúc Layers](#3-kiến-trúc-layers)
4. [Cấu Trúc Thư Mục](#4-cấu-trúc-thư-mục)
5. [Backend (Rust/Tauri)](#5-backend-rusttauri)
6. [Frontend (React)](#6-frontend-react)
7. [Data Flow](#7-data-flow)
8. [State Management](#8-state-management)
9. [Storage & Persistence](#9-storage--persistence)
10. [Inter-Process Communication](#10-inter-process-communication)

---

## 1. TỔNG QUAN KIẾN TRÚC

### 1.1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LUMBAR APPLICATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (WebView)                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │    React    │  │   Zustand   │  │    i18next      │   │  │
│  │  │ Components  │  │    Store    │  │  (VI/EN)        │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │  Tailwind   │  │   Framer    │  │     Hooks       │   │  │
│  │  │    CSS      │  │   Motion    │  │                 │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ▲                                  │
│                              │ Tauri IPC                        │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    BACKEND (Rust)                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │   Timer     │  │    Idle     │  │   Notification  │   │  │
│  │  │   Engine    │  │  Detection  │  │     System      │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │   System    │  │   Storage   │  │    Commands     │   │  │
│  │  │    Tray     │  │   (JSON)    │  │                 │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ▲                                  │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    OPERATING SYSTEM                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │   macOS     │  │   Windows   │  │  File System    │   │  │
│  │  │   APIs      │  │    APIs     │  │                 │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. Đặc Điểm Chính

| Đặc điểm | Mô tả |
|----------|-------|
| **Hybrid App** | Rust backend + Web frontend |
| **Cross-platform** | macOS + Windows từ cùng codebase |
| **Lightweight** | <10MB bundle, <50MB RAM |
| **Offline-first** | Không cần internet |
| **Privacy-first** | Không gửi dữ liệu về server |

---

## 2. TECH STACK

### 2.1. Backend (Rust)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Tauri | 2.0 | App framework |
| Language | Rust | 1.75+ | Backend logic |
| Timer | tokio | latest | Async runtime |
| Storage | tauri-plugin-store | latest | JSON persistence |
| Tray | tauri built-in | - | System tray |
| Notifications | tauri-plugin-notification | latest | OS notifications |

### 2.2. Frontend (Web)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18 | UI components |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Animation | Framer Motion | 11.x | Smooth animations |
| State | Zustand | 4.x | State management |
| i18n | i18next | 23.x | Internationalization |
| Build | Vite | 5.x | Fast bundler |

---

## 3. KIẾN TRÚC LAYERS

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  Components, Screens, Styling, Animations               │
├─────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                     │
│  Hooks, Stores, Business Logic, i18n                    │
├─────────────────────────────────────────────────────────┤
│                    INTEGRATION LAYER                     │
│  Tauri Commands, IPC Bridge, Event Listeners            │
├─────────────────────────────────────────────────────────┤
│                    DOMAIN LAYER (Rust)                   │
│  Timer Engine, Idle Detection, Notification Logic       │
├─────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                  │
│  Storage, OS APIs, System Tray, File System             │
└─────────────────────────────────────────────────────────┘
```

---

## 4. CẤU TRÚC THƯ MỤC

```
lumbar/
├── src-tauri/                      # 🦀 RUST BACKEND
│   ├── src/
│   │   ├── main.rs                 # Entry point
│   │   ├── lib.rs                  # Library exports
│   │   ├── commands/               # Tauri commands
│   │   │   ├── mod.rs
│   │   │   ├── timer.rs            # Timer commands
│   │   │   ├── settings.rs         # Settings commands
│   │   │   └── stats.rs            # Stats commands
│   │   ├── core/                   # Core logic
│   │   │   ├── mod.rs
│   │   │   ├── timer.rs            # Timer engine
│   │   │   ├── idle.rs             # Idle detection
│   │   │   └── notification.rs     # Notification logic
│   │   ├── storage/                # Persistence
│   │   │   ├── mod.rs
│   │   │   └── store.rs            # JSON store
│   │   └── tray/                   # System tray
│   │       ├── mod.rs
│   │       └── menu.rs             # Tray menu
│   ├── Cargo.toml
│   ├── tauri.conf.json             # Tauri config
│   └── icons/                      # App icons
│
├── src/                            # ⚛️ REACT FRONTEND
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component
│   ├── components/                 # UI Components
│   │   ├── ui/                     # Primitives (Button, Card, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── Mascot/                 # Mascot component
│   │   │   ├── Mascot.tsx
│   │   │   ├── MascotStates.ts
│   │   │   └── index.ts
│   │   ├── Timer/                  # Timer display
│   │   │   ├── TimerDisplay.tsx
│   │   │   └── index.ts
│   │   └── HealthTip/              # Health tips
│   │       ├── HealthTipCard.tsx
│   │       └── index.ts
│   │
│   ├── screens/                    # Screen components
│   │   ├── Dashboard/              # S02: Mini Dashboard
│   │   │   └── Dashboard.tsx
│   │   ├── Overlay/                # S03: Break Overlay
│   │   │   └── Overlay.tsx
│   │   ├── Settings/               # S04: Settings
│   │   │   └── Settings.tsx
│   │   └── Stats/                  # S06: Stats (Phase 3)
│   │       └── Stats.tsx
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── timerStore.ts           # Timer state
│   │   ├── settingsStore.ts        # Settings state
│   │   └── mascotStore.ts          # Mascot state
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useTimer.ts             # Timer hook
│   │   ├── useTauri.ts             # Tauri commands
│   │   └── useTranslation.ts       # i18n wrapper
│   │
│   ├── locales/                    # i18n files
│   │   ├── vi.json                 # Vietnamese
│   │   └── en.json                 # English
│   │
│   ├── lib/                        # Utilities
│   │   ├── tauri.ts                # Tauri helpers
│   │   ├── constants.ts            # App constants
│   │   └── utils.ts                # General utils
│   │
│   ├── types/                      # TypeScript types
│   │   ├── timer.ts
│   │   ├── settings.ts
│   │   └── mascot.ts
│   │
│   └── styles/                     # Global styles
│       └── globals.css             # Tailwind imports
│
├── public/                         # Static assets
│   └── assets/
│       ├── mascot/                 # Mascot images
│       │   ├── happy.svg
│       │   ├── sad.svg
│       │   └── angry.svg
│       └── sounds/                 # Sound effects
│           └── notification.mp3
│
├── docs/                           # Documentation
│   ├── PRD.md
│   ├── FEATURES_AND_UI.md
│   ├── UI_GUIDE.md
│   └── ARCHITECTURE.md             # This file
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 5. BACKEND (Rust/Tauri)

### 5.1. Core Modules

#### Timer Engine (`src-tauri/src/core/timer.rs`)

```
┌─────────────────────────────────────────────────────────┐
│                    TIMER ENGINE                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  State Machine:                                         │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐           │
│  │ RUNNING │ ──► │  BREAK  │ ──► │ RUNNING │           │
│  └─────────┘     └─────────┘     └─────────┘           │
│       │               │               ▲                 │
│       ▼               ▼               │                 │
│  ┌─────────┐     ┌─────────┐          │                 │
│  │ PAUSED  │     │ SNOOZE  │ ─────────┘                 │
│  └─────────┘     └─────────┘                            │
│                                                         │
│  Events emitted to Frontend:                            │
│  - timer:tick (remaining_seconds)                       │
│  - timer:break_start                                    │
│  - timer:break_end                                      │
│  - timer:state_changed                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Idle Detection (`src-tauri/src/core/idle.rs`)

```
┌─────────────────────────────────────────────────────────┐
│                   IDLE DETECTION                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Input Monitoring:                                      │
│  - Mouse movement                                       │
│  - Keyboard activity                                    │
│  - Check interval: 1 second                             │
│                                                         │
│  Logic:                                                 │
│  IF no_input > idle_threshold (default 2 min) THEN      │
│      emit("idle:started")                               │
│      pause_timer()                                      │
│  END                                                    │
│                                                         │
│  ON input_detected:                                     │
│      IF was_idle THEN                                   │
│          emit("idle:ended")                             │
│          resume_timer()                                 │
│      END                                                │
│  END                                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2. Tauri Commands

| Command | Input | Output | Description |
|---------|-------|--------|-------------|
| `start_timer` | - | `Result<()>` | Bắt đầu timer |
| `pause_timer` | - | `Result<()>` | Tạm dừng timer |
| `resume_timer` | - | `Result<()>` | Tiếp tục timer |
| `skip_to_break` | - | `Result<()>` | Skip đến break |
| `snooze` | `minutes: u32` | `Result<()>` | Hoãn break |
| `take_break` | - | `Result<()>` | Xác nhận nghỉ |
| `get_timer_state` | - | `TimerState` | Lấy trạng thái |
| `get_settings` | - | `Settings` | Lấy cài đặt |
| `save_settings` | `Settings` | `Result<()>` | Lưu cài đặt |
| `get_stats` | - | `Stats` | Lấy thống kê |

---

## 6. FRONTEND (React)

### 6.1. Component Hierarchy

```
App
├── TrayProvider (context)
│
├── [Window: Dashboard]
│   └── Dashboard
│       ├── Mascot
│       ├── TimerDisplay
│       └── ActionButtons
│
├── [Window: Overlay]
│   └── Overlay
│       ├── BackdropBlur
│       ├── Mascot (large)
│       ├── Message
│       ├── HealthTipCard
│       └── BreakButtons
│
├── [Window: Settings]
│   └── Settings
│       ├── TimerSettings
│       ├── NotificationSettings
│       └── GeneralSettings
│
└── [Window: Stats] (Phase 3)
    └── Stats
        ├── StreakDisplay
        ├── WeeklyChart
        └── Achievements
```

### 6.2. Windows Configuration

| Window | Size | Decorations | Always on Top |
|--------|------|-------------|---------------|
| Dashboard | 300×400 | Yes | No |
| Overlay | Fullscreen | No | Yes |
| Settings | 400×550 | Yes | No |
| Stats | 450×600 | Yes | No |

---

## 7. DATA FLOW

### 7.1. Timer Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐   │
│  │  Timer  │────►│  Event  │────►│ Zustand │────►│  React  │   │
│  │ Engine  │     │ Emitter │     │  Store  │     │   UI    │   │
│  │ (Rust)  │     │  (IPC)  │     │  (JS)   │     │         │   │
│  └─────────┘     └─────────┘     └─────────┘     └─────────┘   │
│       ▲                                               │         │
│       │                                               │         │
│       └───────────── User Actions (Commands) ─────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2. Settings Flow

```
User changes setting
        │
        ▼
┌─────────────────┐
│  Settings UI    │
└────────┬────────┘
         │ onChange
         ▼
┌─────────────────┐
│ settingsStore   │ ──► Local state update (instant UI feedback)
└────────┬────────┘
         │ invoke("save_settings")
         ▼
┌─────────────────┐
│  Rust Backend   │ ──► JSON file write
└────────┬────────┘
         │ emit("settings:updated")
         ▼
┌─────────────────┐
│  Timer Engine   │ ──► Apply new intervals
└─────────────────┘
```

---

## 8. STATE MANAGEMENT

### 8.1. Zustand Stores

#### timerStore

```typescript
interface TimerState {
  // State
  status: 'running' | 'paused' | 'break' | 'snooze';
  remainingSeconds: number;
  breakType: 'micro' | 'rest';
  snoozeCount: number;
  
  // Actions
  setStatus: (status: Status) => void;
  tick: () => void;
  startBreak: (type: BreakType) => void;
  endBreak: () => void;
  incrementSnooze: () => void;
  resetSnooze: () => void;
}
```

#### settingsStore

```typescript
interface SettingsState {
  // Timer
  microBreakInterval: number;    // minutes
  microBreakDuration: number;    // seconds
  restBreakInterval: number;     // minutes
  restBreakDuration: number;     // minutes
  
  // Notifications
  soundEnabled: boolean;
  notificationLevel: 1 | 2 | 3;
  snoozeLimit: number;
  
  // General
  language: 'vi' | 'en';
  theme: 'light' | 'dark' | 'system';
  startWithOS: boolean;
  idleThreshold: number;         // minutes
  
  // Actions
  updateSettings: (partial: Partial<Settings>) => void;
  resetToDefaults: () => void;
}
```

#### mascotStore

```typescript
interface MascotState {
  // State
  mood: 'happy' | 'neutral' | 'sad' | 'angry' | 'sleeping';
  message: string;
  
  // Actions
  setMood: (mood: Mood) => void;
  setMessage: (message: string) => void;
  updateBasedOnContext: (context: Context) => void;
}
```

---

## 9. STORAGE & PERSISTENCE

### 9.1. File Structure

```
~/.lumbar/                          # App data directory
├── settings.json                   # User settings
├── stats.json                      # Statistics
└── logs/                           # Debug logs (optional)
```

### 9.2. Settings Schema

```json
{
  "version": 1,
  "timer": {
    "microBreakInterval": 20,
    "microBreakDuration": 20,
    "restBreakInterval": 60,
    "restBreakDuration": 5
  },
  "notifications": {
    "soundEnabled": true,
    "notificationLevel": 3,
    "snoozeLimit": 3
  },
  "general": {
    "language": "vi",
    "theme": "system",
    "startWithOS": true,
    "idleThreshold": 2
  }
}
```

### 9.3. Stats Schema

```json
{
  "version": 1,
  "today": {
    "date": "2026-01-29",
    "breaksCompleted": 18,
    "breaksMissed": 2,
    "snoozeCount": 5,
    "totalWorkMinutes": 480
  },
  "streak": {
    "current": 7,
    "best": 14,
    "lastActiveDate": "2026-01-29"
  },
  "allTime": {
    "totalBreaks": 126,
    "totalSnoozes": 45
  }
}
```

---

## 10. INTER-PROCESS COMMUNICATION

### 10.1. Tauri Events (Backend → Frontend)

| Event | Payload | Trigger |
|-------|---------|---------|
| `timer:tick` | `{ remaining: number }` | Mỗi giây |
| `timer:break_start` | `{ type: 'micro' \| 'rest' }` | Đến giờ nghỉ |
| `timer:break_end` | `{}` | Hết giờ nghỉ |
| `timer:state_changed` | `{ status: Status }` | Thay đổi trạng thái |
| `idle:started` | `{}` | Bắt đầu idle |
| `idle:ended` | `{}` | Kết thúc idle |
| `settings:updated` | `Settings` | Settings thay đổi |

### 10.2. Tauri Commands (Frontend → Backend)

```typescript
// Timer commands
await invoke('start_timer');
await invoke('pause_timer');
await invoke('resume_timer');
await invoke('skip_to_break');
await invoke('snooze', { minutes: 5 });
await invoke('take_break');

// Settings commands
const settings = await invoke<Settings>('get_settings');
await invoke('save_settings', { settings });

// Stats commands
const stats = await invoke<Stats>('get_stats');
```

---

## 📋 CHECKLIST IMPLEMENTATION

### Phase 1: MVP

- [ ] M01: Project Setup (Tauri + React + i18n)
- [ ] M02: Timer Engine (Rust)
- [ ] M03: Idle Detection (Rust)
- [ ] M04: System Tray
- [ ] M05: Break Overlay
- [ ] M06: Settings

### Phase 2: Personality

- [ ] M07: Mascot System
- [ ] M08: Notification Escalation
- [ ] M09: Health Tips

### Phase 3: Gamification

- [ ] M10: Stats & Gamification

---

> 📝 **Tài liệu này mô tả kiến trúc kỹ thuật của Lumbar. Cần review trước khi bắt đầu implementation.**
