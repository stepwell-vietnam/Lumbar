# M13: AUTO-START & TRAY-FIRST UX

> **Mục tiêu:** App tự động chạy và ẩn xuống System Tray  
> **UX Goal:** Set-and-forget, không cần bấm nút  
> **Priority:** P0 - Core UX  
> **Estimated:** 1 ngày

---

## 📋 TỔNG QUAN

### Hiện tại:
```
App Launch → Dashboard hiển thị → User phải bấm "Start Working"
```

### Mới:
```
App Launch → First-run? → Auto-start timer → Toast → Minimize to Tray
```

---

## 🔄 USER FLOW

### Lần đầu tiên (First Run):

```
┌─────────────────────────────────┐
│     🪵 Chào mừng đến Lumbar!    │
│                                 │
│  Lumbar sẽ tự động nhắc bạn    │
│  nghỉ ngơi mỗi 20 phút.        │
│                                 │
│  App sẽ chạy ẩn trong System   │
│  Tray. Click vào 🪵 để mở.     │
│                                 │
│  [✅ Bắt đầu ngay]              │
│  [⚙️ Cài đặt trước]             │
└─────────────────────────────────┘
```

### Lần sau (Returning User):

```
App Launch
    ↓
Show Dashboard (1-2s)
    ↓
Toast: "🪵 Lumbar đang hoạt động"
    ↓
Auto-start timer
    ↓
Minimize to Tray
    ↓
Run silently
```

---

## 📋 TASKS

### Task 1: First-Run Detection

**File:** `src/hooks/useFirstRun.ts`

```typescript
import { useState, useEffect } from 'react';

const FIRST_RUN_KEY = 'lumbar_first_run_completed';

export const useFirstRun = () => {
    const [isFirstRun, setIsFirstRun] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const checkFirstRun = () => {
            const completed = localStorage.getItem(FIRST_RUN_KEY);
            setIsFirstRun(!completed);
            setIsLoading(false);
        };
        checkFirstRun();
    }, []);
    
    const completeFirstRun = () => {
        localStorage.setItem(FIRST_RUN_KEY, 'true');
        setIsFirstRun(false);
    };
    
    return { isFirstRun, isLoading, completeFirstRun };
};
```

---

### Task 2: Welcome Screen Component

**File:** `src/components/Welcome/WelcomeScreen.tsx`

```typescript
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mascot } from '../Mascot';

interface WelcomeScreenProps {
    onStart: () => void;
    onSettings: () => void;
}

export const WelcomeScreen: FC<WelcomeScreenProps> = ({ onStart, onSettings }) => {
    const { t } = useTranslation();
    
    return (
        <motion.div 
            className="flex flex-col items-center justify-center h-full p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Mascot size="lg" state="happy" showMessage={false} />
            
            <h1 className="text-2xl font-bold text-gray-800 mt-6">
                {t('welcome.title')}
            </h1>
            
            <p className="text-gray-600 mt-4 max-w-xs">
                {t('welcome.description')}
            </p>
            
            <p className="text-gray-500 text-sm mt-4">
                {t('welcome.tray_hint')}
            </p>
            
            <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">
                <motion.button
                    onClick={onStart}
                    className="bg-gradient-to-r from-orange-400 to-red-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    ✅ {t('welcome.start_now')}
                </motion.button>
                
                <motion.button
                    onClick={onSettings}
                    className="bg-white/80 text-gray-700 py-3 px-6 rounded-xl font-medium border border-gray-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    ⚙️ {t('welcome.settings_first')}
                </motion.button>
            </div>
        </motion.div>
    );
};
```

---

### Task 3: i18n Welcome Messages

**Thêm vào `src/locales/vi.json`:**

```json
{
    "welcome": {
        "title": "Chào mừng đến Lumbar! 🪵",
        "description": "Lumbar sẽ tự động nhắc bạn nghỉ ngơi mỗi 20 phút để bảo vệ mắt và cột sống.",
        "tray_hint": "App sẽ chạy ẩn trong System Tray. Click vào 🪵 để mở lại.",
        "start_now": "Bắt đầu ngay",
        "settings_first": "Cài đặt trước"
    },
    "toast": {
        "app_running": "🪵 Lumbar đang hoạt động",
        "minimized": "Đã ẩn xuống System Tray"
    }
}
```

**Thêm vào `src/locales/en.json`:**

```json
{
    "welcome": {
        "title": "Welcome to Lumbar! 🪵",
        "description": "Lumbar will automatically remind you to take breaks every 20 minutes to protect your eyes and spine.",
        "tray_hint": "The app will run in the System Tray. Click 🪵 to open it.",
        "start_now": "Start Now",
        "settings_first": "Settings First"
    },
    "toast": {
        "app_running": "🪵 Lumbar is running",
        "minimized": "Minimized to System Tray"
    }
}
```

---

### Task 4: Auto-Start Logic

**Cập nhật `src/App.tsx`:**

```typescript
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useFirstRun } from './hooks/useFirstRun';
import { useTimerStore } from './stores/timerStore';
import { WelcomeScreen } from './components/Welcome/WelcomeScreen';
import { Dashboard } from './screens/Dashboard';
import { Settings } from './screens/Settings';
import { useToast } from './hooks/useToast';
import { useTranslation } from 'react-i18next';

function App() {
    const { t } = useTranslation();
    const { isFirstRun, isLoading, completeFirstRun } = useFirstRun();
    const { start } = useTimerStore();
    const { showToast } = useToast();
    const [showSettings, setShowSettings] = useState(false);
    
    const handleStart = async () => {
        // Complete first run
        completeFirstRun();
        
        // Start timer
        start();
        
        // Show toast
        showToast(t('toast.app_running'), 2000);
        
        // Minimize to tray after delay
        setTimeout(async () => {
            await invoke('hide_window');
        }, 2500);
    };
    
    const handleSettingsFirst = () => {
        setShowSettings(true);
    };
    
    // Auto-start for returning users
    useEffect(() => {
        if (!isLoading && !isFirstRun) {
            handleStart();
        }
    }, [isLoading, isFirstRun]);
    
    if (isLoading) {
        return <LoadingScreen />;
    }
    
    if (isFirstRun) {
        if (showSettings) {
            return <Settings onBack={() => setShowSettings(false)} onSave={handleStart} />;
        }
        return <WelcomeScreen onStart={handleStart} onSettings={handleSettingsFirst} />;
    }
    
    return <Dashboard />;
}
```

---

### Task 5: Rust Hide Window Command

**Thêm vào `src-tauri/src/commands/tray_commands.rs`:**

```rust
use tauri::{command, AppHandle, Manager};

#[command]
pub async fn hide_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
        println!("✅ Window hidden to tray");
    }
    Ok(())
}

#[command]
pub async fn show_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        println!("✅ Window shown");
    }
    Ok(())
}
```

---

### Task 6: Update Tray Menu

**Cập nhật tray menu để "Show Dashboard" gọi `show_window`:**

```rust
// Trong tray setup
"show" => {
    if let Some(window) = app.get_webview_window("main") {
        window.show().unwrap();
        window.set_focus().unwrap();
    }
}
```

---

### Task 7: Toast Component

**File:** `src/components/Toast/Toast.tsx`

```typescript
import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
    message: string;
    isVisible: boolean;
}

export const Toast: FC<ToastProps> = ({ message, isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg z-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
            >
                {message}
            </motion.div>
        )}
    </AnimatePresence>
);
```

**File:** `src/hooks/useToast.ts`

```typescript
import { create } from 'zustand';

interface ToastState {
    message: string;
    isVisible: boolean;
    showToast: (message: string, duration?: number) => void;
    hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
    message: '',
    isVisible: false,
    
    showToast: (message: string, duration = 3000) => {
        set({ message, isVisible: true });
        setTimeout(() => set({ isVisible: false }), duration);
    },
    
    hideToast: () => set({ isVisible: false }),
}));
```

---

### Task 8: Settings Option "Show on Start"

**Thêm vào Settings:**

```typescript
// Trong SettingsPanel.tsx
<div className="flex items-center justify-between">
    <label>{t('settings.show_on_start')}</label>
    <Switch
        checked={settings.showOnStart}
        onChange={(v) => updateSetting('showOnStart', v)}
    />
</div>
```

```json
// i18n
"settings": {
    "show_on_start": "Hiển thị khi khởi động"
}
```

---

## 📁 FILES SUMMARY

### New Files (5):
```
src/hooks/useFirstRun.ts
src/hooks/useToast.ts
src/components/Welcome/WelcomeScreen.tsx
src/components/Welcome/index.ts
src/components/Toast/Toast.tsx
```

### Modified Files (5):
```
src/App.tsx
src/locales/vi.json
src/locales/en.json
src-tauri/src/commands/tray_commands.rs
src-tauri/src/commands/mod.rs
```

---

## 🧪 TESTING

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | First launch | Show WelcomeScreen |
| 2 | Click "Bắt đầu ngay" | Timer starts, toast, minimize |
| 3 | Click "Cài đặt trước" | Show Settings |
| 4 | Second launch | Auto-start, toast, minimize |
| 5 | Click tray icon | Show Dashboard |
| 6 | Settings "Show on start" OFF | Skip minimize |

---

## 🚀 COMMAND CHO MISA:

```
@MISA Hãy đọc file docs/modules/M13_AUTO_START_UX.md và thực hiện 8 tasks:

1. Task 1: useFirstRun hook
2. Task 2: WelcomeScreen component
3. Task 3: i18n welcome/toast messages
4. Task 4: Update App.tsx với auto-start logic
5. Task 5: Rust hide_window/show_window commands
6. Task 6: Update tray menu
7. Task 7: Toast component và hook
8. Task 8: Settings "Show on start" option

Ưu tiên: Tasks 1-4 (frontend) trước, sau đó Tasks 5-6 (backend).
Báo cáo khi hoàn thành mỗi task.
```

---

*Created by LUMB - 2026-01-30*
