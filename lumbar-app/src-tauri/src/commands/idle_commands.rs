use tauri::{command, AppHandle, State};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::core::{IdleMonitor, IdleState, IdleSettings};

pub type IdleMonitorState = Arc<Mutex<IdleMonitor>>;

#[command]
pub async fn idle_start_monitoring(
    app_handle: AppHandle,
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<(), String> {
    let monitor = idle_monitor.lock().await;
    monitor.start_monitoring(app_handle).await;
    Ok(())
}

#[command]
pub async fn idle_stop_monitoring(
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<(), String> {
    let monitor = idle_monitor.lock().await;
    monitor.stop_monitoring().await;
    Ok(())
}

#[command]
pub async fn idle_get_state(
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<IdleState, String> {
    let monitor = idle_monitor.lock().await;
    Ok(monitor.get_state().await)
}

#[command]
pub async fn idle_check_once(
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<IdleState, String> {
    let monitor = idle_monitor.lock().await;
    Ok(monitor.check_once().await)
}

#[command]
pub async fn idle_get_settings(
    idle_monitor: State<'_, IdleMonitorState>,
) -> Result<IdleSettings, String> {
    let monitor = idle_monitor.lock().await;
    Ok(monitor.get_settings().await)
}

#[command]
pub async fn idle_update_settings(
    idle_monitor: State<'_, IdleMonitorState>,
    settings: IdleSettings,
) -> Result<(), String> {
    let monitor = idle_monitor.lock().await;
    monitor.update_settings(settings).await;
    Ok(())
}
