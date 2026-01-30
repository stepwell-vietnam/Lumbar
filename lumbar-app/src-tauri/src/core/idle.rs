use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::Mutex;
use tokio::time::interval;
use tauri::{AppHandle, Emitter};
use user_idle::UserIdle;

use super::idle_types::{IdleSettings, IdleState, IdleStatus};

pub struct IdleMonitor {
    state: Arc<Mutex<IdleState>>,
    settings: Arc<Mutex<IdleSettings>>,
    is_monitoring: Arc<Mutex<bool>>,
}

impl IdleMonitor {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(IdleState::default())),
            settings: Arc::new(Mutex::new(IdleSettings::default())),
            is_monitoring: Arc::new(Mutex::new(false)),
        }
    }

    /// Lấy state hiện tại
    pub async fn get_state(&self) -> IdleState {
        self.state.lock().await.clone()
    }

    /// Lấy settings
    pub async fn get_settings(&self) -> IdleSettings {
        self.settings.lock().await.clone()
    }

    /// Cập nhật settings
    pub async fn update_settings(&self, new_settings: IdleSettings) {
        let mut settings = self.settings.lock().await;
        *settings = new_settings.clone();
        
        // Update threshold in state too
        let mut state = self.state.lock().await;
        state.threshold_seconds = new_settings.threshold_seconds;
    }

    /// Bắt đầu monitoring
    pub async fn start_monitoring(&self, app_handle: AppHandle) {
        // Kiểm tra nếu đang monitor rồi
        {
            let mut is_monitoring = self.is_monitoring.lock().await;
            if *is_monitoring {
                return;
            }
            *is_monitoring = true;
        }

        let state = Arc::clone(&self.state);
        let settings = Arc::clone(&self.settings);
        let is_monitoring = Arc::clone(&self.is_monitoring);

        tokio::spawn(async move {
            let mut ticker = interval(Duration::from_secs(1));
            let mut was_idle = false;

            loop {
                ticker.tick().await;

                // Check if still monitoring
                {
                    let monitoring = is_monitoring.lock().await;
                    if !*monitoring {
                        break;
                    }
                }

                // Get current settings
                let current_settings = settings.lock().await.clone();
                
                if !current_settings.enabled {
                    continue;
                }

                // Check idle time using user-idle crate
                let idle_duration = UserIdle::get_time()
                    .map(|idle| idle.duration())
                    .unwrap_or(Duration::from_secs(0));
                
                let idle_seconds = idle_duration.as_secs();

                // Update state
                let mut current_state = state.lock().await;
                current_state.idle_seconds = idle_seconds;
                
                let now = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs();

                // Determine status
                let is_idle = idle_seconds >= current_state.threshold_seconds;
                
                if is_idle && !was_idle {
                    // Just became idle
                    current_state.status = IdleStatus::Idle;
                    was_idle = true;
                    
                    // Emit idle event
                    let _ = app_handle.emit("idle:became_idle", current_state.clone());
                    
                } else if !is_idle && was_idle {
                    // Just became active
                    current_state.status = IdleStatus::Active;
                    current_state.last_activity_timestamp = now;
                    was_idle = false;
                    
                    // Emit active event
                    let _ = app_handle.emit("idle:became_active", current_state.clone());
                }

                // Always emit status update for UI sync
                let _ = app_handle.emit("idle:status", current_state.clone());
            }
        });
    }

    /// Dừng monitoring
    pub async fn stop_monitoring(&self) {
        let mut is_monitoring = self.is_monitoring.lock().await;
        *is_monitoring = false;
    }

    /// Check một lần (không loop)
    pub async fn check_once(&self) -> IdleState {
        let idle_duration = UserIdle::get_time()
            .map(|idle| idle.duration())
            .unwrap_or(Duration::from_secs(0));

        let mut state = self.state.lock().await;
        state.idle_seconds = idle_duration.as_secs();
        
        let is_idle = state.idle_seconds >= state.threshold_seconds;
        state.status = if is_idle { IdleStatus::Idle } else { IdleStatus::Active };
        
        state.clone()
    }
}

impl Default for IdleMonitor {
    fn default() -> Self {
        Self::new()
    }
}
