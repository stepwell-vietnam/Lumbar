# LUMBAR - HƯỚNG DẪN UI

> **Tài liệu:** Hướng dẫn giao diện người dùng  
> **Cập nhật:** 2026-01-29

---

## 📋 TỔNG QUAN

| # | Screen | Loại | Priority | Mô tả |
|---|--------|------|----------|-------|
| 1 | System Tray Icon | Icon | P0 | Indicator trạng thái |
| 2 | S01: Tray Menu | Popup | P0 | Menu thao tác nhanh |
| 3 | S02: Mini Dashboard | Window | P1 | Xem timer & mascot |
| 4 | S03: Break Overlay | Fullscreen | P0 | Nhắc nghỉ ngơi |
| 5 | S04: Settings | Window | P1 | Cài đặt |
| 6 | S05: Health Tips | Component | P2 | Bài tập trong overlay |
| 7 | S06: Stats Dashboard | Window | P3 | Thống kê (Phase 3) |

---

## 🎯 HÀNH TRÌNH NGƯỜI DÙNG

```
Bật máy → Icon Tray xuất hiện
    │
    ├─ Click 1 lần → S01: Tray Menu
    │                    ├─ Xem timer
    │                    ├─ Pause/Resume
    │                    └─ Mở Settings
    │
    ├─ Double-click → S02: Mini Dashboard
    │
    └─ Timer hết → Notification Escalation
                    ├─ Level 1: Icon đổi màu
                    ├─ Level 2: Toast notification
                    └─ Level 3: S03: Break Overlay
                                    ├─ Take break → Reset timer
                                    └─ Snooze → Hoãn 5-10 phút
```

---

## 1️⃣ SYSTEM TRAY ICON

**Vị trí:** Menu bar (macOS) / System tray (Windows)

### Trạng thái Icon

| State | Icon | Mô tả |
|-------|------|-------|
| Normal | 🪵 | Timer đang chạy |
| Alert | 🟠 | Đến giờ nghỉ (nhấp nháy) |
| Paused | ⏸️ | Timer tạm dừng |
| Idle | 😴 | User không thao tác |

### Tương tác

| Action | Kết quả |
|--------|---------|
| Click | Mở S01: Tray Menu |
| Double-click | Mở S02: Mini Dashboard |

---

## 2️⃣ S01: TRAY MENU

**Kích hoạt:** Click vào System Tray Icon

### Wireframe

```
┌─────────────────────────┐
│ 🪵 Lumbar         v1.0  │
├─────────────────────────┤
│ ⏱️ Next break: 12:34    │
│ 📊 Today: 5 breaks      │
├─────────────────────────┤
│ ⏸️ Pause / ▶️ Resume    │
│ ⏭️ Skip to break        │
├─────────────────────────┤
│ ⚙️ Settings             │
│ ℹ️ About                │
│ 🚪 Quit                 │
└─────────────────────────┘
```

### Components

| ID | Component | Mô tả |
|----|-----------|-------|
| 1 | Header | Logo + version |
| 2 | Timer display | Thời gian còn lại (realtime) |
| 3 | Quick stats | Số breaks hôm nay |
| 4 | Pause/Resume | Toggle timer |
| 5 | Skip to break | Bắt đầu nghỉ ngay |
| 6 | Settings | Mở S04 |
| 7 | About | Thông tin app |
| 8 | Quit | Thoát ứng dụng |

---

## 3️⃣ S02: MINI DASHBOARD

**Kích hoạt:** Double-click Tray Icon  
**Kích thước:** 300 × 400 px

### Wireframe

```
┌─────────────────────────────┐
│       LUMBAR            ─ ×│
├─────────────────────────────┤
│                             │
│     ┌───────────────┐       │
│     │               │       │
│     │   🪵 Mascot   │       │
│     │  (Animated)   │       │
│     │               │       │
│     └───────────────┘       │
│                             │
│         ⏱️ 15:42            │
│   "Làm tốt lắm! Còn 15     │
│    phút nữa là nghỉ!"       │
│                             │
│   [⏸️ Pause]   [⚙️]        │
│                             │
└─────────────────────────────┘
```

### Components

| ID | Component | Mô tả |
|----|-----------|-------|
| 1 | Title bar | Tiêu đề + nút đóng |
| 2 | Mascot area | Mascot với animation |
| 3 | Timer | Đếm ngược lớn |
| 4 | Message | Câu thoại random |
| 5 | Actions | Pause + Settings buttons |

---

## 4️⃣ S03: BREAK OVERLAY

**Kích hoạt:** Timer hết + Level 3 escalation  
**Kích thước:** Fullscreen

### Wireframe

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              ░░░░ BACKDROP BLUR ░░░░                    │
│                                                         │
│                   ┌─────────────┐                       │
│                   │             │                       │
│                   │  🪵 Mascot  │                       │
│                   │  (Large)    │                       │
│                   │             │                       │
│                   └─────────────┘                       │
│                                                         │
│              "Đứng dậy đi nào! 💪"                     │
│                                                         │
│             ┌───────────────────────┐                   │
│             │  💪 BÀI TẬP NGẮN      │                   │
│             │  Xoay cổ 360°...      │                   │
│             └───────────────────────┘                   │
│                                                         │
│   [🟢 Nghỉ ngơi đây!]    [😅 Kệ tôi thêm 5 phút...]   │
│                                                         │
│               ⏱️ Break: 00:20                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Components

| ID | Component | Mô tả |
|----|-----------|-------|
| 1 | Backdrop | Blur nội dung phía sau |
| 2 | Mascot | Lớn, có animation theo state |
| 3 | Main message | Câu thoại chính |
| 4 | Health tip | Card S05 (optional) |
| 5 | Take break btn | Primary - xác nhận nghỉ |
| 6 | Snooze btn | Secondary - hoãn (passive-aggressive) |
| 7 | Break timer | Đếm ngược thời gian nghỉ |

### Mascot States trong Overlay

| State | Trigger | Mascot | Button Text |
|-------|---------|--------|-------------|
| Happy | Lần đầu | 😊 Vui | "Nghỉ ngơi đây!" |
| Neutral | Snooze 1-2 lần | 😐 Bình thường | "Lại hoãn à?" |
| Angry | Snooze 3+ lần | 😤 Giận | "Tôi chọn đau lưng" |

---

## 5️⃣ S04: SETTINGS WINDOW

**Kích hoạt:** Click Settings trong Tray Menu  
**Kích thước:** 400 × 550 px

### Wireframe

```
┌─────────────────────────────────────┐
│         ⚙️ SETTINGS             ─ ×│
├─────────────────────────────────────┤
│                                     │
│  ⏱️ TIMER                           │
│  ├─ Micro-break interval   [20] min│
│  ├─ Micro-break duration   [20] sec│
│  ├─ Rest-break interval    [60] min│
│  └─ Rest-break duration    [5] min │
│                                     │
│  🔔 NOTIFICATIONS                   │
│  ├─ Sound                  [✓] On  │
│  ├─ Notification level  [▼ Overlay]│
│  └─ Snooze limit           [3]     │
│                                     │
│  🌐 GENERAL                         │
│  ├─ Language       [▼ Tiếng Việt]  │
│  ├─ Theme          [▼ System]      │
│  └─ Start with OS  [✓]             │
│                                     │
│  [Reset Defaults]       [💾 Save]   │
│                                     │
└─────────────────────────────────────┘
```

### Settings Options

| Section | Setting | Default | Options |
|---------|---------|---------|---------|
| **Timer** | Micro interval | 20 min | 10-60 |
| | Micro duration | 20 sec | 10-60 |
| | Rest interval | 60 min | 30-120 |
| | Rest duration | 5 min | 3-15 |
| **Notifications** | Sound | On | On/Off |
| | Level | Overlay | Toast/Overlay |
| | Snooze limit | 3 | 1-5 |
| **General** | Language | System | VI/EN |
| | Theme | System | Light/Dark/System |
| | Startup | On | On/Off |

---

## 6️⃣ S05: HEALTH TIPS COMPONENT

**Vị trí:** Bên trong S03: Break Overlay

### Wireframe

```
┌─────────────────────────────────┐
│  💪 BÀI TẬP NGẮN               │
├─────────────────────────────────┤
│  👀 Nhìn xa 20 feet             │
│                                 │
│  Nhìn ra cửa sổ hoặc nhìn vào  │
│  một điểm xa khoảng 6 mét      │
│  trong 20 giây.                 │
│                                 │
│  [◀️ Prev]    1/5    [Next ▶️]  │
└─────────────────────────────────┘
```

### Danh Sách Bài Tập

| # | Icon | Tên | Thời gian |
|---|------|-----|-----------|
| 1 | 👀 | Nhìn xa 20 feet | 20s |
| 2 | 🔄 | Xoay cổ 360° | 30s |
| 3 | 💪 | Vươn vai | 30s |
| 4 | 👁️ | Nháy mắt 20 lần | 10s |
| 5 | 🧘 | Hít thở sâu | 30s |

---

## 7️⃣ S06: STATS DASHBOARD (Phase 3)

**Kích hoạt:** Từ Tray Menu hoặc Settings  
**Kích thước:** 450 × 600 px

### Wireframe

```
┌─────────────────────────────────────┐
│         📊 STATISTICS           ─ ×│
├─────────────────────────────────────┤
│                                     │
│  🔥 STREAK                          │
│  ┌─────────────────────────────┐    │
│  │       7 ngày liên tiếp      │    │
│  │   🔥🔥🔥🔥🔥🔥🔥               │    │
│  └─────────────────────────────┘    │
│                                     │
│  📈 TUẦN NÀY                        │
│  ┌─────────────────────────────┐    │
│  │  █ █ █ █ █ █ _              │    │
│  │  M T W T F S S              │    │
│  └─────────────────────────────┘    │
│                                     │
│  📋 SUMMARY                         │
│  ├─ ⏱️ Work hours: 42h              │
│  ├─ ☕ Breaks: 126                  │
│  └─ ⏸️ Snoozes: 12                  │
│                                     │
│  🏆 ACHIEVEMENTS                    │
│  [🏅 7-day] [🏅 100 breaks] [🔒]   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 DESIGN TOKENS

> **📌 Chi tiết đầy đủ:** Xem [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

### Design Style: Glassmorphism

| Đặc điểm | Mô tả |
|----------|-------|
| **Background** | Semi-transparent (rgba) |
| **Blur** | backdrop-filter: blur(10-20px) |
| **Border** | Subtle white border |
| **Shadow** | Soft, diffused shadow |
| **Corners** | Rounded (16-24px) |

### Glass Component Example

```css
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}
```

### Colors

| Token | Light | Dark |
|-------|-------|------|
| Background | #FFFFFF | #1A1A2E |
| Primary | #FF6B35 | #FF6B35 |
| Secondary | #4ECDC4 | #4ECDC4 |
| Text | #2D3436 | #EAEAEA |

### Typography

| Element | Font | Size |
|---------|------|------|
| Heading | Nunito Bold | 24px |
| Body | Nunito Regular | 14px |
| Caption | Nunito Regular | 12px |

### Spacing

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |

---

## 📱 RESPONSIVE NOTES

| Screen | Điều chỉnh |
|--------|------------|
| S02: Mini Dashboard | Fixed 300×400, có thể resize |
| S03: Overlay | Luôn fullscreen, content centered |
| S04: Settings | Fixed 400×550, scrollable nếu cần |

---

> 📝 **Tài liệu này được sử dụng cho việc implement UI components.**
