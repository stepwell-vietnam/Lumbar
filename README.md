# 🪵 Lumbar - Break Reminder

**Lumbar** là ứng dụng nhắc nhở nghỉ ngơi thông minh, giúp bảo vệ sức khỏe mắt và cột sống khi làm việc với máy tính.

![Lumbar App](lumbar_icon.jpeg)

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| ⏱️ **Micro Breaks** | Nghỉ 20 giây mỗi 20 phút (quy tắc 20-20-20) |
| 🧘 **Rest Breaks** | Nghỉ dài 5 phút mỗi 60 phút |
| 🎯 **Smart Idle Detection** | Tự động nhận biết khi rời máy tính |
| 🔔 **Escalating Notifications** | 3 cấp nhắc nhở: nhẹ → vừa → mạnh |
| 🏆 **Achievements** | Hệ thống thành tựu và streak |
| 🌍 **Đa ngôn ngữ** | Tiếng Việt & English |
| 🎨 **Minimalist UI** | Giao diện tối giản, hiện đại |

## 📥 Cài đặt

### macOS
```bash
# Tải file .dmg từ Releases
open Lumbar_x.x.x_aarch64.dmg
```

### Windows
```bash
# Tải file .exe hoặc .msi từ Releases
# Chạy installer
```

### Linux
```bash
# Ubuntu/Debian
sudo dpkg -i lumbar_x.x.x_amd64.deb

# AppImage
chmod +x Lumbar_x.x.x.AppImage
./Lumbar_x.x.x.AppImage
```

## 🛠️ Development

### Prerequisites
- Node.js 20+
- Rust 1.70+
- pnpm/npm

### Setup
```bash
# Clone repo
git clone https://github.com/stepwell-vietnam/Lumbar.git
cd Lumbar/lumbar-app

# Install dependencies
npm install

# Run development server
npm run tauri dev
```

### Build
```bash
# Build for production
npm run tauri build
```

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, TailwindCSS |
| Framework | Tauri 2.0 |
| Backend | Rust |
| State | Zustand |
| Animation | Framer Motion |
| i18n | i18next |

## 📂 Project Structure

```
Lumbar/
├── lumbar-app/
│   ├── src/              # React frontend
│   │   ├── components/   # UI components
│   │   ├── stores/       # Zustand stores
│   │   ├── screens/      # Screen components
│   │   └── locales/      # Translation files
│   └── src-tauri/        # Rust backend
│       ├── src/
│       │   ├── commands/ # IPC commands
│       │   └── core/     # Business logic
│       └── icons/        # App icons
├── docs/                 # Documentation
└── .github/workflows/    # CI/CD
```

## 🔄 CI/CD

GitHub Actions tự động build cho:
- 🍎 macOS (ARM & Intel)
- 🪟 Windows (x64)
- 🐧 Linux (deb, AppImage)

## 📝 License

MIT License © 2026 Stepwell Vietnam

## 🙏 Credits

Developed with ❤️ by [Stepwell Vietnam](https://github.com/stepwell-vietnam)
