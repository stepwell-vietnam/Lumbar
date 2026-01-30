use tauri::{command, AppHandle};
use tauri_plugin_store::StoreExt;
use serde_json::json;

use crate::core::settings_types::AppSettings;

const SETTINGS_FILE: &str = "settings.json";
const SETTINGS_KEY: &str = "app_settings";

/// Load settings từ file
#[command]
pub async fn settings_load(app_handle: AppHandle) -> Result<AppSettings, String> {
    let store = app_handle
        .store(SETTINGS_FILE)
        .map_err(|e| format!("Failed to open store: {}", e))?;
    
    match store.get(SETTINGS_KEY) {
        Some(value) => {
            serde_json::from_value(value.clone())
                .map_err(|e| format!("Failed to parse settings: {}", e))
        }
        None => {
            // Trả về default settings nếu chưa có
            let default_settings = AppSettings::default();
            // Lưu default settings
            let _ = store.set(SETTINGS_KEY, json!(default_settings));
            let _ = store.save();
            Ok(default_settings)
        }
    }
}

/// Lưu settings vào file
#[command]
pub async fn settings_save(
    app_handle: AppHandle,
    settings: AppSettings,
) -> Result<(), String> {
    let store = app_handle
        .store(SETTINGS_FILE)
        .map_err(|e| format!("Failed to open store: {}", e))?;
    
    store.set(SETTINGS_KEY, json!(settings));
    store.save().map_err(|e| format!("Failed to save settings: {}", e))?;
    
    Ok(())
}

/// Reset settings về mặc định
#[command]
pub async fn settings_reset(app_handle: AppHandle) -> Result<AppSettings, String> {
    let store = app_handle
        .store(SETTINGS_FILE)
        .map_err(|e| format!("Failed to open store: {}", e))?;
    
    let default_settings = AppSettings::default();
    store.set(SETTINGS_KEY, json!(default_settings));
    store.save().map_err(|e| format!("Failed to save settings: {}", e))?;
    
    Ok(default_settings)
}
