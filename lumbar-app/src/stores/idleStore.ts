import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useMascotStore } from './mascotStore';

// Check if running in Tauri context
const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

export type IdleStatus = 'active' | 'idle';

export interface IdleState {
    status: IdleStatus;
    idle_seconds: number;
    threshold_seconds: number;
    last_activity_timestamp: number;
}

export interface IdleSettings {
    enabled: boolean;
    threshold_seconds: number;
    auto_pause_timer: boolean;
    auto_resume_timer: boolean;
}

interface IdleStore {
    // State
    state: IdleState;
    settings: IdleSettings;
    isMonitoring: boolean;
    isInitialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    startMonitoring: () => Promise<void>;
    stopMonitoring: () => Promise<void>;
    checkOnce: () => Promise<IdleState>;
    updateSettings: (settings: IdleSettings) => Promise<void>;
}

const defaultState: IdleState = {
    status: 'active',
    idle_seconds: 0,
    threshold_seconds: 10, // 10s for testing
    last_activity_timestamp: 0,
};

const defaultSettings: IdleSettings = {
    enabled: true,
    threshold_seconds: 10, // 10s for testing
    auto_pause_timer: true,
    auto_resume_timer: true,
};

export const useIdleStore = create<IdleStore>((set, get) => ({
    state: defaultState,
    settings: defaultSettings,
    isMonitoring: false,
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;

        if (isTauri) {
            try {
                // Get initial settings
                const settings = await invoke<IdleSettings>('idle_get_settings');
                set({ settings, isInitialized: true });

                // Listen for idle events
                await listen<IdleState>('idle:status', (event) => {
                    set({ state: event.payload });
                });

                await listen<IdleState>('idle:became_idle', (event) => {
                    set({ state: event.payload });
                    // Update mascot to sleeping
                    useMascotStore.getState().setSleeping();
                    console.log('🌙 User became idle - mascot sleeping', event.payload);
                });

                await listen<IdleState>('idle:became_active', (event) => {
                    const prevState = get().state;
                    set({ state: event.payload });
                    // Update mascot to neutral (wake up from sleep)
                    if (prevState.status === 'idle') {
                        useMascotStore.getState().setNeutral();
                    }
                    console.log('⚡ User became active - mascot neutral', event.payload);
                });
            } catch (error) {
                console.error('Failed to initialize idle store:', error);
            }
        } else {
            // Browser mode - use defaults, idle detection not available
            console.log('🌐 Running in browser mode - idle detection disabled');
            set({ isInitialized: true });
        }
    },

    startMonitoring: async () => {
        if (isTauri) {
            try {
                await invoke('idle_start_monitoring');
                set({ isMonitoring: true });
            } catch (error) {
                console.error('Failed to start idle monitoring:', error);
            }
        } else {
            // Browser mode - no-op
            console.log('🌐 Idle monitoring not available in browser mode');
            set({ isMonitoring: false });
        }
    },

    stopMonitoring: async () => {
        if (isTauri) {
            try {
                await invoke('idle_stop_monitoring');
                set({ isMonitoring: false });
            } catch (error) {
                console.error('Failed to stop idle monitoring:', error);
            }
        } else {
            set({ isMonitoring: false });
        }
    },

    checkOnce: async () => {
        if (isTauri) {
            try {
                const state = await invoke<IdleState>('idle_check_once');
                set({ state });
                return state;
            } catch (error) {
                console.error('Failed to check idle:', error);
                return get().state;
            }
        } else {
            // Browser mode - always active
            return get().state;
        }
    },

    updateSettings: async (settings: IdleSettings) => {
        if (isTauri) {
            try {
                await invoke('idle_update_settings', { settings });
                set({ settings });
            } catch (error) {
                console.error('Failed to update idle settings:', error);
            }
        } else {
            // Browser mode - just update local state
            set({ settings });
        }
    },
}));
