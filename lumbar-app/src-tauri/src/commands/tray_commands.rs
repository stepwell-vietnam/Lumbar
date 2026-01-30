use tauri::{command, AppHandle, State};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::core::{NotificationManager, NotificationPayload, NotificationLevel};
use crate::commands::TimerEngineState;

pub type NotificationManagerState = Arc<Mutex<NotificationManager>>;

/// Lấy thông tin hiển thị cho tray menu
#[command]
pub async fn tray_get_info(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TrayMenuInfo, String> {
    let engine = timer_engine.lock().await;
    let state = engine.get_state().await;
    
    let next_break_text = format_time(state.remaining_seconds as u32);
    let timer_type = match state.timer_type {
        crate::core::TimerType::MicroBreak => "micro_break",
        crate::core::TimerType::RestBreak => "rest_break",
    };
    
    Ok(TrayMenuInfo {
        next_break: next_break_text,
        timer_type: timer_type.to_string(),
        status: format!("{:?}", state.status).to_lowercase(),
        is_break_time: state.is_break_time,
    })
}

/// Trigger notification ngay (skip to notification)
#[command]
pub async fn tray_trigger_break(
    app_handle: AppHandle,
    notification_manager: State<'_, NotificationManagerState>,
) -> Result<(), String> {
    let manager = notification_manager.lock().await;
    manager.send_notification(
        &app_handle,
        "Đến giờ nghỉ rồi!",
        "Đứng dậy vận động chút nhé!",
        "micro_break"
    )?;
    Ok(())
}

/// Show break overlay directly
#[command]
pub async fn tray_show_overlay(
    app_handle: AppHandle,
) -> Result<(), String> {
    use tauri::Emitter;
    let payload = NotificationPayload {
        level: NotificationLevel::Overlay,
        title: "Đến giờ nghỉ!".to_string(),
        message: "Hãy nghỉ ngơi một chút".to_string(),
        timer_type: "micro_break".to_string(),
    };
    let _ = app_handle.emit("notification:overlay", payload);
    Ok(())
}

/// Reset notification manager sau khi user đã nghỉ
#[command]
pub async fn notification_acknowledge(
    notification_manager: State<'_, NotificationManagerState>,
) -> Result<(), String> {
    let mut manager = notification_manager.lock().await;
    manager.reset();
    Ok(())
}

// Helper structs
#[derive(serde::Serialize)]
pub struct TrayMenuInfo {
    pub next_break: String,
    pub timer_type: String,
    pub status: String,
    pub is_break_time: bool,
}

fn format_time(seconds: u32) -> String {
    let mins = seconds / 60;
    let secs = seconds % 60;
    format!("{:02}:{:02}", mins, secs)
}

// M13: Window visibility commands
use tauri::Manager;

/// Hide window to system tray (also hide from Dock)
#[command]
pub async fn hide_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
        // Hide from Dock on macOS
        #[cfg(target_os = "macos")]
        {
            app.set_activation_policy(tauri::ActivationPolicy::Accessory)
                .map_err(|e| e.to_string())?;
        }
        println!("✅ Window hidden to tray (Dock hidden)");
    }
    Ok(())
}

/// Show window from tray (also show in Dock)
#[command]
pub async fn show_window(app: AppHandle) -> Result<(), String> {
    // Restore Dock visibility on macOS
    #[cfg(target_os = "macos")]
    {
        app.set_activation_policy(tauri::ActivationPolicy::Regular)
            .map_err(|e| e.to_string())?;
    }
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        println!("✅ Window shown (Dock restored)");
    }
    Ok(())
}
