use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{interval, Duration};
use tauri::{AppHandle, Emitter};

use super::timer_types::{TimerState, TimerStatus, TimerType, TimerSettings};

pub struct TimerEngine {
    state: Arc<Mutex<TimerState>>,
    settings: Arc<Mutex<TimerSettings>>,
    is_ticking: Arc<Mutex<bool>>,
}

impl TimerEngine {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(TimerState::default())),
            settings: Arc::new(Mutex::new(TimerSettings::default())),
            is_ticking: Arc::new(Mutex::new(false)),
        }
    }

    /// Lấy state hiện tại
    pub async fn get_state(&self) -> TimerState {
        self.state.lock().await.clone()
    }

    /// Lấy settings
    pub async fn get_settings(&self) -> TimerSettings {
        self.settings.lock().await.clone()
    }

    /// Cập nhật settings
    pub async fn update_settings(&self, new_settings: TimerSettings) {
        let mut settings = self.settings.lock().await;
        *settings = new_settings;
    }

    /// Bắt đầu timer
    pub async fn start(&self, app_handle: AppHandle, timer_type: TimerType) {
        let mut state = self.state.lock().await;
        let settings = self.settings.lock().await;
        
        // Set initial time based on timer type
        let total_seconds = match timer_type {
            TimerType::MicroBreak => settings.micro_break_interval,
            TimerType::RestBreak => settings.rest_break_interval,
        };

        state.status = TimerStatus::Running;
        state.timer_type = timer_type;
        state.remaining_seconds = total_seconds;
        state.total_seconds = total_seconds;
        state.is_break_time = false;
        
        drop(state);
        drop(settings);

        // Start ticking
        self.start_tick(app_handle).await;
    }

    /// Bắt đầu tick (1 giây 1 lần)
    async fn start_tick(&self, app_handle: AppHandle) {
        let state = Arc::clone(&self.state);
        let settings = Arc::clone(&self.settings);
        let is_ticking = Arc::clone(&self.is_ticking);

        // Kiểm tra nếu đang tick rồi thì không start lại
        {
            let mut ticking = is_ticking.lock().await;
            if *ticking {
                return;
            }
            *ticking = true;
        }

        tokio::spawn(async move {
            let mut ticker = interval(Duration::from_secs(1));

            loop {
                ticker.tick().await;

                let mut current_state = state.lock().await;
                
                // Chỉ tick khi đang Running hoặc Break
                if current_state.status != TimerStatus::Running && current_state.status != TimerStatus::Break {
                    if current_state.status == TimerStatus::Idle {
                        let mut ticking = is_ticking.lock().await;
                        *ticking = false;
                        break;
                    }
                    continue;
                }

                // Đếm ngược
                if current_state.remaining_seconds > 0 {
                    current_state.remaining_seconds -= 1;
                    
                    // Emit event to frontend
                    let _ = app_handle.emit("timer:tick", current_state.clone());
                } else {
                    // Hết giờ!
                    if current_state.is_break_time {
                        // Break xong → quay lại work
                        let settings_guard = settings.lock().await;
                        let interval_secs = match current_state.timer_type {
                            TimerType::MicroBreak => settings_guard.micro_break_interval,
                            TimerType::RestBreak => settings_guard.rest_break_interval,
                        };
                        current_state.remaining_seconds = interval_secs;
                        current_state.total_seconds = interval_secs;
                        current_state.is_break_time = false;
                        current_state.status = TimerStatus::Running;
                        drop(settings_guard);
                        
                        let _ = app_handle.emit("timer:work_resumed", current_state.clone());
                    } else {
                        // Work xong → bắt đầu break
                        let settings_guard = settings.lock().await;
                        let duration = match current_state.timer_type {
                            TimerType::MicroBreak => settings_guard.micro_break_duration,
                            TimerType::RestBreak => settings_guard.rest_break_duration,
                        };
                        current_state.remaining_seconds = duration;
                        current_state.total_seconds = duration;
                        current_state.is_break_time = true;
                        current_state.status = TimerStatus::Break;
                        drop(settings_guard);
                        
                        // Emit break event
                        let _ = app_handle.emit("timer:break", current_state.clone());
                    }
                }
            }
        });
    }

    /// Tạm dừng timer
    pub async fn pause(&self) {
        let mut state = self.state.lock().await;
        if state.status == TimerStatus::Running {
            state.status = TimerStatus::Paused;
        }
    }

    /// Tiếp tục timer
    pub async fn resume(&self, app_handle: AppHandle) {
        let mut state = self.state.lock().await;
        if state.status == TimerStatus::Paused {
            state.status = TimerStatus::Running;
            drop(state);
            self.start_tick(app_handle).await;
        }
    }

    /// Reset timer
    pub async fn reset(&self) {
        let mut state = self.state.lock().await;
        *state = TimerState::default();
        
        let mut is_ticking = self.is_ticking.lock().await;
        *is_ticking = false;
    }

    /// Skip to break (force trigger)
    pub async fn skip_to_break(&self, app_handle: AppHandle) {
        let mut state = self.state.lock().await;
        let settings = self.settings.lock().await;
        
        let duration = match state.timer_type {
            TimerType::MicroBreak => settings.micro_break_duration,
            TimerType::RestBreak => settings.rest_break_duration,
        };
        
        state.remaining_seconds = duration;
        state.total_seconds = duration;
        state.is_break_time = true;
        state.status = TimerStatus::Break;
        
        let _ = app_handle.emit("timer:break", state.clone());
    }

    /// Acknowledge break (user đã nghỉ)
    pub async fn acknowledge_break(&self, app_handle: AppHandle) {
        let mut state = self.state.lock().await;
        let settings = self.settings.lock().await;
        
        if state.status == TimerStatus::Break {
            let interval_secs = match state.timer_type {
                TimerType::MicroBreak => settings.micro_break_interval,
                TimerType::RestBreak => settings.rest_break_interval,
            };
            
            state.remaining_seconds = interval_secs;
            state.total_seconds = interval_secs;
            state.is_break_time = false;
            state.status = TimerStatus::Running;
            
            drop(state);
            drop(settings);
            
            self.start_tick(app_handle).await;
        }
    }
}

impl Default for TimerEngine {
    fn default() -> Self {
        Self::new()
    }
}
