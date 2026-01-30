use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU32, Ordering};
use tauri::command;

// Static state for snooze tracking
static SNOOZE_COUNT: AtomicU32 = AtomicU32::new(0);
static MAX_SNOOZES: AtomicU32 = AtomicU32::new(3);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SnoozeResult {
    pub success: bool,
    pub snooze_count: u32,
    pub remaining_snoozes: u32,
    pub next_snooze_minutes: u32,
}

/// Snooze the current break notification
/// Returns SnoozeResult with current state
#[command]
pub async fn escalation_snooze(minutes: u32) -> Result<SnoozeResult, String> {
    let current_count = SNOOZE_COUNT.fetch_add(1, Ordering::SeqCst);
    let max = MAX_SNOOZES.load(Ordering::SeqCst);
    
    if current_count >= max {
        // Reset count but deny snooze
        SNOOZE_COUNT.store(max, Ordering::SeqCst);
        return Ok(SnoozeResult {
            success: false,
            snooze_count: max,
            remaining_snoozes: 0,
            next_snooze_minutes: 0,
        });
    }
    
    let new_count = current_count + 1;
    let remaining = max.saturating_sub(new_count);
    
    // Calculate next snooze minutes (decreasing)
    let next_minutes = match new_count {
        1 => 5,
        2 => 3,
        _ => 1,
    };
    
    println!("✅ Escalation: Snooze #{} for {} minutes. Remaining: {}", new_count, minutes, remaining);
    
    Ok(SnoozeResult {
        success: true,
        snooze_count: new_count,
        remaining_snoozes: remaining,
        next_snooze_minutes: next_minutes,
    })
}

/// Acknowledge break (user took the break)
/// Resets snooze counter
#[command]
pub async fn escalation_acknowledge() -> Result<(), String> {
    SNOOZE_COUNT.store(0, Ordering::SeqCst);
    println!("✅ Escalation: Break acknowledged, snooze counter reset");
    Ok(())
}

/// Set maximum snoozes allowed
#[command]
pub async fn escalation_set_max_snoozes(max: u32) -> Result<(), String> {
    MAX_SNOOZES.store(max, Ordering::SeqCst);
    println!("✅ Escalation: Max snoozes set to {}", max);
    Ok(())
}

/// Get current snooze state
#[command]
pub async fn escalation_get_state() -> Result<SnoozeResult, String> {
    let count = SNOOZE_COUNT.load(Ordering::SeqCst);
    let max = MAX_SNOOZES.load(Ordering::SeqCst);
    let remaining = max.saturating_sub(count);
    
    Ok(SnoozeResult {
        success: remaining > 0,
        snooze_count: count,
        remaining_snoozes: remaining,
        next_snooze_minutes: if remaining > 0 { 5 } else { 0 },
    })
}
