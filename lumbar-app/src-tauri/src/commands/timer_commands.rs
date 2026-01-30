use tauri::{command, AppHandle, State};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::core::{TimerEngine, TimerState, TimerType, TimerSettings};

pub type TimerEngineState = Arc<Mutex<TimerEngine>>;

#[command]
pub async fn timer_start(
    app_handle: AppHandle,
    timer_engine: State<'_, TimerEngineState>,
    timer_type: String,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    
    let t_type = match timer_type.as_str() {
        "micro_break" => TimerType::MicroBreak,
        "rest_break" => TimerType::RestBreak,
        _ => return Err("Invalid timer type".to_string()),
    };
    
    engine.start(app_handle, t_type).await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_pause(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.pause().await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_resume(
    app_handle: AppHandle,
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.resume(app_handle).await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_reset(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.reset().await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_get_state(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_skip_to_break(
    app_handle: AppHandle,
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.skip_to_break(app_handle).await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_acknowledge_break(
    app_handle: AppHandle,
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerState, String> {
    let engine = timer_engine.lock().await;
    engine.acknowledge_break(app_handle).await;
    Ok(engine.get_state().await)
}

#[command]
pub async fn timer_update_settings(
    timer_engine: State<'_, TimerEngineState>,
    settings: TimerSettings,
) -> Result<(), String> {
    let engine = timer_engine.lock().await;
    engine.update_settings(settings).await;
    Ok(())
}

#[command]
pub async fn timer_get_settings(
    timer_engine: State<'_, TimerEngineState>,
) -> Result<TimerSettings, String> {
    let engine = timer_engine.lock().await;
    Ok(engine.get_settings().await)
}
