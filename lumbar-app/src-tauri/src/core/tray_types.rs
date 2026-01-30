use serde::{Deserialize, Serialize};

/// Trạng thái của tray icon
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TrayIconState {
    /// Trạng thái bình thường (đang đếm)
    Normal,
    /// Timer hết - cần nhắc nghỉ (màu cam)
    Alert,
    /// User đang nghỉ (màu xanh lá)
    Break,
    /// Timer đang tạm dừng (màu xám)
    Paused,
}

/// Level của notification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NotificationLevel {
    /// Level 1: Icon hint (đổi màu + nhấp nháy)
    Hint,
    /// Level 2: Native toast notification  
    Toast,
    /// Level 3: Fullscreen overlay
    Overlay,
}

/// Dữ liệu gửi đến frontend để hiển thị notification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationPayload {
    pub level: NotificationLevel,
    pub title: String,
    pub message: String,
    pub timer_type: String,
}

impl Default for TrayIconState {
    fn default() -> Self {
        Self::Normal
    }
}

impl Default for NotificationLevel {
    fn default() -> Self {
        Self::Overlay
    }
}
