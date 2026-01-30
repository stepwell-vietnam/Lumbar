// Native notification command using osascript (macOS native)
use std::process::Command;

#[tauri::command]
pub async fn send_native_notification(
    title: String,
    body: String,
) -> Result<(), String> {
    // Use osascript to show macOS notification (bypasses Tauri plugin issues)
    let script = format!(
        "display notification \"{}\" with title \"{}\" sound name \"Glass\"",
        body.replace("\"", "\\\""),
        title.replace("\"", "\\\"")
    );
    
    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute osascript: {}", e))?;
    
    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("osascript failed: {}", stderr))
    }
}

