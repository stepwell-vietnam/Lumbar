PRODUCT REQUIREMENTS DOCUMENT (PRD)

Tên dự án: Lumbar  Phiên bản: 1.0 (MVP Phase) Nền tảng: Windows, macOS, Linux Công nghệ: Tauri (Rust), Vue.js/React, TailwindCSS

1. TỔNG QUAN SẢN PHẨM (EXECUTIVE SUMMARY)

1.1. Tầm nhìn Xây dựng một "người bạn đồng hành" trên máy tính giúp người dùng duy trì sức khỏe mà không gây ức chế. Thay vì ra lệnh như một cỗ máy, ứng dụng sử dụng sự hài hước, châm biếm nhẹ nhàng (như Duolingo) và giao diện tinh tế để thuyết phục người dùng nghỉ ngơi tự nguyện.

1.2. Giá trị cốt lõi (Key Value Propositions)

Siêu nhẹ (Lightweight): Dưới 10MB, chiếm dưới 50MB RAM.

Có cảm xúc (Personality-driven): Sử dụng Mascot và Micro-copy thú vị.

Không xâm lấn (Non-intrusive): Tôn trọng dòng chảy công việc (Flow state) của người dùng.

2. TÍNH NĂNG CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

2.1. Cơ chế cốt lõi (Core Logic)

F01: Smart Timer (Độ ưu tiên: P0 - Cao nhất)

Mô tả: Hỗ trợ 2 chế độ: Micro-break (20 giây mỗi 20 phút) và Rest-break (5-10 phút mỗi 60 phút). Timer phải hoạt động chính xác ngay cả khi app chạy nền.

F02: Idle Detection (Độ ưu tiên: P0)

Mô tả: Tự động tạm dừng timer nếu không phát hiện thao tác chuột/phím trong hơn 2 phút. Tránh việc nhắc nghỉ khi người dùng vừa mới quay lại bàn làm việc.

F03: Notification Escalation (Độ ưu tiên: P1)

Mô tả: Hệ thống nhắc nhở leo thang 3 cấp độ:

Level 1: Icon khay hệ thống đổi màu hoặc nhấp nháy.

Level 2: Toast notification (góc màn hình) với nội dung hài hước.

Level 3: Full-screen Overlay (Lớp phủ mờ).

F04: Snooze Logic (Độ ưu tiên: P1)

Mô tả: Cho phép hoãn nghỉ (5 hoặc 10 phút). Tuy nhiên, nếu hoãn quá 3 lần liên tiếp, Mascot sẽ đổi thái độ (từ vui vẻ sang dỗi hoặc thất vọng).

F05: Do Not Disturb - DND (Độ ưu tiên: P2)

Mô tả: Tự động phát hiện khi người dùng đang chạy ứng dụng Fullscreen (Game, Slide thuyết trình) để không hiện Overlay (chỉ hiện thông báo nhỏ hoặc tắt hẳn).

2.2. Nội dung & Tương tác (Content & Interaction)

C01: Dynamic Mascot (Độ ưu tiên: P1)

Mô tả: Một nhân vật (Mascot Lumbar - Khúc gỗ) có các trạng thái cảm xúc: Vui (khi user nghỉ đúng giờ), Buồn (khi user làm quá lâu), Tức giận (khi user spam nút Snooze).

C02: Passive-Aggressive Copy (Độ ưu tiên: P1)

Mô tả: Nội dung nút bấm thay đổi theo ngữ cảnh.

Thay vì "Skip", dùng: "Tôi chọn đau lưng", "Kệ tôi đi".

Thay vì "Take a break", dùng: "Cứu lấy đôi mắt này".

C03: Health Tips (Độ ưu tiên: P2)

Mô tả: Hiển thị ngẫu nhiên bài tập ngắn (xoay cổ, nhìn xa, vươn vai) ngay trên lớp phủ màn hình.

3. THIẾT KẾ UX/UI & HỆ THỐNG DESIGN (DESIGN SYSTEM)

3.1. Phong cách chủ đạo (Visual Style)

Theme: Modern Minimalist kết hợp Glassmorphism (hiệu ứng kính mờ).

Màu sắc: Pastel nhẹ nhàng (để không gây chói mắt), nhưng dùng màu Accent nổi bật (Cam/Xanh lá) cho các nút hành động chính.

Font chữ: Sans-serif tròn trịa, thân thiện (Ví dụ: Nunito, Quicksand hoặc Inter).

3.2. Trải nghiệm lớp phủ (Overlay Experience)

Không dùng màn hình đen xì (Blackout) gây sốc.

Sử dụng Backdrop Blur (làm mờ nội dung phía sau). Người dùng vẫn thấy lờ mờ công việc của mình nhưng không thể đọc rõ, tạo động lực nghỉ ngơi mà không cảm giác bị "cách ly".

Animation: Mascot xuất hiện với hiệu ứng nảy (bounce) hoặc trượt vào nhẹ nhàng.

3.3. Ví dụ về "Giọng văn" (Tone of Voice)

Bình thường: "Hey, 20 phút rồi. Nhìn ra cửa sổ chút đi nào."

Cà khịa nhẹ: "Bạn định ngồi dính vào ghế luôn à? Đứng dậy đi!"

Thao túng tâm lý: "Mắt bạn đang khóc đấy, bạn không nghe thấy sao?"

4. YÊU CẦU KỸ THUẬT (TECHNICAL ARCHITECTURE)

4.1. Tech Stack

Core: Tauri 2.0 (Rust) - Đảm bảo hiệu năng và tính năng hệ thống.

Frontend: React (hoặc Vue 3) + TypeScript.

Styling: Tailwind CSS + Framer Motion (cho React) hoặc AutoAnimate (để tạo chuyển động mượt).

State Management: React Context hoặc Zustand (nhẹ hơn Redux).

Storage: tauri-plugin-store (lưu file .json local, không cần Database phức tạp).

4.2. Yêu cầu phi chức năng (Non-functional Requirements)

Performance: Ứng dụng khởi động dưới 2 giây. Idle RAM usage dưới 50MB.

Cross-platform:

Windows: Đóng gói dưới dạng .msi hoặc .exe.

macOS: Đóng gói .dmg (Hỗ trợ cả chip Intel và Apple Silicon).

Linux: .deb hoặc .AppImage.

Security: Không thu thập dữ liệu người dùng gửi về server (Privacy-first). Mọi dữ liệu xử lý cục bộ.

5. LỘ TRÌNH PHÁT TRIỂN (ROADMAP)

Phase 1: MVP (Tuần 1-3)

Dựng khung Tauri + React.

Cài đặt Timer cơ bản & Idle Detection (Rust backend).

Thiết kế giao diện Overlay với hiệu ứng mờ (Blur).

Tích hợp một Mascot tĩnh (hình ảnh PNG/SVG) với 3 câu thoại cơ bản.

Đóng gói bản cài đặt sơ khai.

Phase 2: Personality & Polish (Tuần 4-6)

Thêm Logic "Cảm xúc" cho Mascot (State machine).

Nâng cấp nội dung Micro-copy (Lời thoại thay đổi random).

Thêm âm thanh thông báo (Sound effects) nhẹ nhàng.

Cài đặt (Settings): Cho phép chỉnh thời gian, bật/tắt âm thanh.

Phase 3: Gamification (Tương lai)

Tính năng "Streak" (Chuỗi ngày tuân thủ).

Thống kê thời gian làm việc/nghỉ ngơi trong tuần.

Sync mobile (nếu phát triển thêm app điện thoại).