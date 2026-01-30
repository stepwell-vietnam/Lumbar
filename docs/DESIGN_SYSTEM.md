# LUMBAR - DESIGN SYSTEM

> **Style:** Glassmorphism + Modern Minimalist  
> **Version:** 1.0  
> **Cập nhật:** 2026-01-29

---

## 1. TỔNG QUAN

### 1.1. Design Philosophy

| Nguyên tắc | Mô tả |
|------------|-------|
| **Glassmorphism** | Hiệu ứng kính mờ, transparent layers |
| **Soft & Friendly** | Rounded corners, pastel colors |
| **Non-intrusive** | Không gây phân tâm, nhẹ nhàng |
| **Personality** | Mascot có cảm xúc, copy hài hước |

### 1.2. Tech Stack UI

| Component | Technology |
|-----------|------------|
| CSS Framework | Tailwind CSS v4 |
| Component Library | shadcn/ui (headless) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Font | Nunito (Google Fonts) |

---

## 2. COLOR SYSTEM

### 2.1. Core Palette

```css
:root {
  /* Primary Colors */
  --color-primary: #FF6B35;        /* Orange - CTA */
  --color-secondary: #4ECDC4;      /* Teal - Secondary */
  
  /* Neutral Colors */
  --color-text: #2D3436;           /* Dark gray - Text */
  --color-text-muted: #636E72;     /* Gray - Muted text */
  --color-text-light: #A0A0A0;     /* Light gray */
  
  /* Background Colors - Light Mode */
  --color-bg-primary: #FFFFFF;     /* White */
  --color-bg-secondary: #F5F5F5;   /* Light gray */
  --color-bg-tertiary: #EAEAEA;    /* Lighter gray */
  
  /* Glass Effect */
  --color-glass-bg: rgba(255, 255, 255, 0.25);
  --color-glass-border: rgba(255, 255, 255, 0.18);
  
  /* Semantic Colors */
  --color-success: #00B894;        /* Green */
  --color-warning: #FDCB6E;        /* Yellow */
  --color-error: #E17055;          /* Red */
}

/* Dark Mode */
[data-theme="dark"] {
  --color-text: #EAEAEA;
  --color-text-muted: #A0A0A0;
  --color-bg-primary: #1A1A2E;
  --color-bg-secondary: #16213E;
  --color-bg-tertiary: #0F3460;
  
  --color-glass-bg: rgba(255, 255, 255, 0.1);
  --color-glass-border: rgba(255, 255, 255, 0.1);
}
```

### 2.2. Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#4ECDC4',
        glass: {
          bg: 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.18)',
        },
        dark: {
          100: '#EAEAEA',
          200: '#A0A0A0',
          300: '#636E72',
          400: '#2D3436',
          500: '#1A1A2E',
          600: '#16213E',
          700: '#0F3460',
        }
      }
    }
  }
}
```

---

## 3. GLASSMORPHISM COMPONENTS

### 3.1. Glass Card (Core Component)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

/* Tailwind version */
.glass-card-tw {
  @apply bg-white/25 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg;
}
```

### 3.2. Glass Variants

| Variant | Opacity | Blur | Use Case |
|---------|---------|------|----------|
| **glass-light** | 25% | 10px | Cards, panels |
| **glass-medium** | 40% | 15px | Modals, overlays |
| **glass-heavy** | 60% | 20px | Break overlay |

```css
/* Light */
.glass-light {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
}

/* Medium */
.glass-medium {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
}

/* Heavy - for Break Overlay */
.glass-heavy {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
}
```

### 3.3. Tailwind Utilities

```javascript
// Add to tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      }
    }
  },
  plugins: [],
}
```

**Usage:**
```html
<!-- Glass Card -->
<div class="bg-white/25 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
  Content here
</div>

<!-- Glass Button -->
<button class="bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 px-4 py-2 hover:bg-white/40 transition-all">
  Click me
</button>
```

---

## 4. TYPOGRAPHY

### 4.1. Font Family

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap');

:root {
  --font-primary: 'Nunito', sans-serif;
}

body {
  font-family: var(--font-primary);
}
```

### 4.2. Font Scale

| Token | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| `text-xs` | 12px | 400 | 1.5 | Caption, labels |
| `text-sm` | 14px | 400 | 1.5 | Body small |
| `text-base` | 16px | 400 | 1.5 | Body |
| `text-lg` | 18px | 500 | 1.4 | Subheading |
| `text-xl` | 20px | 600 | 1.3 | Heading small |
| `text-2xl` | 24px | 700 | 1.2 | Heading |
| `text-3xl` | 30px | 700 | 1.2 | Display |
| `text-4xl` | 36px | 700 | 1.1 | Timer display |

---

## 5. SPACING & SIZING

### 5.1. Spacing Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Small gaps |
| `space-3` | 12px | Default gap |
| `space-4` | 16px | Component padding |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large sections |

### 5.2. Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| `rounded-sm` | 8px | Buttons, inputs |
| `rounded-md` | 12px | Cards |
| `rounded-lg` | 16px | Panels |
| `rounded-xl` | 20px | Glass cards |
| `rounded-2xl` | 24px | Overlays |
| `rounded-full` | 9999px | Avatars, badges |

---

## 6. SHADOWS

### 6.1. Shadow Scale

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Glass shadow */
  --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}
```

---

## 7. ANIMATION

### 7.1. Timing Functions

| Token | Value | Use Case |
|-------|-------|----------|
| `ease-smooth` | cubic-bezier(0.4, 0, 0.2, 1) | General |
| `ease-bounce` | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Mascot |
| `ease-spring` | cubic-bezier(0.175, 0.885, 0.32, 1.275) | Buttons |

### 7.2. Framer Motion Variants

```typescript
// src/lib/animations.ts

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 }
};

export const bounceIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { 
    type: "spring",
    stiffness: 300,
    damping: 20
  }
};

export const mascotBounce = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 2
    }
  }
};
```

---

## 8. COMPONENT PATTERNS

### 8.1. Glass Button

```tsx
// Primary Button
<button className="
  bg-primary hover:bg-primary/90
  text-white font-semibold
  px-6 py-3 rounded-xl
  shadow-lg hover:shadow-xl
  transition-all duration-200
  active:scale-95
">
  Take a Break
</button>

// Ghost Button (Glassmorphism)
<button className="
  bg-white/20 hover:bg-white/30
  backdrop-blur-sm
  text-white/90 font-medium
  px-6 py-3 rounded-xl
  border border-white/20
  transition-all duration-200
">
  Snooze 5 min
</button>
```

### 8.2. Glass Card

```tsx
<div className="
  bg-white/25 dark:bg-white/10
  backdrop-blur-md
  rounded-2xl
  border border-white/20
  shadow-glass
  p-6
">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-muted">Card content</p>
</div>
```

### 8.3. Overlay Background

```tsx
// Break Overlay Background
<div className="
  fixed inset-0
  bg-black/30
  backdrop-blur-lg
  flex items-center justify-center
">
  {/* Overlay content */}
</div>
```

---

## 9. MASCOT STATES

### 9.1. Visual States

| State | Expression | Color Tint | Animation |
|-------|------------|------------|-----------|
| 😊 Happy | Smiling | Normal | Gentle bounce |
| 😢 Sad | Droopy eyes | Slightly gray | Slow sway |
| 😤 Angry | Furrowed brow | Red tint | Shake |
| 😴 Sleeping | Closed eyes | Blue tint | Z-z-z float |

### 9.2. Animation Specs

```typescript
export const mascotStates = {
  happy: {
    scale: 1,
    rotate: 0,
    filter: 'none',
  },
  sad: {
    scale: 0.95,
    rotate: -5,
    filter: 'grayscale(30%)',
  },
  angry: {
    scale: 1.05,
    rotate: [0, -3, 3, -3, 0],
    filter: 'hue-rotate(340deg)',
  },
  sleeping: {
    scale: 0.9,
    rotate: 10,
    filter: 'brightness(0.8)',
  }
};
```

---

## 10. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Use Case |
|------------|-------|----------|
| `sm` | 640px | - |
| `md` | 768px | - |
| `lg` | 1024px | - |

> **Note:** Lumbar là desktop app, không cần responsive mobile. Chỉ cần đảm bảo UI đẹp ở các kích thước window khác nhau.

---

## 11. ACCESSIBILITY

### 11.1. Focus States

```css
/* Focus visible for keyboard navigation */
.focus-ring {
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}
```

### 11.2. Contrast Requirements

| Element | Min Contrast | Actual |
|---------|--------------|--------|
| Text on glass | 4.5:1 | ✅ |
| Button text | 4.5:1 | ✅ |
| Icons | 3:1 | ✅ |

---

## 12. FILE STRUCTURE

```
src/
├── styles/
│   ├── globals.css          # Base styles, CSS variables
│   └── animations.css       # Keyframe animations
├── lib/
│   └── animations.ts        # Framer Motion variants
└── components/
    └── ui/
        ├── Button.tsx
        ├── Card.tsx
        ├── GlassCard.tsx
        └── index.ts
```

---

> 📝 **Document maintained by:** LUMB (Lumbar Advisor)  
> 📅 **Last updated:** 2026-01-29
