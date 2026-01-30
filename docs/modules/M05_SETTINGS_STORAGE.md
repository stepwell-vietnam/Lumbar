# M05: SETTINGS UI & DATA STORAGE

> **Module:** M05 - Settings UI & Data Storage  
> **Priority:** P1 (High)  
> **Assigned:** MISA  
> **Estimated:** 2-3 ngày  
> **Prerequisites:** M01 ✅, M02 ✅, M03 ✅, M04  
> **Cập nhật:** 2026-01-29

---

## 📋 MỤC TIÊU

Xây dựng Settings Window và Data Persistence cho Lumbar:

1. **Settings UI (S04)** - Cửa sổ cài đặt đầy đủ
2. **Settings Store** - Zustand store quản lý settings
3. **Data Persistence** - Lưu/Load settings từ JSON file
4. **Theme System** - Light/Dark/System theme

---

## 🏗️ KIẾN TRÚC

### Settings Categories

```
┌─────────────────────────────────────────────────────────────┐
│                      SETTINGS WINDOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⏱️ TIMER SETTINGS                                          │
│  ├─ Micro-break interval     [10-60 min]  Default: 20       │
│  ├─ Micro-break duration     [10-60 sec]  Default: 20       │
│  ├─ Rest-break interval      [30-120 min] Default: 60       │
│  └─ Rest-break duration      [3-15 min]   Default: 5        │
│                                                              │
│  🔔 NOTIFICATION SETTINGS                                    │
│  ├─ Sound enabled            [On/Off]     Default: On       │
│  ├─ Notification level       [1/2/3]      Default: 3        │
│  └─ Snooze limit             [1-5 times]  Default: 3        │
│                                                              │
│  🌐 GENERAL SETTINGS                                         │
│  ├─ Language                 [VI/EN]      Default: System   │
│  ├─ Theme                    [Light/Dark] Default: System   │
│  ├─ Start with OS            [On/Off]     Default: On       │
│  └─ Idle threshold           [1-10 min]   Default: 2        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Settings   │────►│   Zustand    │────►│  JSON File   │
│   Component  │     │    Store     │     │  (Tauri)     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
    User Input          In-Memory            Persistent
                        State                Storage
```

---

## ✅ DANH SÁCH TASKS

### TASK 1: Thêm Dependencies

**Mô tả:** Thêm tauri-plugin-store cho data persistence.

**File:** `src-tauri/Cargo.toml`

```toml
[dependencies]
# Thêm mới
tauri-plugin-store = "2"
```

**File:** `src-tauri/tauri.conf.json` (nếu cần permissions)

```json
{
  "plugins": {
    "store": {
      "enabled": true
    }
  }
}
```

**Verification:**
- [ ] `cargo build` thành công
- [ ] Plugin được load

---

### TASK 2: Tạo Settings Types (Rust)

**Mô tả:** Định nghĩa settings types cho Rust backend.

**File MỚI:** `src-tauri/src/core/settings_types.rs`

```rust
use serde::{Deserialize, Serialize};

/// User settings cho toàn bộ app
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub timer: TimerSettingsConfig,
    pub notification: NotificationSettingsConfig,
    pub general: GeneralSettingsConfig,
}

/// Timer settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerSettingsConfig {
    /// Micro-break interval (phút), range: 10-60
    pub micro_break_interval_min: u32,
    /// Micro-break duration (giây), range: 10-60
    pub micro_break_duration_sec: u32,
    /// Rest-break interval (phút), range: 30-120
    pub rest_break_interval_min: u32,
    /// Rest-break duration (phút), range: 3-15
    pub rest_break_duration_min: u32,
}

/// Notification settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettingsConfig {
    /// Bật/tắt âm thanh
    pub sound_enabled: bool,
    /// Level notification max (1/2/3)
    pub notification_level: u8,
    /// Số lần snooze tối đa
    pub snooze_limit: u8,
}

/// General settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneralSettingsConfig {
    /// Ngôn ngữ: "vi" | "en" | "system"
    pub language: String,
    /// Theme: "light" | "dark" | "system"
    pub theme: String,
    /// Khởi động cùng OS
    pub start_with_os: bool,
    /// Ngưỡng idle (phút)
    pub idle_threshold_min: u32,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            timer: TimerSettingsConfig::default(),
            notification: NotificationSettingsConfig::default(),
            general: GeneralSettingsConfig::default(),
        }
    }
}

impl Default for TimerSettingsConfig {
    fn default() -> Self {
        Self {
            micro_break_interval_min: 20,
            micro_break_duration_sec: 20,
            rest_break_interval_min: 60,
            rest_break_duration_min: 5,
        }
    }
}

impl Default for NotificationSettingsConfig {
    fn default() -> Self {
        Self {
            sound_enabled: true,
            notification_level: 3,
            snooze_limit: 3,
        }
    }
}

impl Default for GeneralSettingsConfig {
    fn default() -> Self {
        Self {
            language: "system".to_string(),
            theme: "system".to_string(),
            start_with_os: true,
            idle_threshold_min: 2,
        }
    }
}
```

**Verification:**
- [ ] Types compile thành công
- [ ] Export trong mod.rs

---

### TASK 3: Tạo Settings Commands (Rust)

**Mô tả:** Tauri commands để load/save settings.

**File MỚI:** `src-tauri/src/commands/settings_commands.rs`

```rust
use tauri::{command, AppHandle};
use tauri_plugin_store::StoreExt;
use serde_json::json;

use crate::core::settings_types::AppSettings;

const SETTINGS_FILE: &str = "settings.json";
const SETTINGS_KEY: &str = "app_settings";

/// Load settings từ file
#[command]
pub async fn settings_load(app_handle: AppHandle) -> Result<AppSettings, String> {
    let store = app_handle
        .store(SETTINGS_FILE)
        .map_err(|e| format!("Failed to open store: {}", e))?;
    
    match store.get(SETTINGS_KEY) {
        Some(value) => {
            serde_json::from_value(value.clone())
                .map_err(|e| format!("Failed to parse settings: {}", e))
        }
        None => {
            // Trả về default settings nếu chưa có
            let default_settings = AppSettings::default();
            // Lưu default settings
            let _ = store.set(SETTINGS_KEY, json!(default_settings));
            let _ = store.save();
            Ok(default_settings)
        }
    }
}

/// Lưu settings vào file
#[command]
pub async fn settings_save(
    app_handle: AppHandle,
    settings: AppSettings,
) -> Result<(), String> {
    let store = app_handle
        .store(SETTINGS_FILE)
        .map_err(|e| format!("Failed to open store: {}", e))?;
    
    store.set(SETTINGS_KEY, json!(settings));
    store.save().map_err(|e| format!("Failed to save settings: {}", e))?;
    
    Ok(())
}

/// Reset settings về mặc định
#[command]
pub async fn settings_reset(app_handle: AppHandle) -> Result<AppSettings, String> {
    let store = app_handle
        .store(SETTINGS_FILE)
        .map_err(|e| format!("Failed to open store: {}", e))?;
    
    let default_settings = AppSettings::default();
    store.set(SETTINGS_KEY, json!(default_settings));
    store.save().map_err(|e| format!("Failed to save settings: {}", e))?;
    
    Ok(default_settings)
}
```

**Verification:**
- [ ] Commands compile thành công
- [ ] Export trong commands/mod.rs

---

### TASK 4: Register Settings Commands

**Mô tả:** Đăng ký commands và plugin trong lib.rs.

**File:** `src-tauri/src/lib.rs`

```rust
// THÊM imports
use commands::{
    // ... existing ...
    settings_load,
    settings_save,
    settings_reset,
};

// Trong hàm run():
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build()) // THÊM
        // ... existing manages ...
        .invoke_handler(tauri::generate_handler![
            // ... existing commands ...
            // Settings commands - THÊM
            settings_load,
            settings_save,
            settings_reset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Verification:**
- [ ] App khởi động không lỗi
- [ ] Commands có thể gọi được

---

### TASK 5: Update core/mod.rs và commands/mod.rs

**File:** `src-tauri/src/core/mod.rs`

```rust
// THÊM
mod settings_types;
pub use settings_types::{AppSettings, TimerSettingsConfig, NotificationSettingsConfig, GeneralSettingsConfig};
```

**File:** `src-tauri/src/commands/mod.rs`

```rust
// THÊM
mod settings_commands;
pub use settings_commands::{settings_load, settings_save, settings_reset};
```

---

### TASK 6: Tạo Settings Store (Frontend)

**Mô tả:** Zustand store quản lý settings state.

**File MỚI:** `src/stores/settingsStore.ts`

```typescript
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Types matching Rust structs
export interface TimerSettingsConfig {
    micro_break_interval_min: number;
    micro_break_duration_sec: number;
    rest_break_interval_min: number;
    rest_break_duration_min: number;
}

export interface NotificationSettingsConfig {
    sound_enabled: boolean;
    notification_level: number;
    snooze_limit: number;
}

export interface GeneralSettingsConfig {
    language: string;
    theme: string;
    start_with_os: boolean;
    idle_threshold_min: number;
}

export interface AppSettings {
    timer: TimerSettingsConfig;
    notification: NotificationSettingsConfig;
    general: GeneralSettingsConfig;
}

// Default values
const defaultSettings: AppSettings = {
    timer: {
        micro_break_interval_min: 20,
        micro_break_duration_sec: 20,
        rest_break_interval_min: 60,
        rest_break_duration_min: 5,
    },
    notification: {
        sound_enabled: true,
        notification_level: 3,
        snooze_limit: 3,
    },
    general: {
        language: 'system',
        theme: 'system',
        start_with_os: true,
        idle_threshold_min: 2,
    },
};

interface SettingsState {
    settings: AppSettings;
    isLoading: boolean;
    isDirty: boolean;
    
    // Actions
    initialize: () => Promise<void>;
    updateTimer: (timer: Partial<TimerSettingsConfig>) => void;
    updateNotification: (notification: Partial<NotificationSettingsConfig>) => void;
    updateGeneral: (general: Partial<GeneralSettingsConfig>) => void;
    save: () => Promise<void>;
    reset: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: defaultSettings,
    isLoading: true,
    isDirty: false,

    // Load settings từ backend
    initialize: async () => {
        if (!isTauri) {
            console.log('🌐 Settings store: browser mode - using defaults');
            set({ isLoading: false });
            return;
        }

        try {
            const settings = await invoke<AppSettings>('settings_load');
            set({ settings, isLoading: false });
            console.log('✅ Settings loaded:', settings);
        } catch (err) {
            console.error('Failed to load settings:', err);
            set({ isLoading: false });
        }
    },

    // Update timer settings (partial)
    updateTimer: (timerUpdate) => {
        set((state) => ({
            settings: {
                ...state.settings,
                timer: { ...state.settings.timer, ...timerUpdate },
            },
            isDirty: true,
        }));
    },

    // Update notification settings (partial)
    updateNotification: (notificationUpdate) => {
        set((state) => ({
            settings: {
                ...state.settings,
                notification: { ...state.settings.notification, ...notificationUpdate },
            },
            isDirty: true,
        }));
    },

    // Update general settings (partial)
    updateGeneral: (generalUpdate) => {
        set((state) => ({
            settings: {
                ...state.settings,
                general: { ...state.settings.general, ...generalUpdate },
            },
            isDirty: true,
        }));
    },

    // Save settings to backend
    save: async () => {
        if (!isTauri) {
            console.log('🌐 Settings save: browser mode - skipped');
            set({ isDirty: false });
            return;
        }

        try {
            await invoke('settings_save', { settings: get().settings });
            set({ isDirty: false });
            console.log('✅ Settings saved');
        } catch (err) {
            console.error('Failed to save settings:', err);
            throw err;
        }
    },

    // Reset to defaults
    reset: async () => {
        if (!isTauri) {
            set({ settings: defaultSettings, isDirty: false });
            return;
        }

        try {
            const settings = await invoke<AppSettings>('settings_reset');
            set({ settings, isDirty: false });
            console.log('✅ Settings reset to defaults');
        } catch (err) {
            console.error('Failed to reset settings:', err);
        }
    },
}));
```

**Verification:**
- [ ] TypeScript compile thành công
- [ ] Store được export

---

### TASK 7: Tạo Settings Components

**Mô tả:** Các components cho Settings Window.

**File MỚI:** `src/components/Settings/SettingsSection.tsx`

```typescript
import { FC, ReactNode } from 'react';

interface SettingsSectionProps {
    icon: string;
    title: string;
    children: ReactNode;
}

export const SettingsSection: FC<SettingsSectionProps> = ({ icon, title, children }) => {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{icon}</span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 space-y-4">
                {children}
            </div>
        </div>
    );
};
```

**File MỚI:** `src/components/Settings/SettingsRow.tsx`

```typescript
import { FC, ReactNode } from 'react';

interface SettingsRowProps {
    label: string;
    children: ReactNode;
}

export const SettingsRow: FC<SettingsRowProps> = ({ label, children }) => {
    return (
        <div className="flex items-center justify-between">
            <span className="text-white/80">{label}</span>
            <div>{children}</div>
        </div>
    );
};
```

**File MỚI:** `src/components/Settings/NumberInput.tsx`

```typescript
import { FC } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    suffix?: string;
}

export const NumberInput: FC<NumberInputProps> = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    suffix = '',
}) => {
    const decrease = () => {
        if (value > min) onChange(value - step);
    };

    const increase = () => {
        if (value < max) onChange(value + step);
    };

    return (
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
            <button
                onClick={decrease}
                disabled={value <= min}
                className="p-1 rounded hover:bg-white/20 disabled:opacity-30 transition-colors"
            >
                <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-medium min-w-[3rem] text-center">
                {value}{suffix}
            </span>
            <button
                onClick={increase}
                disabled={value >= max}
                className="p-1 rounded hover:bg-white/20 disabled:opacity-30 transition-colors"
            >
                <Plus className="w-4 h-4 text-white" />
            </button>
        </div>
    );
};
```

**File MỚI:** `src/components/Settings/Toggle.tsx`

```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Toggle: FC<ToggleProps> = ({ checked, onChange }) => {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`
                relative w-12 h-6 rounded-full transition-colors
                ${checked ? 'bg-[#4ECDC4]' : 'bg-white/20'}
            `}
        >
            <motion.div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                animate={{ x: checked ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );
};
```

**File MỚI:** `src/components/Settings/Select.tsx`

```typescript
import { FC } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
}

export const Select: FC<SelectProps> = ({ value, onChange, options }) => {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="
                    appearance-none bg-white/10 text-white px-4 py-2 pr-10 rounded-lg
                    border border-white/20 cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]
                "
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-800">
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
        </div>
    );
};
```

---

### TASK 8: Tạo Settings Panel

**Mô tả:** Panel chính chứa tất cả settings.

**File MỚI:** `src/components/Settings/SettingsPanel.tsx`

```typescript
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Save, RotateCcw, X } from 'lucide-react';

import { useSettingsStore } from '../../stores/settingsStore';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { NumberInput } from './NumberInput';
import { Toggle } from './Toggle';
import { Select } from './Select';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPanel: FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { settings, isDirty, isLoading, initialize, updateTimer, updateNotification, updateGeneral, save, reset } = useSettingsStore();

    useEffect(() => {
        if (isOpen) {
            initialize();
        }
    }, [isOpen, initialize]);

    const handleSave = async () => {
        await save();
        onClose();
    };

    const handleReset = async () => {
        if (confirm(t('settings.confirm_reset'))) {
            await reset();
        }
    };

    // Language change handler
    const handleLanguageChange = (lang: string) => {
        updateGeneral({ language: lang });
        if (lang !== 'system') {
            i18n.changeLanguage(lang);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#667eea]/90 to-[#764ba2]/90 backdrop-blur-xl rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        ⚙️ {t('settings.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="text-white/60 text-center py-8">Loading...</div>
                    ) : (
                        <>
                            {/* Timer Settings */}
                            <SettingsSection icon="⏱️" title={t('settings.timer')}>
                                <SettingsRow label={t('settings.micro_interval')}>
                                    <NumberInput
                                        value={settings.timer.micro_break_interval_min}
                                        onChange={(v) => updateTimer({ micro_break_interval_min: v })}
                                        min={10}
                                        max={60}
                                        suffix=" min"
                                    />
                                </SettingsRow>
                                <SettingsRow label={t('settings.micro_duration')}>
                                    <NumberInput
                                        value={settings.timer.micro_break_duration_sec}
                                        onChange={(v) => updateTimer({ micro_break_duration_sec: v })}
                                        min={10}
                                        max={60}
                                        suffix=" sec"
                                    />
                                </SettingsRow>
                                <SettingsRow label={t('settings.rest_interval')}>
                                    <NumberInput
                                        value={settings.timer.rest_break_interval_min}
                                        onChange={(v) => updateTimer({ rest_break_interval_min: v })}
                                        min={30}
                                        max={120}
                                        step={5}
                                        suffix=" min"
                                    />
                                </SettingsRow>
                                <SettingsRow label={t('settings.rest_duration')}>
                                    <NumberInput
                                        value={settings.timer.rest_break_duration_min}
                                        onChange={(v) => updateTimer({ rest_break_duration_min: v })}
                                        min={3}
                                        max={15}
                                        suffix=" min"
                                    />
                                </SettingsRow>
                            </SettingsSection>

                            {/* Notification Settings */}
                            <SettingsSection icon="🔔" title={t('settings.notifications')}>
                                <SettingsRow label={t('settings.sound')}>
                                    <Toggle
                                        checked={settings.notification.sound_enabled}
                                        onChange={(v) => updateNotification({ sound_enabled: v })}
                                    />
                                </SettingsRow>
                                <SettingsRow label={t('settings.notification_level')}>
                                    <Select
                                        value={String(settings.notification.notification_level)}
                                        onChange={(v) => updateNotification({ notification_level: Number(v) })}
                                        options={[
                                            { value: '1', label: t('settings.level_hint') },
                                            { value: '2', label: t('settings.level_toast') },
                                            { value: '3', label: t('settings.level_overlay') },
                                        ]}
                                    />
                                </SettingsRow>
                                <SettingsRow label={t('settings.snooze_limit')}>
                                    <NumberInput
                                        value={settings.notification.snooze_limit}
                                        onChange={(v) => updateNotification({ snooze_limit: v })}
                                        min={1}
                                        max={5}
                                        suffix="x"
                                    />
                                </SettingsRow>
                            </SettingsSection>

                            {/* General Settings */}
                            <SettingsSection icon="🌐" title={t('settings.general')}>
                                <SettingsRow label={t('settings.language')}>
                                    <Select
                                        value={settings.general.language}
                                        onChange={handleLanguageChange}
                                        options={[
                                            { value: 'system', label: t('settings.system') },
                                            { value: 'vi', label: 'Tiếng Việt' },
                                            { value: 'en', label: 'English' },
                                        ]}
                                    />
                                </SettingsRow>
                                <SettingsRow label={t('settings.theme')}>
                                    <Select
                                        value={settings.general.theme}
                                        onChange={(v) => updateGeneral({ theme: v })}
                                        options={[
                                            { value: 'system', label: t('settings.system') },
                                            { value: 'light', label: t('settings.light') },
                                            { value: 'dark', label: t('settings.dark') },
                                        ]}
                                    />
                                </SettingsRow>
                                <SettingsRow label={t('settings.start_with_os')}>
                                    <Toggle
                                        checked={settings.general.start_with_os}
                                        onChange={(v) => updateGeneral({ start_with_os: v })}
                                    />
                                </SettingsRow>
                                <SettingsRow label={t('settings.idle_threshold')}>
                                    <NumberInput
                                        value={settings.general.idle_threshold_min}
                                        onChange={(v) => updateGeneral({ idle_threshold_min: v })}
                                        min={1}
                                        max={10}
                                        suffix=" min"
                                    />
                                </SettingsRow>
                            </SettingsSection>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-white/10">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {t('settings.reset')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className="flex items-center gap-2 px-6 py-2 bg-[#4ECDC4] hover:bg-[#3dbdb5] disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {t('settings.save')}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
```

---

### TASK 9: Tạo Component Index

**File MỚI:** `src/components/Settings/index.ts`

```typescript
export { SettingsPanel } from './SettingsPanel';
export { SettingsSection } from './SettingsSection';
export { SettingsRow } from './SettingsRow';
export { NumberInput } from './NumberInput';
export { Toggle } from './Toggle';
export { Select } from './Select';
```

---

### TASK 10: Thêm i18n Strings

**File:** `src/locales/vi.json` (THÊM vào)

```json
{
  "settings": {
    "title": "Cài đặt",
    "timer": "Thời gian",
    "micro_interval": "Khoảng cách micro-break",
    "micro_duration": "Thời lượng micro-break",
    "rest_interval": "Khoảng cách rest-break",
    "rest_duration": "Thời lượng rest-break",
    "notifications": "Thông báo",
    "sound": "Âm thanh",
    "notification_level": "Mức thông báo",
    "level_hint": "Chỉ hint (icon)",
    "level_toast": "Toast notification",
    "level_overlay": "Overlay toàn màn hình",
    "snooze_limit": "Giới hạn snooze",
    "general": "Chung",
    "language": "Ngôn ngữ",
    "theme": "Giao diện",
    "system": "Theo hệ thống",
    "light": "Sáng",
    "dark": "Tối",
    "start_with_os": "Khởi động cùng OS",
    "idle_threshold": "Ngưỡng idle",
    "save": "Lưu",
    "reset": "Đặt lại mặc định",
    "confirm_reset": "Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?"
  }
}
```

**File:** `src/locales/en.json` (THÊM vào)

```json
{
  "settings": {
    "title": "Settings",
    "timer": "Timer",
    "micro_interval": "Micro-break interval",
    "micro_duration": "Micro-break duration",
    "rest_interval": "Rest-break interval",
    "rest_duration": "Rest-break duration",
    "notifications": "Notifications",
    "sound": "Sound",
    "notification_level": "Notification level",
    "level_hint": "Hint only (icon)",
    "level_toast": "Toast notification",
    "level_overlay": "Full overlay",
    "snooze_limit": "Snooze limit",
    "general": "General",
    "language": "Language",
    "theme": "Theme",
    "system": "System",
    "light": "Light",
    "dark": "Dark",
    "start_with_os": "Start with OS",
    "idle_threshold": "Idle threshold",
    "save": "Save",
    "reset": "Reset to defaults",
    "confirm_reset": "Are you sure you want to reset all settings to default?"
  }
}
```

---

### TASK 11: Integrate Settings vào App

**Mô tả:** Thêm Settings button và SettingsPanel vào App.

**File:** `src/App.tsx` (THÊM)

```tsx
import { useState } from 'react';
import { SettingsPanel } from './components/Settings';
import { Settings } from 'lucide-react';

function App() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="...">
            {/* Settings Button */}
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
                <Settings className="w-5 h-5 text-white" />
            </button>

            {/* ... existing content ... */}

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}
```

---

### TASK 12: Test Settings

**Verification:**

| # | Test | Expected |
|---|------|----------|
| 1 | Mở Settings | Panel hiển thị với animation |
| 2 | Thay đổi số | NumberInput cập nhật |
| 3 | Toggle switch | On/Off đổi trạng thái |
| 4 | Dropdown select | Options hiển thị |
| 5 | Click Save | Settings lưu, panel đóng |
| 6 | Reopen Settings | Settings đã lưu được load |
| 7 | Click Reset | Settings về mặc định |
| 8 | Change language | UI đổi ngôn ngữ |

---

## 📁 DELIVERABLES

### Rust Files:
- [ ] `src-tauri/src/core/settings_types.rs` (NEW)
- [ ] `src-tauri/src/commands/settings_commands.rs` (NEW)
- [ ] `src-tauri/src/core/mod.rs` (MODIFIED)
- [ ] `src-tauri/src/commands/mod.rs` (MODIFIED)
- [ ] `src-tauri/src/lib.rs` (MODIFIED)
- [ ] `src-tauri/Cargo.toml` (MODIFIED)

### React Files:
- [ ] `src/stores/settingsStore.ts` (NEW)
- [ ] `src/components/Settings/SettingsPanel.tsx` (NEW)
- [ ] `src/components/Settings/SettingsSection.tsx` (NEW)
- [ ] `src/components/Settings/SettingsRow.tsx` (NEW)
- [ ] `src/components/Settings/NumberInput.tsx` (NEW)
- [ ] `src/components/Settings/Toggle.tsx` (NEW)
- [ ] `src/components/Settings/Select.tsx` (NEW)
- [ ] `src/components/Settings/index.ts` (NEW)
- [ ] `src/locales/vi.json` (MODIFIED)
- [ ] `src/locales/en.json` (MODIFIED)
- [ ] `src/App.tsx` (MODIFIED)

---

## 📝 BÁO CÁO HOÀN THÀNH

Sau khi hoàn thành, MISA ghi vào file `docs/modules/M05_COMPLETED.md`:

```markdown
# M05: SETTINGS UI & STORAGE - BÁO CÁO HOÀN THÀNH

## ✅ Checklist

- [ ] Task 1-5: Rust backend
- [ ] Task 6: Settings Store
- [ ] Task 7-9: UI Components
- [ ] Task 10: i18n
- [ ] Task 11-12: Integration & Testing

## 🧪 Test Results

| Test | Status |
|------|--------|
| Settings load | ✅ / ❌ |
| Settings save | ✅ / ❌ |
| Settings reset | ✅ / ❌ |
| NumberInput | ✅ / ❌ |
| Toggle | ✅ / ❌ |
| Select | ✅ / ❌ |
| i18n switch | ✅ / ❌ |

## 📸 Screenshots

[Đính kèm]
```

---

## 🚀 LỆNH CHO MISA

```
MISA, thực hiện M05: Settings UI & Data Storage.

## Tóm tắt:
- 12 tasks trong file docs/modules/M05_SETTINGS_STORAGE.md
- Tạo Settings Window với 3 sections: Timer, Notifications, General
- Data persistence với tauri-plugin-store
- Glassmorphism UI components: NumberInput, Toggle, Select
- i18n support VI/EN

## Ưu tiên:
1. Rust: settings_types.rs, settings_commands.rs
2. Frontend: settingsStore.ts, SettingsPanel.tsx
3. Components: NumberInput, Toggle, Select
4. Integration: App.tsx

## Sau khi hoàn thành:
- Tạo file docs/modules/M05_COMPLETED.md
- Chụp screenshots Settings panel
- Báo cáo kết quả

Thực hiện từ Task 1 → Task 12.
```

---

*Generated by LUMB (Lumbar Advisor) - 2026-01-29*
