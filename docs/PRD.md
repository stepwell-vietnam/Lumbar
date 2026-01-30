# PRODUCT REQUIREMENTS DOCUMENT (PRD)

![Lumbar Logo](../assets/logo-placeholder.png)

> **Dự án:** Lumbar - Người bạn đồng hành nhắc nghỉ ngơi  
> **Phiên bản:** 2.0  
> **Nền tảng:** Windows, macOS  
> **Ngôn ngữ:** Tiếng Việt, English  
> **Công nghệ:** Tauri 2.0 (Rust), React, TailwindCSS  
> **Cập nhật:** 2026-01-29

---

## Mục Lục

1. [Tổng Quan Sản Phẩm](#1-tổng-quan-sản-phẩm)
2. [Tính Năng Chức Năng](#2-tính-năng-chức-năng)
3. [Thiết Kế UX/UI](#3-thiết-kế-uxui)
4. [Màn Hình UI](#4-màn-hình-ui)
5. [Yêu Cầu Kỹ Thuật](#5-yêu-cầu-kỹ-thuật)
6. [Đa Ngôn Ngữ (i18n)](#6-đa-ngôn-ngữ-i18n)
7. [Lộ Trình Phát Triển](#7-lộ-trình-phát-triển)
8. [Phụ Lục](#8-phụ-lục)

---

## 1. TỔNG QUAN SẢN PHẨM

### 1.1. Tầm Nhìn (Vision)

Xây dựng một **"người bạn đồng hành"** trên máy tính giúp người dùng duy trì sức khỏe mà không gây ức chế. Thay vì ra lệnh như một cỗ máy, ứng dụng sử dụng:
- 😄 **Sự hài hước** - Châm biếm nhẹ nhàng (phong cách Duolingo)
- 🎨 **Giao diện tinh tế** - Modern, Glassmorphism
- 🤝 **Tôn trọng người dùng** - Thuyết phục tự nguyện, không ép buộc

### 1.2. Giá Trị Cốt Lõi (Key Value Propositions)

| Giá trị | Mô tả | Metric |
|---------|-------|--------|
| 🪶 **Siêu nhẹ** | Không "nặng" máy như các app Electron | < 10MB, < 50MB RAM |
| 💕 **Có cảm xúc** | Mascot và Micro-copy thú vị | 3+ trạng thái cảm xúc |
| 🔇 **Không xâm lấn** | Tôn trọng Flow state | Auto DND khi fullscreen |
| 🔒 **Privacy-first** | Không gửi dữ liệu về server | 100% offline |

### 1.3. Đối Tượng Mục Tiêu

| Nhóm | Đặc điểm | Nhu cầu |
|------|----------|---------|
| **Dân văn phòng** | Ngồi máy tính 8+ giờ/ngày | Nhắc nghỉ mắt, đứng dậy |
| **Lập trình viên** | Flow state cao, quên thời gian | Nhắc nhẹ nhàng, không làm phiền |
| **Designer/Creator** | Làm việc sáng tạo | UX đẹp, không khô cứng |
| **Gamer** | Session dài | DND khi chơi game |

---

## 2. TÍNH NĂNG CHỨC NĂNG

### 2.1. Phân Loại Độ Ưu Tiên

| Ký hiệu | Mức độ | Mô tả |
|---------|--------|-------|
| **P0** | Critical | Không có = không ra mắt được |
| **P1** | High | Cần có trong MVP |
| **P2** | Medium | Có thể triển khai sau |
| **P3** | Low | Gamification, mở rộng |

---

### 2.2. Module 1: Core Engine (Rust Backend)

#### F01: Smart Timer [P0]

**Mô tả:** Hỗ trợ 2 chế độ đếm thời gian

| Chế độ | Interval | Duration | Áp dụng |
|--------|----------|----------|---------|
| **Micro-break** | 20 phút | 20 giây | Quy tắc 20-20-20 cho mắt |
| **Rest-break** | 60 phút | 5-10 phút | Đứng dậy vận động |

**Chi tiết:**
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F01.1 | Micro-break timer | Đếm ngược 20 phút → nhắc nghỉ 20 giây |
| F01.2 | Rest-break timer | Đếm ngược 60 phút → nhắc nghỉ 5-10 phút |
| F01.3 | Timer persistence | Lưu trạng thái timer khi restart app |
| F01.4 | Background operation | Timer chạy chính xác khi app minimize |

---

#### F02: Idle Detection [P0]

**Mô tả:** Tự động tạm dừng timer khi không có thao tác

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F02.1 | Mouse/Keyboard tracking | Phát hiện thao tác chuột/phím |
| F02.2 | Auto-pause | Tạm dừng timer nếu idle > 2 phút |
| F02.3 | Auto-resume | Tiếp tục timer khi user quay lại |
| F02.4 | Idle threshold config | Cho phép điều chỉnh ngưỡng idle |

**Logic:**
```
IF no_input > 2 minutes THEN
    pause_timer()
    mascot.setState("sleeping")
ENDIF

ON input_detected THEN
    IF was_paused THEN
        resume_timer()
        mascot.setState("happy")
    ENDIF
ENDON
```

---

#### F03: System Integration [P0]

| ID | Chức năng | Mô tả | macOS | Windows |
|----|-----------|-------|-------|---------|
| F03.1 | System tray icon | Icon trong khay hệ thống | ✅ Menu Bar | ✅ System Tray |
| F03.2 | Startup with OS | Tự khởi động cùng OS | ✅ Login Items | ✅ Startup |
| F03.3 | Native notifications | Toast notification | ✅ | ✅ |
| F03.4 | Fullscreen detection | Phát hiện fullscreen (DND) | ✅ | ✅ |

---

### 2.3. Module 2: Notification System

#### F04: Notification Escalation [P1]

**Mô tả:** Hệ thống nhắc nhở leo thang 3 cấp

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Level 1   │ ──► │   Level 2   │ ──► │   Level 3   │
│    Hint     │     │    Toast    │     │   Overlay   │
│   (Subtle)  │     │ (Moderate)  │     │   (Strong)  │
└─────────────┘     └─────────────┘     └─────────────┘
     🟡                  🟠                  🔴
```

| Level | Trigger | Hình thức | Mô tả |
|-------|---------|-----------|-------|
| 1 | Timer hết | Icon tray đổi màu | Nhấp nháy nhẹ |
| 2 | +30 giây không phản hồi | Toast notification | Góc màn hình, có mascot |
| 3 | +1 phút không phản hồi | Full-screen Overlay | Backdrop blur |

---

#### F05: Snooze Logic [P1]

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F05.1 | Snooze 5 min | Hoãn 5 phút |
| F05.2 | Snooze 10 min | Hoãn 10 phút |
| F05.3 | Snooze limit | Giới hạn 3 lần liên tiếp |
| F05.4 | Snooze counter | Hiển thị số lần đã snooze |

**Mascot Reaction:**
| Snooze Count | Mascot State | Copy Example |
|--------------|--------------|--------------|
| 0 | 😊 Happy | "Nghỉ chút nhé!" |
| 1-2 | 😐 Neutral | "Lại hoãn nữa à?" |
| 3+ | 😤 Angry | "Thôi kệ bạn!" |

---

#### F06: Do Not Disturb (DND) [P2]

**Mô tả:** Tự động tắt thông báo khi cần

| Trigger | Action |
|---------|--------|
| Fullscreen app detected | Chỉ Level 1 (icon) |
| Presentation mode | Tắt hoàn toàn |
| Manual DND toggle | Theo cài đặt user |

---

### 2.4. Module 3: Mascot & Personality

#### F07: Dynamic Mascot [P1]

**Nhân vật:** Lumbar - Khúc gỗ dễ thương 🪵

| State | Trigger | Biểu cảm | Animation |
|-------|---------|----------|-----------|
| 😊 **Happy** | User nghỉ đúng giờ | Vui vẻ, nhảy múa | Bounce, celebrate |
| 😢 **Sad** | User làm quá lâu | Mặt ỉu, vai rũ | Droop, sigh |
| 😤 **Angry** | User spam snooze | Đỏ mặt, quay lưng | Shake, huff |
| 😴 **Sleeping** | User idle | Ngủ gật | Z-z-z effect |

---

#### F08: Dynamic Content [P1]

**Passive-Aggressive Copy:**

| Context | Thông thường | Lumbar Style |
|---------|--------------|--------------|
| Skip button | "Skip" | "Tôi chọn đau lưng" 💀 |
| Take break | "Take a break" | "Cứu lấy đôi mắt này" 👀 |
| Snooze | "Snooze 5 min" | "Kệ tôi thêm 5 phút..." |
| Continue | "Continue" | "Mắt tôi không quan trọng" |

**Tone of Voice Levels:**

| Level | Ví dụ VI | Ví dụ EN |
|-------|----------|----------|
| 😊 Friendly | "Hey, 20 phút rồi!" | "Hey, it's been 20 mins!" |
| 😏 Teasing | "Định dính ghế luôn à?" | "Glued to your chair?" |
| 😈 Guilt-trip | "Mắt bạn đang khóc đấy" | "Your eyes are crying" |

---

#### F09: Health Tips [P2]

**Danh sách bài tập:**

| # | Tên | Mô tả | Thời gian |
|---|-----|-------|-----------|
| 1 | 👀 Nhìn xa | Nhìn điểm xa 6m trong 20s | 20s |
| 2 | 🔄 Xoay cổ | Xoay cổ 360° chậm rãi | 30s |
| 3 | 💪 Vươn vai | Đứng dậy, vươn vai | 30s |
| 4 | 👁️ Nháy mắt | Nháy mắt 20 lần | 10s |
| 5 | 🧘 Hít thở | Hít sâu, thở chậm | 30s |

---

### 2.5. Module 4: Settings & Storage

#### F10: User Settings [P1]

| Category | Setting | Default | Range |
|----------|---------|---------|-------|
| **Timer** | Micro-break interval | 20 min | 10-60 min |
| | Micro-break duration | 20 sec | 10-60 sec |
| | Rest-break interval | 60 min | 30-120 min |
| | Rest-break duration | 5 min | 3-15 min |
| **Notification** | Sound | On | On/Off |
| | Notification level | Level 3 | 1/2/3 |
| | Snooze limit | 3 | 1-5 |
| **General** | Language | System | VI/EN |
| | Theme | System | Light/Dark/System |
| | Start with OS | On | On/Off |
| | Idle threshold | 2 min | 1-10 min |

---

#### F11: Data Persistence [P1]

**Storage format:** JSON (via `tauri-plugin-store`)

```json
{
  "settings": { ... },
  "stats": {
    "today": { "breaks": 5, "snoozes": 2 },
    "streak": 7,
    "totalBreaks": 126
  }
}
```

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F11.1 | Settings storage | Lưu cài đặt vào `settings.json` |
| F11.2 | Stats storage | Lưu thống kê vào `stats.json` |
| F11.3 | Auto-save | Tự động lưu khi thay đổi |

---

### 2.6. Module 5: Gamification [P3 - Tương lai]

#### F12: Streak & Stats

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F12.1 | Daily streak | Chuỗi ngày tuân thủ liên tiếp |
| F12.2 | Weekly report | Biểu đồ tuần làm việc/nghỉ |
| F12.3 | Break counter | Tổng số lần nghỉ |
| F12.4 | Achievements | Huy hiệu thành tựu |

---

## 3. THIẾT KẾ UX/UI

### 3.1. Design System

#### Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--bg-primary` | #FFFFFF | #1A1A2E | Background chính |
| `--bg-secondary` | #F5F5F5 | #16213E | Card background |
| `--accent` | #FF6B35 | #FF6B35 | CTA buttons |
| `--accent-secondary` | #4ECDC4 | #4ECDC4 | Secondary actions |
| `--text-primary` | #2D3436 | #EAEAEA | Text chính |
| `--text-muted` | #636E72 | #A0A0A0 | Text phụ |

#### Typography

| Token | Font | Weight | Size |
|-------|------|--------|------|
| `--font-primary` | Nunito | - | - |
| `--heading-lg` | Nunito | 700 | 24px |
| `--heading-md` | Nunito | 600 | 18px |
| `--body` | Nunito | 400 | 14px |
| `--caption` | Nunito | 400 | 12px |

#### Spacing & Radius

| Token | Value |
|-------|-------|
| `--spacing-xs` | 4px |
| `--spacing-sm` | 8px |
| `--spacing-md` | 16px |
| `--spacing-lg` | 24px |
| `--radius-sm` | 8px |
| `--radius-md` | 12px |
| `--radius-lg` | 20px |

---

### 3.2. Visual Style

**Theme:** Modern Minimalist + Glassmorphism

| Yếu tố | Mô tả |
|--------|-------|
| **Glassmorphism** | Backdrop blur, semi-transparent cards |
| **Pastel colors** | Nhẹ nhàng, không chói mắt |
| **Accent colors** | Cam/Xanh lá cho CTA |
| **Rounded corners** | Thân thiện, mềm mại |
| **Micro-animations** | Bounce, fade, slide |

---

### 3.3. Animation Guidelines

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Mascot appear | Bounce in | 500ms | spring |
| Overlay fade | Fade + blur | 300ms | ease-out |
| Button hover | Scale up | 150ms | ease |
| Toast slide | Slide from right | 250ms | ease-out |
| State change | Morph | 400ms | ease-in-out |

---

## 4. MÀN HÌNH UI

### 4.1. Tổng Quan

| # | Screen | Type | Priority | Mô tả |
|---|--------|------|----------|-------|
| S01 | System Tray Menu | Popup | P0 | Menu khi click icon tray |
| S02 | Mini Dashboard | Window | P1 | Cửa sổ nhỏ hiển thị timer |
| S03 | Break Overlay | Fullscreen | P0 | Lớp phủ nhắc nghỉ |
| S04 | Settings | Window | P1 | Cửa sổ cài đặt |
| S05 | Health Tips | Component | P2 | Card bài tập trong overlay |
| S06 | Stats Dashboard | Window | P3 | Thống kê (Phase 3) |

---

### 4.2. S01: System Tray Menu [P0]

**Wireframe:**
```
┌─────────────────────────┐
│ 🪵 Lumbar         v1.0  │
├─────────────────────────┤
│ ⏱️ Next break: 12:34    │
│ 📊 Today: 5 breaks      │
├─────────────────────────┤
│ ▶️ Resume / ⏸️ Pause    │
│ ⏭️ Skip to break        │
├─────────────────────────┤
│ ⚙️ Settings             │
│ ℹ️ About                │
│ 🚪 Quit                 │
└─────────────────────────┘
```

**Components:**
| ID | Component | Behavior |
|----|-----------|----------|
| S01.1 | Timer display | Realtime countdown |
| S01.2 | Quick stats | Today's break count |
| S01.3 | Pause/Resume | Toggle timer state |
| S01.4 | Skip to break | Force trigger break now |
| S01.5 | Settings link | Open Settings window |
| S01.6 | Quit | Exit application |

---

### 4.3. S02: Mini Dashboard [P1]

**Wireframe:**
```
┌─────────────────────────────────┐
│         LUMBAR              ─ □ ×│
├─────────────────────────────────┤
│                                 │
│      ┌─────────────────┐        │
│      │                 │        │
│      │   🪵 Mascot     │        │
│      │  (Animated)     │        │
│      │                 │        │
│      └─────────────────┘        │
│                                 │
│           ⏱️ 15:42              │
│      "Còn 15 phút nữa thôi!"   │
│                                 │
│    [⏸️ Pause]  [⚙️ Settings]   │
│                                 │
└─────────────────────────────────┘
```

**Size:** 300 x 400 px (resizable)

---

### 4.4. S03: Break Overlay [P0]

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                  ░░░░ BACKDROP BLUR ░░░░                    │
│                                                             │
│              ┌───────────────────────────┐                  │
│              │                           │                  │
│              │        🪵 Mascot          │                  │
│              │     (Large, Animated)     │                  │
│              │                           │                  │
│              └───────────────────────────┘                  │
│                                                             │
│                  "Đứng dậy đi nào!"                        │
│                                                             │
│             ┌───────────────────────────┐                   │
│             │    💪 BÀI TẬP NGẮN        │                   │
│             │    Xoay cổ 360°...        │                   │
│             └───────────────────────────┘                   │
│                                                             │
│      [🟢 Nghỉ ngơi đây!]    [⏸️ Kệ tôi thêm 5 phút...]    │
│                                                             │
│                  ⏱️ Break ends in: 00:20                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Backdrop blur (không blackout)
- Mascot lớn ở trung tâm
- Health tip card
- 2 buttons: Take break (primary) + Snooze (secondary/passive-aggressive)

---

### 4.5. S04: Settings Window [P1]

**Wireframe:**
```
┌─────────────────────────────────────────────┐
│         ⚙️ SETTINGS                     ─ □ ×│
├─────────────────────────────────────────────┤
│                                             │
│  ⏱️ TIMER                                   │
│  ┌─────────────────────────────────────┐    │
│  │ Micro-break interval   [▼ 20] min  │    │
│  │ Micro-break duration   [▼ 20] sec  │    │
│  │ Rest-break interval    [▼ 60] min  │    │
│  │ Rest-break duration    [▼ 5 ] min  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  🔔 NOTIFICATIONS                           │
│  ┌─────────────────────────────────────┐    │
│  │ Sound                  [✓] On      │    │
│  │ Notification level     [▼ Overlay] │    │
│  │ Snooze limit           [▼ 3] times │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  🌐 GENERAL                                 │
│  ┌─────────────────────────────────────┐    │
│  │ Language       [▼ Tiếng Việt     ] │    │
│  │ Theme          [▼ System         ] │    │
│  │ Start with OS  [✓]                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
│     [Reset to Defaults]       [💾 Save]     │
│                                             │
└─────────────────────────────────────────────┘
```

**Size:** 400 x 550 px

---

### 4.6. S05: Health Tips Component [P2]

**Wireframe (inside Overlay):**
```
┌─────────────────────────────────┐
│  💪 BÀI TẬP NGẮN               │
├─────────────────────────────────┤
│                                 │
│  👀 Nhìn xa 20 feet             │
│                                 │
│  Nhìn ra cửa sổ hoặc nhìn vào  │
│  một điểm xa khoảng 6 mét      │
│  trong 20 giây.                 │
│                                 │
│  [◀️ Prev]    1/5    [Next ▶️]  │
│                                 │
└─────────────────────────────────┘
```

---

### 4.7. S06: Stats Dashboard [P3]

**Wireframe:**
```
┌─────────────────────────────────────────────┐
│         📊 STATISTICS                   ─ □ ×│
├─────────────────────────────────────────────┤
│                                             │
│  🔥 STREAK                                  │
│  ┌─────────────────────────────────────┐    │
│  │           7 ngày liên tiếp          │    │
│  │    🔥🔥🔥🔥🔥🔥🔥                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📈 TUẦN NÀY                                │
│  ┌─────────────────────────────────────┐    │
│  │  █ █ █ █ █ █ _                      │    │
│  │  M T W T F S S                      │    │
│  │  ✓ ✓ ✓ ✓ ✓ ✓ -                      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📋 SUMMARY                                 │
│  ┌─────────────────────────────────────┐    │
│  │ ⏱️ Total work hours    42h          │    │
│  │ ☕ Total breaks         126         │    │
│  │ ⏸️ Total snoozes        12         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  🏆 ACHIEVEMENTS                            │
│  ┌─────────────────────────────────────┐    │
│  │ [🏅 7 ngày] [🏅 100 breaks] [🔒]   │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 5. YÊU CẦU KỸ THUẬT

### 5.1. Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                   LUMBAR STACK                      │
├─────────────────────────────────────────────────────┤
│  Layer        │ Technology                          │
├───────────────┼─────────────────────────────────────┤
│  Core         │ Tauri 2.0 (Rust)                   │
│  Frontend     │ React 18 + TypeScript              │
│  Styling      │ Tailwind CSS v4 + Framer Motion    │
│  State        │ Zustand                            │
│  Storage      │ tauri-plugin-store (JSON)          │
│  Build        │ Vite                               │
│  i18n         │ i18next                            │
└─────────────────────────────────────────────────────┘
```

### 5.2. Performance Requirements

| Metric | Target | Priority |
|--------|--------|----------|
| Bundle size | < 10 MB | P0 |
| RAM (idle) | < 50 MB | P0 |
| Startup time | < 2 seconds | P1 |
| CPU (background) | < 1% | P1 |

### 5.3. Cross-Platform

| Platform | Package Format | Notes |
|----------|----------------|-------|
| **Windows** | `.msi`, `.exe` | Windows 10+ |
| **macOS** | `.dmg` | Intel + Apple Silicon |

### 5.4. Security & Privacy

> [!IMPORTANT]  
> **Privacy-first approach:**
> - ❌ Không thu thập dữ liệu người dùng
> - ❌ Không gửi analytics về server
> - ✅ Mọi dữ liệu xử lý cục bộ (offline)
> - ✅ Mã nguồn mở (tương lai)

---

## 6. ĐA NGÔN NGỮ (i18n)

### 6.1. Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `vi` | Tiếng Việt | Primary |
| `en` | English | Secondary |

### 6.2. String Categories

| Category | Est. Count | Example |
|----------|------------|---------|
| UI Labels | ~30 | "Settings", "Cài đặt" |
| Buttons | ~15 | "Save", "Lưu" |
| Mascot Messages | ~20 | Random quotes |
| Health Tips | ~10 | Exercise descriptions |
| Notifications | ~10 | Toast messages |
| Settings | ~20 | Section titles |
| **Total** | **~105** | |

### 6.3. Translation Format

**File structure:**
```
src/
└── locales/
    ├── vi.json
    └── en.json
```

**Example:**
```json
{
  "common": {
    "save": "Lưu",
    "cancel": "Hủy"
  },
  "mascot": {
    "happy": ["Tuyệt vời!", "Giỏi lắm!"],
    "angry": ["Lại hoãn à?", "Thôi kệ bạn!"]
  }
}
```

---

## 7. LỘ TRÌNH PHÁT TRIỂN

### 7.1. Tổng Quan Timeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LUMBAR DEVELOPMENT ROADMAP                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PHASE 1: MVP                    PHASE 2: PERSONALITY    PHASE 3       │
│  ┌─────────────────────────┐     ┌─────────────────┐     ┌─────────┐   │
│  │  M01 → M02 → M03 → M04  │     │  M07 → M08 → M09│     │   M10   │   │
│  │  └──────► M05 → M06     │     │                 │     │         │   │
│  └─────────────────────────┘     └─────────────────┘     └─────────┘   │
│  Week 1    Week 2    Week 3       Week 4-6                Week 7+      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

| Phase | Thời gian | Modules | Mục tiêu |
|-------|-----------|---------|----------|
| **Phase 1: MVP** | Tuần 1-3 | M01-M06 | App hoạt động cơ bản |
| **Phase 2: Personality** | Tuần 4-6 | M07-M09 | Thêm "linh hồn" cho app |
| **Phase 3: Gamification** | Tuần 7+ | M10 | Thống kê & thành tựu |

---

### 7.2. Phase 1: MVP (Tuần 1-3)

#### 📅 Tuần 1: Foundation

| Ngày | Module | Task | Deliverable |
|------|--------|------|-------------|
| **D1** | M01 | Project Setup | Tauri + React + Tailwind scaffold |
| **D1** | M01 | Dependencies | i18next, Zustand, Framer Motion |
| **D2** | M01 | Folder Structure | Theo ARCHITECTURE.md |
| **D2** | M01 | i18n Setup | VI/EN base files |
| **D3-4** | M02 | Timer Engine (Rust) | `timer.rs` - core logic |
| **D5** | M02 | Timer UI | S02: Mini Dashboard (basic) |
| **D5** | M02 | IPC Commands | start, pause, resume, get_state |

**Week 1 Deliverables:**
- [ ] Tauri + React project chạy được
- [ ] Timer đếm ngược chính xác
- [ ] Mini Dashboard hiển thị timer

---

#### 📅 Tuần 2: Core Features

| Ngày | Module | Task | Deliverable |
|------|--------|------|-------------|
| **D1-2** | M03 | Idle Detection (Rust) | `idle.rs` - mouse/keyboard tracking |
| **D2** | M03 | Idle UI | Status indicator |
| **D3** | M04 | System Tray (Rust) | `tray.rs` - icon, menu |
| **D3** | M04 | Tray Menu | S01: System Tray Menu |
| **D4-5** | M05 | Break Overlay | S03: Fullscreen overlay |
| **D5** | M05 | Backdrop Blur | CSS blur effect |

**Week 2 Deliverables:**
- [ ] Timer tạm dừng khi idle
- [ ] System tray icon hoạt động
- [ ] Tray menu với quick actions
- [ ] Break overlay hiển thị khi timer hết

---

#### 📅 Tuần 3: Settings & Polish

| Ngày | Module | Task | Deliverable |
|------|--------|------|-------------|
| **D1-2** | M06 | Settings UI | S04: Settings window |
| **D2** | M06 | Storage (Rust) | `store.rs` - JSON persistence |
| **D3** | M06 | Settings Logic | Load/Save settings |
| **D4** | ALL | Integration | Kết nối tất cả modules |
| **D4** | ALL | Testing | Manual testing |
| **D5** | ALL | Build | macOS + Windows packages |

**Week 3 Deliverables:**
- [ ] Settings lưu và load thành công
- [ ] Tất cả modules kết nối hoàn chỉnh
- [ ] Build file .dmg (macOS) và .msi (Windows)

---

#### ✅ Phase 1 MVP Checklist

| # | Feature | Module | Status |
|---|---------|--------|--------|
| 1 | Project scaffold | M01 | ⬜ |
| 2 | Smart Timer | M02 | ⬜ |
| 3 | Idle Detection | M03 | ⬜ |
| 4 | System Tray | M04 | ⬜ |
| 5 | Break Overlay | M05 | ⬜ |
| 6 | Settings | M06 | ⬜ |
| 7 | i18n (VI/EN) | M01 | ⬜ |
| 8 | Cross-platform build | ALL | ⬜ |

---

### 7.3. Phase 2: Personality & Polish (Tuần 4-6)

#### 📅 Tuần 4: Mascot System

| Ngày | Module | Task | Deliverable |
|------|--------|------|-------------|
| **D1** | M07 | Mascot Assets | SVG/PNG cho 4 states |
| **D2** | M07 | State Machine | mascotStore.ts |
| **D3** | M07 | Mascot Component | Animated mascot |
| **D4** | M07 | Integration | Mascot trong S02, S03 |
| **D5** | M07 | Testing | State transitions |

---

#### 📅 Tuần 5: Dynamic Content

| Ngày | Module | Task | Deliverable |
|------|--------|------|-------------|
| **D1-2** | M08 | Notification Levels | Level 1-3 logic |
| **D2** | M08 | Toast Notifications | OS native toasts |
| **D3** | M08 | Snooze Logic | Limit + counter |
| **D4** | M09 | Health Tips | 5+ exercises |
| **D5** | M09 | Health Tips UI | S05 component |

---

#### 📅 Tuần 6: Polish

| Ngày | Module | Task | Deliverable |
|------|--------|------|-------------|
| **D1** | ALL | Dynamic Messages | Random mascot quotes |
| **D2** | ALL | Sound Effects | Notification sounds |
| **D3** | ALL | Animations | Smooth transitions |
| **D4** | ALL | Bug Fixes | Testing & fixing |
| **D5** | ALL | Release | v1.0 release |

---

#### ✅ Phase 2 Checklist

| # | Feature | Module | Status |
|---|---------|--------|--------|
| 1 | Dynamic Mascot | M07 | ⬜ |
| 2 | Animation System | M07 | ⬜ |
| 3 | Notification Escalation | M08 | ⬜ |
| 4 | Snooze Logic | M08 | ⬜ |
| 5 | Health Tips | M09 | ⬜ |
| 6 | Dynamic Messages | ALL | ⬜ |
| 7 | Sound Effects | ALL | ⬜ |
| 8 | v1.0 Release | ALL | ⬜ |

---

### 7.4. Phase 3: Gamification (Tuần 7+)

| Week | Feature | Module | Deliverable |
|------|---------|--------|-------------|
| **7** | Streak Tracking | M10 | Daily streak logic |
| **7** | Stats Storage | M10 | stats.json schema |
| **8** | Stats Dashboard | M10 | S06: Stats UI |
| **8** | Weekly Chart | M10 | Weekly visualization |
| **9** | Achievements | M10 | Badge system |
| **9** | DND Mode | M10 | Fullscreen detection |

---

### 7.5. Module Dependencies

```
M01 (Setup)
  │
  ├──► M02 (Timer)
  │      │
  │      ├──► M03 (Idle) ──► M05 (Overlay)
  │      │                        │
  │      └──► M04 (Tray) ─────────┘
  │                               │
  └──► M06 (Settings) ◄───────────┘
         │
         └──► M07 (Mascot) ──► M08 (Notifications)
                                    │
                                    └──► M09 (Health Tips)
                                            │
                                            └──► M10 (Stats)
```

---

### 7.6. Release Schedule

| Version | Phase | Features | ETA |
|---------|-------|----------|-----|
| **v0.1.0** | MVP Alpha | Timer, Tray, Overlay | Week 2 |
| **v0.5.0** | MVP Beta | + Settings, i18n | Week 3 |
| **v1.0.0** | Production | + Mascot, Notifications | Week 6 |
| **v1.5.0** | Enhanced | + Gamification | Week 9 |

---

### 7.7. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tauri v2 breaking changes | High | Pin versions, follow changelog |
| Cross-platform inconsistencies | Medium | Test on both OS early |
| Performance issues | Medium | Profile regularly |
| Scope creep | Low | Stick to PRD priorities |

---

## 8. PHỤ LỤC

### 8.1. Cấu Trúc Thư Mục Đề Xuất

```
lumbar/
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── timer.rs          # Timer logic
│   │   ├── idle.rs           # Idle detection
│   │   └── commands.rs       # Tauri commands
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                       # React frontend
│   ├── components/
│   │   ├── Overlay/
│   │   ├── Mascot/
│   │   ├── Settings/
│   │   └── TrayMenu/
│   ├── hooks/
│   ├── stores/               # Zustand stores
│   ├── locales/              # i18n files
│   │   ├── vi.json
│   │   └── en.json
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│   └── assets/
│       ├── mascot/           # Mascot images
│       └── sounds/           # Sound effects
│
├── docs/
│   ├── PRD.md               # This file
│   ├── FEATURES_AND_UI.md
│   └── agent/
│
└── package.json
```

### 8.2. Tài Liệu Tham Khảo

| Resource | URL |
|----------|-----|
| Tauri v2 Docs | https://v2.tauri.app |
| Framer Motion | https://www.framer.com/motion |
| Zustand | https://zustand-demo.pmnd.rs |
| i18next | https://www.i18next.com |
| 20-20-20 Rule | https://www.aao.org/eye-health/tips-prevention/computer-usage |

### 8.3. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Draft PRD |
| 2.0 | 2026-01-29 | Complete rewrite with detailed specs |

---

> 📝 **Document maintained by:** LUMB (Lumbar Advisor)  
> 📅 **Last updated:** 2026-01-29
