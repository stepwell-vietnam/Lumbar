# LUMBAR - DANH SÁCH CHỨC NĂNG & MÀN HÌNH UI

> **Platform:** macOS, Windows  
> **Ngôn ngữ:** Tiếng Việt, English  
> **Cập nhật:** 2026-01-29

---

## 📋 TỔNG QUAN CHỨC NĂNG

### Phân loại theo độ ưu tiên

| Ký hiệu | Độ ưu tiên | Mô tả |
|---------|------------|-------|
| **P0** | Bắt buộc | Không có = không ra mắt được |
| **P1** | Quan trọng | Cần có trong MVP |
| **P2** | Nên có | Có thể triển khai sau |
| **P3** | Tương lai | Gamification, mở rộng |

---

## 🔧 MODULE 1: CORE ENGINE (Rust Backend)

### F01: Smart Timer [P0]
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F01.1 | Micro-break timer | Đếm ngược 20 phút → nhắc nghỉ 20 giây |
| F01.2 | Rest-break timer | Đếm ngược 60 phút → nhắc nghỉ 5-10 phút |
| F01.3 | Timer persistence | Lưu trạng thái timer khi restart app |
| F01.4 | Background operation | Timer chạy chính xác khi app minimize |

### F02: Idle Detection [P0]
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F02.1 | Mouse/Keyboard tracking | Phát hiện thao tác chuột/phím |
| F02.2 | Auto-pause | Tạm dừng timer nếu idle > 2 phút |
| F02.3 | Auto-resume | Tiếp tục timer khi user quay lại |
| F02.4 | Idle threshold config | Cho phép điều chỉnh ngưỡng idle |

### F03: System Integration [P0]
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F03.1 | System tray icon | Icon trong khay hệ thống |
| F03.2 | Startup with OS | Tự khởi động cùng hệ điều hành |
| F03.3 | Native notifications | Toast notification của hệ thống |
| F03.4 | Fullscreen detection | Phát hiện app đang fullscreen (DND) |

---

## 🔔 MODULE 2: NOTIFICATION SYSTEM

### F04: Notification Escalation [P1]
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F04.1 | Level 1 - Hint | Icon tray đổi màu/nhấp nháy |
| F04.2 | Level 2 - Toast | Notification góc màn hình |
| F04.3 | Level 3 - Overlay | Lớp phủ toàn màn hình (blur) |
| F04.4 | Escalation logic | Tự động leo thang nếu user bỏ qua |

### F05: Snooze Logic [P1]
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F05.1 | Snooze 5 min | Hoãn 5 phút |
| F05.2 | Snooze 10 min | Hoãn 10 phút |
| F05.3 | Snooze limit | Giới hạn 3 lần liên tiếp |
| F05.4 | Snooze counter | Đếm số lần snooze hiển thị cho user |

---

## 🎭 MODULE 3: MASCOT & PERSONALITY

### F06: Dynamic Mascot [P1]
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F06.1 | Happy state | Vui khi user nghỉ đúng giờ |
| F06.2 | Sad state | Buồn khi user làm quá lâu |
| F06.3 | Angry state | Giận khi user spam snooze |
| F06.4 | Animation transitions | Chuyển đổi mượt giữa các trạng thái |

### F07: Dynamic Content [P1]
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F07.1 | Random messages | Câu thoại ngẫu nhiên theo ngữ cảnh |
| F07.2 | Passive-aggressive copy | Nút bấm châm biếm nhẹ |
| F07.3 | Health tips | Bài tập ngắn hiển thị trên overlay |
| F07.4 | i18n support | Hỗ trợ 2 ngôn ngữ: VI, EN |

---

## ⚙️ MODULE 4: SETTINGS & STORAGE

### F08: User Settings [P1]
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F08.1 | Timer intervals | Tùy chỉnh thời gian micro/rest break |
| F08.2 | Break duration | Tùy chỉnh độ dài nghỉ |
| F08.3 | Sound toggle | Bật/tắt âm thanh |
| F08.4 | Language switch | Chuyển đổi VI/EN |
| F08.5 | Theme selection | Chọn theme (light/dark) |
| F08.6 | Notification level | Chọn mức nhắc nhở mặc định |

### F09: Data Persistence [P1]
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F09.1 | Settings storage | Lưu cài đặt vào file JSON local |
| F09.2 | Stats storage | Lưu thống kê sử dụng |
| F09.3 | Auto-save | Tự động lưu khi thay đổi |

---

## 📊 MODULE 5: GAMIFICATION [P3 - Tương lai]

### F10: Streak & Stats
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| F10.1 | Daily streak | Chuỗi ngày tuân thủ |
| F10.2 | Weekly report | Báo cáo tuần |
| F10.3 | Break counter | Đếm số lần nghỉ |
| F10.4 | Work hours | Tổng giờ làm việc |

---

## 🖥️ DANH SÁCH MÀN HÌNH UI

### Tổng quan

| # | Màn hình | Loại | Mô tả |
|---|----------|------|-------|
| S01 | System Tray Menu | Popup | Menu khi click icon tray |
| S02 | Mini Dashboard | Window | Cửa sổ nhỏ hiển thị timer |
| S03 | Break Overlay | Fullscreen | Lớp phủ nhắc nghỉ |
| S04 | Settings | Window | Cửa sổ cài đặt |
| S05 | Health Tips | Component | Bài tập hiển thị trong overlay |
| S06 | Stats Dashboard | Window | Thống kê (Phase 3) |

---

### S01: System Tray Menu [P0]

**Mô tả:** Menu dropdown khi click vào icon trong system tray

```
┌─────────────────────────┐
│ 🪵 Lumbar               │
├─────────────────────────┤
│ ⏱️ Next break: 12:34    │
│ 📊 Today: 5 breaks      │
├─────────────────────────┤
│ ⏸️ Pause                │
│ ⚙️ Settings             │
│ ℹ️ About                │
│ 🚪 Quit                 │
└─────────────────────────┘
```

**Thành phần:**
| ID | Component | Mô tả |
|----|-----------|-------|
| S01.1 | Timer display | Hiển thị thời gian còn lại |
| S01.2 | Quick stats | Số lần nghỉ hôm nay |
| S01.3 | Pause/Resume button | Tạm dừng/tiếp tục |
| S01.4 | Settings link | Mở cửa sổ Settings |
| S01.5 | About link | Thông tin app |
| S01.6 | Quit button | Thoát ứng dụng |

---

### S02: Mini Dashboard [P1]

**Mô tả:** Cửa sổ nhỏ hiển thị timer và mascot

```
┌─────────────────────────────────┐
│         LUMBAR              ─ □ X│
├─────────────────────────────────┤
│                                 │
│      ┌─────────────────┐        │
│      │    🪵 Mascot    │        │
│      │   (animation)   │        │
│      └─────────────────┘        │
│                                 │
│         ⏱️ 15:42               │
│      "Còn 15 phút nữa thôi"    │
│                                 │
│  [⏸️ Pause]  [⚙️ Settings]     │
│                                 │
└─────────────────────────────────┘
```

**Thành phần:**
| ID | Component | Mô tả |
|----|-----------|-------|
| S02.1 | Mascot display | Hiển thị mascot với animation |
| S02.2 | Timer countdown | Đồng hồ đếm ngược lớn |
| S02.3 | Status message | Câu thoại ngẫu nhiên |
| S02.4 | Quick actions | Nút Pause, Settings |

---

### S03: Break Overlay [P0]

**Mô tả:** Lớp phủ toàn màn hình khi đến giờ nghỉ

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              ░░░ BACKDROP BLUR ░░░                  │
│                                                     │
│          ┌─────────────────────────┐                │
│          │                         │                │
│          │      🪵 Mascot          │                │
│          │    (happy/sad/angry)    │                │
│          │                         │                │
│          └─────────────────────────┘                │
│                                                     │
│              "Đứng dậy đi nào!"                    │
│                                                     │
│         ┌─────────────────────────┐                 │
│         │   💪 Health Tip Here    │                 │
│         │   "Xoay cổ 360°..."     │                 │
│         └─────────────────────────┘                 │
│                                                     │
│    [Nghỉ ngơi đây!]    [Kệ tôi thêm 5 phút...]    │
│                                                     │
│           ⏱️ Break ends in: 00:20                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Thành phần:**
| ID | Component | Mô tả |
|----|-----------|-------|
| S03.1 | Backdrop blur | Làm mờ nội dung phía sau |
| S03.2 | Mascot (large) | Mascot lớn với animation |
| S03.3 | Main message | Câu thoại chính |
| S03.4 | Health tip card | Bài tập ngắn |
| S03.5 | Take break button | Nút xác nhận nghỉ |
| S03.6 | Snooze button | Nút hoãn (passive-aggressive) |
| S03.7 | Break countdown | Đếm ngược thời gian nghỉ |

---

### S04: Settings Window [P1]

**Mô tả:** Cửa sổ cài đặt đầy đủ

```
┌─────────────────────────────────────────┐
│         SETTINGS                    ─ □ X│
├─────────────────────────────────────────┤
│                                         │
│  ⏱️ TIMER                               │
│  ├─ Micro-break interval: [20] phút    │
│  ├─ Micro-break duration: [20] giây    │
│  ├─ Rest-break interval:  [60] phút    │
│  └─ Rest-break duration:  [5] phút     │
│                                         │
│  🔔 NOTIFICATIONS                       │
│  ├─ Sound: [✓] On                      │
│  ├─ Level: [▼ Full Overlay]            │
│  └─ Snooze limit: [3] times            │
│                                         │
│  🌐 GENERAL                             │
│  ├─ Language: [▼ Tiếng Việt]           │
│  ├─ Theme: [▼ System]                  │
│  └─ Start with OS: [✓]                 │
│                                         │
│  [Reset to Defaults]    [Save]          │
│                                         │
└─────────────────────────────────────────┘
```

**Thành phần:**
| ID | Component | Mô tả |
|----|-----------|-------|
| S04.1 | Timer settings | Cài đặt thời gian |
| S04.2 | Notification settings | Cài đặt thông báo |
| S04.3 | General settings | Cài đặt chung |
| S04.4 | Language selector | Dropdown chọn ngôn ngữ |
| S04.5 | Theme selector | Dropdown chọn theme |
| S04.6 | Save button | Lưu cài đặt |
| S04.7 | Reset button | Khôi phục mặc định |

---

### S05: Health Tips Component [P2]

**Mô tả:** Card hiển thị bài tập ngắn trong overlay

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
│  [◀️ Prev]  1/5  [Next ▶️]      │
│                                 │
└─────────────────────────────────┘
```

**Thành phần:**
| ID | Component | Mô tả |
|----|-----------|-------|
| S05.1 | Tip icon | Icon bài tập |
| S05.2 | Tip title | Tên bài tập |
| S05.3 | Tip description | Mô tả chi tiết |
| S05.4 | Navigation | Chuyển bài tập |

---

### S06: Stats Dashboard [P3 - Tương lai]

**Mô tả:** Cửa sổ thống kê (Phase 3)

```
┌─────────────────────────────────────────┐
│         STATISTICS                  ─ □ X│
├─────────────────────────────────────────┤
│                                         │
│  🔥 STREAK: 7 ngày liên tiếp           │
│                                         │
│  📊 TUẦN NÀY                            │
│  ┌─────────────────────────────────┐    │
│  │  █ █ █ █ █ █ █                  │    │
│  │  M T W T F S S                  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ⏱️ Tổng giờ làm: 42h                  │
│  ☕ Số lần nghỉ: 126                    │
│  ⏸️ Số lần snooze: 12                  │
│                                         │
│  🏆 ACHIEVEMENTS                        │
│  [7-day streak] [100 breaks] [...]     │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🌐 I18N - DANH SÁCH STRING CẦN DỊCH

### Categories

| Category | Số lượng (ước tính) |
|----------|---------------------|
| UI Labels | ~30 strings |
| Button Text | ~15 strings |
| Mascot Messages | ~20 strings |
| Health Tips | ~10 strings |
| Notifications | ~10 strings |
| Settings | ~20 strings |
| **Tổng** | **~105 strings** |

---

## 📦 TỔNG KẾT

### MVP (Phase 1) - Cần triển khai

| Module | Chức năng |
|--------|-----------|
| Core Engine | F01, F02, F03 |
| Notifications | F04, F05 |
| UI Screens | S01, S02, S03, S04 |

### Phase 2 - Personality

| Module | Chức năng |
|--------|-----------|
| Mascot | F06 |
| Content | F07 |
| Settings | F08, F09 |
| UI | S05 |

### Phase 3 - Gamification

| Module | Chức năng |
|--------|-----------|
| Stats | F10 |
| UI | S06 |

---

> 📝 **Ghi chú:** Document này sẽ được cập nhật theo tiến độ dự án.
