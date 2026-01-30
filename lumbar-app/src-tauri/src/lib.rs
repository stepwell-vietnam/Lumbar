// LUMBAR - Break Reminder Application
// Tauri Backend with Timer Engine, Idle Detection, Notifications, and Settings

mod core;
mod commands;

use std::sync::Arc;
use tokio::sync::Mutex;

use core::{TimerEngine, IdleMonitor, NotificationManager};
use commands::{
    // Timer commands
    timer_start,
    timer_pause,
    timer_resume,
    timer_reset,
    timer_get_state,
    timer_skip_to_break,
    timer_acknowledge_break,
    timer_update_settings,
    timer_get_settings,
    TimerEngineState,
    // Idle commands
    idle_start_monitoring,
    idle_stop_monitoring,
    idle_get_state,
    idle_check_once,
    idle_get_settings,
    idle_update_settings,
    IdleMonitorState,
    // Tray commands
    tray_get_info,
    tray_trigger_break,
    tray_show_overlay,
    notification_acknowledge,
    hide_window,
    show_window,
    NotificationManagerState,
    // Settings commands
    settings_load,
    settings_save,
    settings_reset,
    // Escalation commands
    escalation_snooze,
    escalation_acknowledge,
    escalation_set_max_snoozes,
    escalation_get_state,
    // Stats commands
    stats_record_break,
    stats_record_snooze,
    stats_get_today,
    stats_get_all_time,
    stats_add_work_time,
    stats_initialize,
    // Notification commands
    send_native_notification,
};

use tauri::Manager;
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Khởi tạo states
    let timer_engine: TimerEngineState = Arc::new(Mutex::new(TimerEngine::new()));
    let idle_monitor: IdleMonitorState = Arc::new(Mutex::new(IdleMonitor::new()));
    let notification_manager: NotificationManagerState = Arc::new(Mutex::new(NotificationManager::new()));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(timer_engine)
        .manage(idle_monitor)
        .manage(notification_manager)
        .setup(|app| {
            // Apply vibrancy effect on macOS
            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                
                let window = app.get_webview_window("main").unwrap();
                // Use Sidebar material for a more colorful, less white appearance
                apply_vibrancy(&window, NSVisualEffectMaterial::Sidebar, None, Some(16.0))
                    .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
            }

            // Setup system tray
            #[cfg(desktop)]
            {
                use tauri::menu::{MenuBuilder, MenuItemBuilder};
                use tauri::tray::TrayIconBuilder;

                // Create menu items
                let show_item = MenuItemBuilder::with_id("show", "🪵 Show Lumbar")
                    .build(app)?;
                let take_break_item = MenuItemBuilder::with_id("take_break", "☕ Take Break Now")
                    .build(app)?;
                let quit_item = MenuItemBuilder::with_id("quit", "❌ Quit")
                    .build(app)?;

                // Build menu
                let menu = MenuBuilder::new(app)
                    .item(&show_item)
                    .item(&take_break_item)
                    .separator()
                    .item(&quit_item)
                    .build()?;

                // Build tray with default icon first, then set custom icon
                let _tray = TrayIconBuilder::new()
                    .icon(app.default_window_icon().cloned().unwrap())
                    .menu(&menu)
                    .tooltip("Lumbar - Break Reminder")
                    .on_menu_event(|app: &tauri::AppHandle, event: tauri::menu::MenuEvent| {
                        match event.id().as_ref() {
                            "show" => {
                                if let Some(window) = app.get_webview_window("main") {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                            "take_break" => {
                                let _ = app.emit("tray:take_break", ());
                            }
                            "quit" => {
                                app.exit(0);
                            }
                            _ => {}
                        }
                    })
                    .on_tray_icon_event(|tray: &tauri::tray::TrayIcon, event: tauri::tray::TrayIconEvent| {
                        use tauri::tray::TrayIconEvent;
                        if let TrayIconEvent::Click { button: tauri::tray::MouseButton::Left, .. } = event {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    })
                    .build(app)?;

                println!("✅ Tray icon initialized");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Timer commands
            timer_start,
            timer_pause,
            timer_resume,
            timer_reset,
            timer_get_state,
            timer_skip_to_break,
            timer_acknowledge_break,
            timer_update_settings,
            timer_get_settings,
            // Idle commands
            idle_start_monitoring,
            idle_stop_monitoring,
            idle_get_state,
            idle_check_once,
            idle_get_settings,
            idle_update_settings,
            // Tray commands
            tray_get_info,
            tray_trigger_break,
            tray_show_overlay,
            notification_acknowledge,
            hide_window,
            show_window,
            // Settings commands
            settings_load,
            settings_save,
            settings_reset,
            // Escalation commands
            escalation_snooze,
            escalation_acknowledge,
            escalation_set_max_snoozes,
            escalation_get_state,
            // Stats commands
            stats_record_break,
            stats_record_snooze,
            stats_get_today,
            stats_get_all_time,
            stats_add_work_time,
            stats_initialize,
            // Notification commands
            send_native_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
