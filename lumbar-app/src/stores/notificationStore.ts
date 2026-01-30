import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useMascotStore } from './mascotStore';

// Check if running in Tauri (v2 uses __TAURI_INTERNALS__, v1 used __TAURI__)
const isTauri = typeof window !== 'undefined' && (
    '__TAURI_INTERNALS__' in window || '__TAURI__' in window
);

export type NotificationLevel = 'hint' | 'toast' | 'overlay';

export interface NotificationPayload {
    level: NotificationLevel;
    title: string;
    message: string;
    timer_type: string;
}

interface NotificationState {
    // State
    isOverlayVisible: boolean;
    currentPayload: NotificationPayload | null;
    snoozeCount: number;
    maxSnooze: number;
    isInitialized: boolean;
    snoozeTimeoutId: number | null;

    // Actions
    initialize: () => Promise<void>;
    showOverlay: (payload: NotificationPayload) => void;
    hideOverlay: () => void;
    snooze: (minutes: number) => Promise<void>;
    takeBreak: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    // Initial state
    isOverlayVisible: false,
    currentPayload: null,
    snoozeCount: 0,
    maxSnooze: 3,
    isInitialized: false,
    snoozeTimeoutId: null,

    // Initialize listeners
    initialize: async () => {
        if (get().isInitialized) return;

        if (isTauri) {
            try {
                // Listen for overlay event
                await listen<NotificationPayload>('notification:overlay', (event) => {
                    console.log('📢 Received overlay notification:', event.payload);
                    get().showOverlay(event.payload);
                });

                // Listen for hint event (for tray icon updates)
                await listen<NotificationPayload>('notification:hint', (event) => {
                    console.log('💡 Received hint notification:', event.payload);
                });

                // Listen for toast event
                await listen<NotificationPayload>('notification:toast', (event) => {
                    console.log('🔔 Received toast notification:', event.payload);
                });

                // Listen for timer:break event to trigger overlay
                await listen<{ timer_type: string; is_break_time: boolean }>('timer:break', (event) => {
                    console.log('⏰ Timer break event:', event.payload);
                    if (event.payload.is_break_time) {
                        // Set mascot to neutral (will be updated by snooze/takeBreak)
                        useMascotStore.getState().setNeutral();

                        const title = event.payload.timer_type === 'micro_break'
                            ? 'Nghỉ mắt thôi!'
                            : 'Đứng dậy vận động!';
                        get().showOverlay({
                            level: 'overlay',
                            title,
                            message: 'Hãy chăm sóc sức khỏe của bạn',
                            timer_type: event.payload.timer_type,
                        });
                    }
                });

                console.log('✅ Notification store initialized');
            } catch (error) {
                console.error('Failed to initialize notification store:', error);
            }
        } else {
            console.log('🌐 Notification store: browser mode - limited functionality');
        }

        set({ isInitialized: true });
    },

    // Show overlay
    showOverlay: (payload: NotificationPayload) => {
        console.log('📢 showOverlay called with payload:', payload);
        console.log('🔍 isTauri check:', isTauri, '| __TAURI_INTERNALS__:', typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window, '| __TAURI__:', typeof window !== 'undefined' && '__TAURI__' in window);

        set({
            isOverlayVisible: true,
            currentPayload: payload,
        });

        // Also send macOS system notification using osascript (via Rust backend)
        if (isTauri) {
            console.log('🎯 isTauri is true, attempting to send notification via Rust backend...');
            import('@tauri-apps/api/core').then(async ({ invoke }) => {
                console.log('📦 Tauri core loaded, calling send_native_notification...');
                try {
                    await invoke('send_native_notification', {
                        title: payload.title,
                        body: payload.message,
                    });
                    console.log('🔔 ✅ System notification sent via osascript');
                } catch (e) {
                    console.error('❌ Failed to send system notification:', e);
                }
            }).catch(e => {
                console.error('❌ Failed to import @tauri-apps/api/core:', e);
            });
        } else {
            console.log('🌐 Browser mode detected, skipping system notification');
        }
    },

    // Hide overlay
    hideOverlay: () => {
        set({
            isOverlayVisible: false,
            currentPayload: null,
        });
    },

    // Snooze action with timer
    snooze: async (minutes: number) => {
        const { snoozeCount, maxSnooze, snoozeTimeoutId } = get();

        if (snoozeCount >= maxSnooze) {
            console.warn('⚠️ Max snooze limit reached!');
            return;
        }

        // Clear previous timeout if exists
        if (snoozeTimeoutId) {
            clearTimeout(snoozeTimeoutId);
        }

        const newSnoozeCount = snoozeCount + 1;
        set({ snoozeCount: newSnoozeCount });

        // Update mascot state based on snooze count
        const mascotStore = useMascotStore.getState();
        mascotStore.incrementSnoozeCount();

        get().hideOverlay();

        // Set timeout to show overlay again after X minutes
        const timeoutId = window.setTimeout(() => {
            console.log('⏰ Snooze ended, showing overlay again');
            get().showOverlay({
                level: 'overlay',
                title: 'Vẫn chưa nghỉ à?',
                message: `Đã snooze ${newSnoozeCount} lần rồi đấy!`,
                timer_type: 'micro_break',
            });
        }, minutes * 60 * 1000);

        set({ snoozeTimeoutId: timeoutId });
        console.log(`⏸️ Snoozed for ${minutes} minutes. Count: ${newSnoozeCount}/${maxSnooze}`);
    },

    // Take break action
    takeBreak: async () => {
        const { snoozeTimeoutId } = get();

        // Clear any pending snooze timeout
        if (snoozeTimeoutId) {
            clearTimeout(snoozeTimeoutId);
            set({ snoozeTimeoutId: null });
        }

        set({ snoozeCount: 0 }); // Reset snooze count

        // Update mascot to happy and reset snooze count
        const mascotStore = useMascotStore.getState();
        mascotStore.resetSnoozeCount();
        mascotStore.setHappy();

        get().hideOverlay();

        // Notify backend
        if (isTauri) {
            try {
                await invoke('notification_acknowledge');
                // Also acknowledge break in timer to restart cycle
                await invoke('timer_acknowledge_break');
                console.log('✅ Break taken, timer restarted');
            } catch (err) {
                console.error('Failed to acknowledge break:', err);
            }
        }

        console.log('✅ Break taken, snooze count reset, mascot happy');
    },
}));
