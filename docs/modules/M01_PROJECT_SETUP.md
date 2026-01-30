# MODULE M01: PROJECT SETUP

> **Module:** M01 - Project Setup  
> **Priority:** P0 (Critical)  
> **Assigned to:** MISA  
> **Created by:** LUMB  
> **Date:** 2026-01-29

---

## 📋 TỔNG QUAN

| Thông tin | Chi tiết |
|-----------|----------|
| **Mục tiêu** | Scaffold project Tauri + React + Tailwind |
| **Thời gian dự kiến** | 1-2 ngày |
| **Dependencies** | Không có (module đầu tiên) |
| **Output** | Project chạy được với `npm run tauri dev` |

---

## 🎯 MỤC TIÊU CHI TIẾT

Sau khi hoàn thành M01, project phải:
1. ✅ Chạy được với `npm run tauri dev`
2. ✅ Có đầy đủ folder structure theo ARCHITECTURE.md
3. ✅ Tailwind CSS hoạt động với custom tokens
4. ✅ i18n setup với VI/EN
5. ✅ Glassmorphism CSS variables sẵn sàng

---

## 📝 DANH SÁCH CÔNG VIỆC

### Task 1: Khởi tạo Project Tauri

**Mô tả:** Tạo project mới với Tauri 2.0 + React + TypeScript

**Commands:**
```bash
# Tạo project Tauri với React template
npm create tauri-app@latest lumbar -- --template react-ts

# Di chuyển vào thư mục
cd lumbar
```

**Verification:**
- [ ] Folder `src-tauri/` được tạo
- [ ] File `package.json` có scripts tauri
- [ ] Chạy `npm run tauri dev` không lỗi

---

### Task 2: Cài đặt Dependencies

**Mô tả:** Cài các packages cần thiết

**Commands:**
```bash
# Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite

# State Management
npm install zustand

# Animation
npm install framer-motion

# i18n
npm install i18next react-i18next

# Icons
npm install lucide-react

# Dev dependencies
npm install -D @types/node
```

**Package.json expected dependencies:**
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "zustand": "^4.x",
    "framer-motion": "^11.x",
    "i18next": "^23.x",
    "react-i18next": "^14.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "tailwindcss": "^4.x",
    "@tailwindcss/vite": "^4.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "@tauri-apps/cli": "^2.x"
  }
}
```

**Verification:**
- [ ] Tất cả packages install thành công
- [ ] Không có peer dependency warnings critical

---

### Task 3: Tạo Folder Structure

**Mô tả:** Tạo cấu trúc thư mục theo ARCHITECTURE.md

**Structure cần tạo:**
```
src/
├── components/
│   ├── ui/              # Primitive components
│   ├── Mascot/          # Mascot component
│   ├── Timer/           # Timer display
│   └── HealthTip/       # Health tips
├── screens/
│   ├── Dashboard/       # S02: Mini Dashboard
│   ├── Overlay/         # S03: Break Overlay
│   ├── Settings/        # S04: Settings
│   └── Stats/           # S06: Stats (Phase 3)
├── stores/              # Zustand stores
├── hooks/               # Custom hooks
├── locales/             # i18n files
├── lib/                 # Utilities
├── types/               # TypeScript types
└── styles/              # Global styles

src-tauri/src/
├── commands/            # Tauri commands
├── core/                # Core logic
├── storage/             # Persistence
└── tray/                # System tray

public/assets/
├── mascot/              # Mascot images
└── sounds/              # Sound effects
```

**Commands:**
```bash
# Frontend folders
mkdir -p src/components/ui src/components/Mascot src/components/Timer src/components/HealthTip
mkdir -p src/screens/Dashboard src/screens/Overlay src/screens/Settings src/screens/Stats
mkdir -p src/stores src/hooks src/locales src/lib src/types src/styles

# Backend folders
mkdir -p src-tauri/src/commands src-tauri/src/core src-tauri/src/storage src-tauri/src/tray

# Assets
mkdir -p public/assets/mascot public/assets/sounds
```

**Verification:**
- [ ] Tất cả folders được tạo
- [ ] Không có lỗi permission

---

### Task 4: Setup Tailwind CSS

**Mô tả:** Cấu hình Tailwind với custom tokens từ DESIGN_SYSTEM.md

**File: `vite.config.ts`**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
});
```

**File: `src/styles/globals.css`**
```css
@import "tailwindcss";

/* ========================================
   LUMBAR DESIGN SYSTEM - CSS VARIABLES
   ======================================== */

:root {
  /* Primary Colors */
  --color-primary: #FF6B35;
  --color-secondary: #4ECDC4;
  
  /* Text Colors */
  --color-text: #2D3436;
  --color-text-muted: #636E72;
  
  /* Background Colors */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F5F5;
  
  /* Glass Effect */
  --color-glass-bg: rgba(255, 255, 255, 0.25);
  --color-glass-border: rgba(255, 255, 255, 0.18);
  --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  
  /* Semantic */
  --color-success: #00B894;
  --color-warning: #FDCB6E;
  --color-error: #E17055;
}

/* Dark Mode */
[data-theme="dark"] {
  --color-text: #EAEAEA;
  --color-text-muted: #A0A0A0;
  --color-bg-primary: #1A1A2E;
  --color-bg-secondary: #16213E;
  --color-glass-bg: rgba(255, 255, 255, 0.1);
  --color-glass-border: rgba(255, 255, 255, 0.1);
}

/* Glassmorphism Utility Classes */
.glass {
  background: var(--color-glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid var(--color-glass-border);
  box-shadow: var(--shadow-glass);
}

.glass-light {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
}

.glass-heavy {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
}

/* Font */
body {
  font-family: 'Nunito', sans-serif;
  color: var(--color-text);
  background: var(--color-bg-primary);
}
```

**Verification:**
- [ ] Tailwind classes work (e.g., `bg-red-500`)
- [ ] CSS variables accessible
- [ ] Dark mode toggleable

---

### Task 5: Setup i18n

**Mô tả:** Cấu hình đa ngôn ngữ VI/EN

**File: `src/lib/i18n.ts`**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import vi from '../locales/vi.json';
import en from '../locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: 'vi', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

**File: `src/locales/vi.json`**
```json
{
  "common": {
    "appName": "Lumbar",
    "save": "Lưu",
    "cancel": "Hủy",
    "settings": "Cài đặt",
    "quit": "Thoát"
  },
  "timer": {
    "nextBreak": "Nghỉ sau",
    "minutes": "phút",
    "seconds": "giây"
  },
  "overlay": {
    "takeBreak": "Nghỉ ngơi đây!",
    "snooze": "Kệ tôi thêm {{minutes}} phút...",
    "skipBreak": "Tôi chọn đau lưng"
  },
  "mascot": {
    "happy": [
      "Tuyệt vời! Bạn làm tốt lắm!",
      "Mắt bạn cảm ơn bạn đấy!"
    ],
    "sad": [
      "Làm lâu quá rồi đó...",
      "Đứng dậy đi nào!"
    ],
    "angry": [
      "Lại hoãn à?",
      "Thôi kệ bạn vậy!"
    ]
  }
}
```

**File: `src/locales/en.json`**
```json
{
  "common": {
    "appName": "Lumbar",
    "save": "Save",
    "cancel": "Cancel",
    "settings": "Settings",
    "quit": "Quit"
  },
  "timer": {
    "nextBreak": "Next break in",
    "minutes": "min",
    "seconds": "sec"
  },
  "overlay": {
    "takeBreak": "Take a break!",
    "snooze": "Leave me alone for {{minutes}} min...",
    "skipBreak": "I choose back pain"
  },
  "mascot": {
    "happy": [
      "Great job!",
      "Your eyes thank you!"
    ],
    "sad": [
      "You've been working too long...",
      "Stand up and stretch!"
    ],
    "angry": [
      "Snoozing again?",
      "Fine, I give up!"
    ]
  }
}
```

**Verification:**
- [ ] i18n imports without error
- [ ] Language switch works

---

### Task 6: Setup Google Font

**Mô tả:** Import font Nunito

**File: `index.html`** (thêm vào `<head>`)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Verification:**
- [ ] Font Nunito hiển thị đúng

---

### Task 7: Tạo Base Components

**Mô tả:** Tạo các component cơ bản

**File: `src/components/ui/GlassCard.tsx`**
```typescript
import { FC, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'heavy';
}

export const GlassCard: FC<GlassCardProps> = ({ 
  children, 
  className = '',
  variant = 'light'
}) => {
  const variantClasses = {
    light: 'bg-white/25 backdrop-blur-md',
    medium: 'bg-white/40 backdrop-blur-lg',
    heavy: 'bg-white/60 backdrop-blur-xl',
  };

  return (
    <div className={`
      ${variantClasses[variant]}
      rounded-2xl
      border border-white/20
      shadow-lg
      ${className}
    `}>
      {children}
    </div>
  );
};
```

**File: `src/components/ui/Button.tsx`**
```typescript
import { FC, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-white',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white',
    ghost: 'bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white/90 border border-white/20',
  };

  return (
    <button
      className={`
        ${variants[variant]}
        font-semibold
        px-6 py-3
        rounded-xl
        shadow-lg hover:shadow-xl
        transition-all duration-200
        active:scale-95
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
```

**File: `src/components/ui/index.ts`**
```typescript
export * from './GlassCard';
export * from './Button';
```

**Verification:**
- [ ] Components render không lỗi
- [ ] Glassmorphism effect hiển thị đúng

---

### Task 8: Update App.tsx

**Mô tả:** Test setup bằng App.tsx đơn giản

**File: `src/App.tsx`**
```typescript
import { useTranslation } from 'react-i18next';
import { GlassCard, Button } from './components/ui';
import './lib/i18n';

function App() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-8">
      <GlassCard className="p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-4">
          🪵 {t('common.appName')}
        </h1>
        <p className="text-white/80 mb-6">
          {t('mascot.happy.0')}
        </p>
        <div className="flex gap-4">
          <Button variant="primary">
            {t('overlay.takeBreak')}
          </Button>
          <Button variant="ghost" onClick={toggleLanguage}>
            {i18n.language === 'vi' ? 'EN' : 'VI'}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

export default App;
```

**Verification:**
- [ ] App hiển thị GlassCard với blur effect
- [ ] Button có style đúng
- [ ] Language toggle hoạt động

---

### Task 9: Final Check

**Mô tả:** Kiểm tra tổng thể

**Commands:**
```bash
# Chạy dev server
npm run tauri dev

# Check bundle size (sau khi build)
npm run build
```

**Checklist cuối:**
- [ ] `npm run tauri dev` chạy không lỗi
- [ ] Glassmorphism hiển thị đúng
- [ ] i18n switch VI/EN hoạt động
- [ ] Folder structure đúng chuẩn
- [ ] Không có console errors

---

## 📊 DELIVERABLES

Sau khi hoàn thành M01, MISA phải có các files sau:

```
lumbar/
├── src/
│   ├── components/ui/
│   │   ├── GlassCard.tsx
│   │   ├── Button.tsx
│   │   └── index.ts
│   ├── locales/
│   │   ├── vi.json
│   │   └── en.json
│   ├── lib/
│   │   └── i18n.ts
│   ├── styles/
│   │   └── globals.css
│   └── App.tsx
├── src-tauri/
│   └── (default Tauri files)
├── package.json
├── vite.config.ts
└── index.html (with Nunito font)
```

---

## 📝 BÁO CÁO HOÀN THÀNH

Sau khi hoàn thành, MISA tạo file: `docs/modules/M01_COMPLETED.md`

**Template báo cáo:**
```markdown
# M01: PROJECT SETUP - BÁO CÁO HOÀN THÀNH

> **Completed by:** MISA
> **Date:** [YYYY-MM-DD]
> **Duration:** [X hours]

## ✅ TASKS COMPLETED

| # | Task | Status |
|---|------|--------|
| 1 | Khởi tạo Project Tauri | ✅ |
| 2 | Cài đặt Dependencies | ✅ |
| 3 | Tạo Folder Structure | ✅ |
| 4 | Setup Tailwind CSS | ✅ |
| 5 | Setup i18n | ✅ |
| 6 | Setup Google Font | ✅ |
| 7 | Tạo Base Components | ✅ |
| 8 | Update App.tsx | ✅ |
| 9 | Final Check | ✅ |

## 📁 FILES CREATED

- `src/components/ui/GlassCard.tsx`
- `src/components/ui/Button.tsx`
- [... list all files]

## 🔧 COMMANDS TO RUN

\`\`\`bash
npm install
npm run tauri dev
\`\`\`

## ⚠️ ISSUES ENCOUNTERED

[Mô tả các vấn đề gặp phải và cách giải quyết]

## 📌 NOTES FOR NEXT MODULE

[Ghi chú cho M02]

## 🖼️ SCREENSHOTS

[Đính kèm screenshots nếu có]
```

---

## 🔗 THAM KHẢO

| Tài liệu | Đường dẫn |
|----------|-----------|
| Architecture | `docs/ARCHITECTURE.md` |
| Design System | `docs/DESIGN_SYSTEM.md` |
| PRD | `docs/PRD.md` |
| Tauri Docs | https://v2.tauri.app |

---

> **Module này do LUMB soạn cho MISA thực hiện.**  
> Sau khi hoàn thành, báo cáo tại `docs/modules/M01_COMPLETED.md`
