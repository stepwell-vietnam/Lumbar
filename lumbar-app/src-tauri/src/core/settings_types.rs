use serde::{Deserialize, Serialize};

/// User settings cho toàn bộ app
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub timer: TimerSettingsConfig,
    pub notification: NotificationSettingsConfig,
    pub general: GeneralSettingsConfig,
}

/// Timer settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerSettingsConfig {
    /// Micro-break interval (phút), range: 10-60
    pub micro_break_interval_min: u32,
    /// Micro-break duration (giây), range: 10-60
    pub micro_break_duration_sec: u32,
    /// Rest-break interval (phút), range: 30-120
    pub rest_break_interval_min: u32,
    /// Rest-break duration (phút), range: 3-15
    pub rest_break_duration_min: u32,
}

/// Notification settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettingsConfig {
    /// Bật/tắt âm thanh
    pub sound_enabled: bool,
    /// Level notification max (1/2/3)
    pub notification_level: u8,
    /// Số lần snooze tối đa
    pub snooze_limit: u8,
}

/// General settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneralSettingsConfig {
    /// Ngôn ngữ: "vi" | "en" | "system"
    pub language: String,
    /// Theme: "light" | "dark" | "system"
    pub theme: String,
    /// Khởi động cùng OS
    pub start_with_os: bool,
    /// Ngưỡng idle (phút)
    pub idle_threshold_min: u32,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            timer: TimerSettingsConfig::default(),
            notification: NotificationSettingsConfig::default(),
            general: GeneralSettingsConfig::default(),
        }
    }
}

impl Default for TimerSettingsConfig {
    fn default() -> Self {
        Self {
            micro_break_interval_min: 20,
            micro_break_duration_sec: 20,
            rest_break_interval_min: 60,
            rest_break_duration_min: 5,
        }
    }
}

impl Default for NotificationSettingsConfig {
    fn default() -> Self {
        Self {
            sound_enabled: true,
            notification_level: 3,
            snooze_limit: 3,
        }
    }
}

impl Default for GeneralSettingsConfig {
    fn default() -> Self {
        Self {
            language: "system".to_string(),
            theme: "system".to_string(),
            start_with_os: true,
            idle_threshold_min: 2,
        }
    }
}
