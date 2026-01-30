// Stats Commands with Persistent Storage using tauri-plugin-store
use chrono::Local;
use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Runtime};
use tauri_plugin_store::StoreExt;

const STATS_STORE: &str = "stats.json";

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct StatsData {
    // Daily stats
    pub today_breaks_completed: u32,
    pub today_breaks_missed: u32,
    pub today_snooze_count: u32,
    pub today_work_minutes: u32,
    pub today_break_minutes: u32,
    pub today_date: Option<String>,
    
    // All-time stats
    pub total_breaks: u32,
    pub total_snoozes: u32,
    pub current_streak: u32,
    pub longest_streak: u32,
    pub total_work_hours: u32,
    pub first_use_date: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DailyStats {
    pub date: String,
    pub breaks_completed: u32,
    pub breaks_missed: u32,
    pub snooze_count: u32,
    pub total_work_minutes: u32,
    pub total_break_minutes: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AllTimeStats {
    pub total_breaks: u32,
    pub total_snoozes: u32,
    pub current_streak: u32,
    pub longest_streak: u32,
    pub total_work_hours: u32,
    pub first_use_date: String,
}

impl StatsData {
    fn check_new_day(&mut self) {
        let today = Local::now().format("%Y-%m-%d").to_string();
        if self.today_date.as_ref() != Some(&today) {
            // New day - handle streak
            if self.today_date.is_some() && self.today_breaks_completed > 0 {
                // Previous day had breaks - increment streak
                self.current_streak += 1;
                if self.current_streak > self.longest_streak {
                    self.longest_streak = self.current_streak;
                }
            } else if self.today_date.is_some() {
                // Previous day had no breaks - reset streak
                self.current_streak = 0;
            }
            
            // Reset daily stats
            self.today_breaks_completed = 0;
            self.today_breaks_missed = 0;
            self.today_snooze_count = 0;
            self.today_work_minutes = 0;
            self.today_break_minutes = 0;
            self.today_date = Some(today.clone());
            
            if self.first_use_date.is_none() {
                self.first_use_date = Some(today);
            }
        }
    }
}

/// Load stats from store
fn load_stats<R: Runtime>(app: &AppHandle<R>) -> StatsData {
    let store = app.store(STATS_STORE).ok();
    
    if let Some(store) = store {
        if let Some(data) = store.get("stats") {
            if let Ok(stats) = serde_json::from_value::<StatsData>(data.clone()) {
                println!("📊 Stats loaded from store");
                return stats;
            }
        }
    }
    
    println!("📊 No saved stats, using defaults");
    StatsData::default()
}

/// Save stats to store
fn save_stats<R: Runtime>(app: &AppHandle<R>, stats: &StatsData) {
    if let Ok(store) = app.store(STATS_STORE) {
        if let Ok(value) = serde_json::to_value(stats) {
            let _ = store.set("stats", value);
            let _ = store.save();
            println!("💾 Stats saved to store");
        }
    }
}

/// Record a break (completed or missed)
#[command]
pub async fn stats_record_break<R: Runtime>(app: AppHandle<R>, completed: bool) -> Result<(), String> {
    let mut stats = load_stats(&app);
    stats.check_new_day();
    
    if completed {
        stats.today_breaks_completed += 1;
        stats.total_breaks += 1;
        stats.today_break_minutes += 20;
        println!("✅ Stats: Break completed. Today: {}, Total: {}", 
            stats.today_breaks_completed, stats.total_breaks);
    } else {
        stats.today_breaks_missed += 1;
        println!("⚠️ Stats: Break missed. Today missed: {}", stats.today_breaks_missed);
    }
    
    save_stats(&app, &stats);
    Ok(())
}

/// Record a snooze
#[command]
pub async fn stats_record_snooze<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let mut stats = load_stats(&app);
    stats.check_new_day();
    
    stats.today_snooze_count += 1;
    stats.total_snoozes += 1;
    
    println!("⏸️ Stats: Snooze recorded. Today: {}, Total: {}", 
        stats.today_snooze_count, stats.total_snoozes);
    
    save_stats(&app, &stats);
    Ok(())
}

/// Get today's stats
#[command]
pub async fn stats_get_today<R: Runtime>(app: AppHandle<R>) -> Result<DailyStats, String> {
    let mut stats = load_stats(&app);
    stats.check_new_day();
    
    // Save if day changed
    save_stats(&app, &stats);
    
    Ok(DailyStats {
        date: stats.today_date.clone().unwrap_or_else(|| Local::now().format("%Y-%m-%d").to_string()),
        breaks_completed: stats.today_breaks_completed,
        breaks_missed: stats.today_breaks_missed,
        snooze_count: stats.today_snooze_count,
        total_work_minutes: stats.today_work_minutes,
        total_break_minutes: stats.today_break_minutes,
    })
}

/// Get all-time stats
#[command]
pub async fn stats_get_all_time<R: Runtime>(app: AppHandle<R>) -> Result<AllTimeStats, String> {
    let stats = load_stats(&app);
    
    Ok(AllTimeStats {
        total_breaks: stats.total_breaks,
        total_snoozes: stats.total_snoozes,
        current_streak: stats.current_streak,
        longest_streak: stats.longest_streak,
        total_work_hours: stats.total_work_hours,
        first_use_date: stats.first_use_date.clone().unwrap_or_else(|| Local::now().format("%Y-%m-%d").to_string()),
    })
}

/// Add work minutes
#[command]
pub async fn stats_add_work_time<R: Runtime>(app: AppHandle<R>, minutes: u32) -> Result<(), String> {
    let mut stats = load_stats(&app);
    stats.check_new_day();
    
    stats.today_work_minutes += minutes;
    stats.total_work_hours = (stats.total_work_hours * 60 + minutes) / 60;
    
    save_stats(&app, &stats);
    Ok(())
}

/// Initialize stats on app startup
#[command]
pub async fn stats_initialize<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let mut stats = load_stats(&app);
    stats.check_new_day();
    save_stats(&app, &stats);
    
    println!("📊 Stats initialized: {} total breaks, {} day streak", 
        stats.total_breaks, stats.current_streak);
    Ok(())
}
