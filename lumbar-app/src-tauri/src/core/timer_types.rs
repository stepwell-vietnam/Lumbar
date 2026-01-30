use serde::{Deserialize, Serialize};

/// Loại timer
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum TimerType {
    MicroBreak,  // 20 phút → nghỉ 20 giây
    RestBreak,   // 60 phút → nghỉ 5-10 phút
}

/// Trạng thái timer
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum TimerStatus {
    Idle,     // Chưa bắt đầu
    Running,  // Đang đếm ngược
    Paused,   // Tạm dừng
    Break,    // Đang trong thời gian nghỉ
}

/// State của timer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub status: TimerStatus,
    pub timer_type: TimerType,
    pub remaining_seconds: u64,    // Thời gian còn lại (giây)
    pub total_seconds: u64,        // Tổng thời gian (giây)
    pub is_break_time: bool,       // Đang trong break hay work
}

impl Default for TimerState {
    fn default() -> Self {
        Self {
            status: TimerStatus::Idle,
            timer_type: TimerType::MicroBreak,
            remaining_seconds: 20 * 60, // 20 phút default
            total_seconds: 20 * 60,
            is_break_time: false,
        }
    }
}

/// Settings cho timer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerSettings {
    pub micro_break_interval: u64,   // Mặc định 20 phút
    pub micro_break_duration: u64,   // Mặc định 20 giây
    pub rest_break_interval: u64,    // Mặc định 60 phút
    pub rest_break_duration: u64,    // Mặc định 5 phút
}

impl Default for TimerSettings {
    fn default() -> Self {
        Self {
            micro_break_interval: 20 * 60,  // 20 phút
            micro_break_duration: 20,        // 20 giây
            rest_break_interval: 60 * 60,   // 60 phút
            rest_break_duration: 5 * 60,    // 5 phút
        }
    }
}
