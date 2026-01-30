use tauri::{AppHandle, Emitter};

use super::tray_types::{NotificationLevel, NotificationPayload, TrayIconState};

pub struct NotificationManager {
    current_level: NotificationLevel,
    escalation_count: u32,
}

impl NotificationManager {
    pub fn new() -> Self {
        Self {
            current_level: NotificationLevel::Hint,
            escalation_count: 0,
        }
    }

    /// Reset về level 1 khi user đã nghỉ
    pub fn reset(&mut self) {
        self.current_level = NotificationLevel::Hint;
        self.escalation_count = 0;
    }

    /// Leo thang notification level
    pub fn escalate(&mut self) -> NotificationLevel {
        self.current_level = match self.current_level {
            NotificationLevel::Hint => NotificationLevel::Toast,
            NotificationLevel::Toast => NotificationLevel::Overlay,
            NotificationLevel::Overlay => NotificationLevel::Overlay,
        };
        self.escalation_count += 1;
        self.current_level
    }

    /// Get current level
    pub fn get_current_level(&self) -> NotificationLevel {
        self.current_level
    }

    /// Gửi notification
    pub fn send_notification(
        &self,
        app_handle: &AppHandle,
        title: &str,
        message: &str,
        timer_type: &str,
    ) -> Result<(), String> {
        let payload = NotificationPayload {
            level: self.current_level,
            title: title.to_string(),
            message: message.to_string(),
            timer_type: timer_type.to_string(),
        };

        match self.current_level {
            NotificationLevel::Hint => {
                // Emit event để frontend đổi tray icon
                let _ = app_handle.emit("notification:hint", payload);
            }
            NotificationLevel::Toast => {
                // Emit event cho frontend (native notification handled separately)
                let _ = app_handle.emit("notification:toast", payload);
            }
            NotificationLevel::Overlay => {
                // Emit event để frontend hiển thị overlay
                let _ = app_handle.emit("notification:overlay", payload);
            }
        }

        Ok(())
    }

    /// Cập nhật tray icon state
    pub fn update_tray_icon(&self, app_handle: &AppHandle, state: TrayIconState) {
        let _ = app_handle.emit("tray:update_icon", state);
    }
}

impl Default for NotificationManager {
    fn default() -> Self {
        Self::new()
    }
}
