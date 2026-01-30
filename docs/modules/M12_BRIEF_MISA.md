# 📱 M12 iOS MOBILE - BRIEF CHO MISA

> **Từ:** LUMB  
> **Ngày:** 2026-01-30  
> **Priority:** HIGH  
> **Prerequisite:** macOS build v1.0.0-beta ✅ DONE

---

## 🎯 MỤC TIÊU

Deploy **Lumbar** lên **iPhone** sử dụng **Tauri 2.0 iOS**.

---

## ✅ CONTEXT: MACOS BUILD ĐÃ HOÀN TẤT

| Item | Status |
|------|--------|
| M01-M10 Core | ✅ 100% |
| M11 Soul Breathing | ✅ 100% |
| M13 Auto-Start UX | ✅ 100% |
| macOS .app | ✅ Built |
| macOS .dmg | ✅ 6.3MB |

---

## 📋 TASKS CHO MISA (Theo thứ tự ưu tiên)

### 🔴 P0: SETUP (Day 1-2)

#### Task 1: iOS Environment

```bash
# 1. Cài Xcode 15+ từ App Store

# 2. Thêm iOS targets
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim

# 3. Init iOS project
cd lumbar-app
npm run tauri ios init
```

#### Task 2: Update tauri.conf.json

```json
{
  "bundle": {
    "iOS": {
      "developmentTeam": "YOUR_TEAM_ID",
      "minVersion": "15.0"
    }
  }
}
```

---

### 🟠 P1: UI RESPONSIVE (Day 3-7)

#### Task 3: Tạo `src/hooks/usePlatform.ts`

Xem code chi tiết trong: `docs/modules/M12_IOS_MOBILE.md` Task 4

#### Task 4: Tạo `src/components/Layout/MobileLayout.tsx`

- Safe area padding cho notch
- Bottom tab bar
- Full screen responsive

#### Task 5: Tạo `src/components/Layout/BottomTabBar.tsx`

- 4 tabs: Home, Stats, Settings, Awards
- Active indicator animated
- i18n labels

#### Task 6: Tạo `src/screens/Dashboard/MobileDashboard.tsx`

- Large timer card
- Mascot display
- Streak badge
- Quick stats

---

### 🟡 P2: NOTIFICATIONS (Day 8-10)

#### Task 7: Tạo `src/services/iosNotifications.ts`

- Request permission
- Register action types (Take Break, Snooze)
- Send break notifications

#### Task 8: Tạo `src/services/iosBackgroundTimer.ts`

- Schedule notifications
- Cancel notifications

---

### 🟢 P3: ADAPTATION (Day 11-14)

#### Task 9: Tạo `src/utils/platformFeatures.ts`

| Feature | Desktop | iOS |
|---------|---------|-----|
| System Tray | ✅ | ❌ |
| Idle Detection | ✅ | ❌ |
| Overlay | ✅ | ❌ |
| Haptic Feedback | ❌ | ✅ |
| Push Notifications | ❌ | ✅ |

#### Task 10: Tạo `src/hooks/useHaptic.ts`

- Trigger haptic feedback
- Light/medium/heavy patterns

#### Task 11: Update i18n

Thêm vào `vi.json` và `en.json`:
```json
{
  "nav": {
    "home": "Trang chủ",
    "stats": "Thống kê",
    "settings": "Cài đặt",
    "awards": "Thành tựu"
  }
}
```

---

### ⚪ P4: BUILD & TEST (Day 15-18)

#### Task 12: Build Commands

```bash
# Simulator
npm run tauri ios dev

# Real device
npm run tauri ios dev -- --device

# Production
npm run tauri ios build
```

#### Task 13: Testing Checklist

- [ ] App launches
- [ ] Timer starts/stops
- [ ] Notifications appear
- [ ] Tab navigation
- [ ] Settings save
- [ ] Safe areas (notch)
- [ ] Dark mode

---

## 📁 FILES CẦN TẠO MỚI

| # | File | Priority |
|---|------|----------|
| 1 | `src/hooks/usePlatform.ts` | P1 |
| 2 | `src/hooks/useHaptic.ts` | P3 |
| 3 | `src/components/Layout/MobileLayout.tsx` | P1 |
| 4 | `src/components/Layout/BottomTabBar.tsx` | P1 |
| 5 | `src/screens/Dashboard/MobileDashboard.tsx` | P1 |
| 6 | `src/services/iosNotifications.ts` | P2 |
| 7 | `src/services/iosBackgroundTimer.ts` | P2 |
| 8 | `src/utils/platformFeatures.ts` | P3 |

---

## 📁 FILES CẦN MODIFY

| File | Changes |
|------|---------|
| `tailwind.config.js` | Thêm mobile breakpoints, safe-area spacing |
| `tauri.conf.json` | Thêm iOS config |
| `src/App.tsx` | Platform routing, MobileLayout wrapper |
| `src/locales/vi.json` | Thêm nav keys |
| `src/locales/en.json` | Thêm nav keys |
| `Cargo.toml` | iOS dependencies |

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Apple Developer Account** cần thiết để test trên device thật
2. **Xcode 15+** bắt buộc
3. **Không có Idle Detection** trên iOS (remove feature)
4. **Không có System Tray** trên iOS (dùng Push Notifications thay thế)
5. **Background time limit** iOS chỉ cho ~30 giây

---

## 🗓️ TIMELINE ĐỀ XUẤT

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Setup + UI | MobileLayout, BottomTabBar |
| 2 | Notifications | iOS notifications working |
| 3 | Build + Test | TestFlight ready |

---

## 📖 REFERENCE

Xem code snippets chi tiết tại: `docs/modules/M12_IOS_MOBILE.md`

---

*LUMB - 2026-01-30*
