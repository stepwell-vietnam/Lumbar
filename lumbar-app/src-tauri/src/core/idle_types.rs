use serde::{Deserialize, Serialize};

/// Trạng thái idle của user
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum IdleStatus {
    Active,    // User đang thao tác
    Idle,      // User không thao tác
}

/// State của Idle Monitor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdleState {
    pub status: IdleStatus,
    pub idle_seconds: u64,           // Số giây đã idle
    pub threshold_seconds: u64,       // Ngưỡng để coi là idle
    pub last_activity_timestamp: u64, // Unix timestamp of last activity
}

impl Default for IdleState {
    fn default() -> Self {
        Self {
            status: IdleStatus::Active,
            idle_seconds: 0,
            threshold_seconds: 10, // 10s for quick testing (change to 2*60 for production)
            last_activity_timestamp: 0,
        }
    }
}

/// Settings cho Idle Detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdleSettings {
    pub enabled: bool,
    pub threshold_seconds: u64,  // Mặc định 2 phút
    pub auto_pause_timer: bool,  // Tự động pause timer khi idle
    pub auto_resume_timer: bool, // Tự động resume khi active
}

impl Default for IdleSettings {
    fn default() -> Self {
        Self {
            enabled: true,
            threshold_seconds: 10, // 10s for testing (change to 2*60 for production)
            auto_pause_timer: true,
            auto_resume_timer: true,
        }
    }
}
