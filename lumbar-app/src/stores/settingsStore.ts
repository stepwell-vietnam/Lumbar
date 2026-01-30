import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { useTimerStore } from './timerStore';

const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

// Types matching Rust structs
export interface TimerSettingsConfig {
    micro_break_interval_min: number;
    micro_break_duration_sec: number;
    rest_break_interval_min: number;
    rest_break_duration_min: number;
}

export interface NotificationSettingsConfig {
    sound_enabled: boolean;
    notification_level: number;
    snooze_limit: number;
}

export interface GeneralSettingsConfig {
    language: string;
    theme: string;
    start_with_os: boolean;
    idle_threshold_min: number;
}

export interface AppSettings {
    timer: TimerSettingsConfig;
    notification: NotificationSettingsConfig;
    general: GeneralSettingsConfig;
}

// Default values
const defaultSettings: AppSettings = {
    timer: {
        micro_break_interval_min: 20,
        micro_break_duration_sec: 20,
        rest_break_interval_min: 60,
        rest_break_duration_min: 5,
    },
    notification: {
        sound_enabled: true,
        notification_level: 3,
        snooze_limit: 3,
    },
    general: {
        language: 'system',
        theme: 'system',
        start_with_os: true,
        idle_threshold_min: 2,
    },
};

interface SettingsState {
    settings: AppSettings;
    isLoading: boolean;
    isDirty: boolean;
    isInitialized: boolean;
    _saveTimeoutId: ReturnType<typeof setTimeout> | null;

    // Actions
    initialize: () => Promise<void>;
    updateTimer: (timer: Partial<TimerSettingsConfig>) => void;
    updateNotification: (notification: Partial<NotificationSettingsConfig>) => void;
    updateGeneral: (general: Partial<GeneralSettingsConfig>) => void;
    save: () => Promise<void>;
    reset: () => Promise<void>;
    _debouncedSave: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: defaultSettings,
    isLoading: true,
    isDirty: false,
    isInitialized: false,
    _saveTimeoutId: null,

    // Debounced save - waits 500ms before saving
    _debouncedSave: () => {
        const existingTimeout = get()._saveTimeoutId;
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        const timeoutId = setTimeout(async () => {
            await get().save();
            console.log('📦 Settings auto-saved');
        }, 500);

        set({ _saveTimeoutId: timeoutId });
    },

    // Load settings từ backend
    initialize: async () => {
        if (get().isInitialized) return;

        if (!isTauri) {
            console.log('🌐 Settings store: browser mode - using defaults');
            set({ isLoading: false, isInitialized: true });
            return;
        }

        try {
            const settings = await invoke<AppSettings>('settings_load');
            set({ settings, isLoading: false, isInitialized: true });
            console.log('✅ Settings loaded:', settings);

            // Apply loaded settings to timer and idle backends
            const { timer, general } = settings;
            await invoke('timer_update_settings', {
                settings: {
                    micro_break_interval: timer.micro_break_interval_min * 60,
                    micro_break_duration: timer.micro_break_duration_sec,
                    rest_break_interval: timer.rest_break_interval_min * 60,
                    rest_break_duration: timer.rest_break_duration_min * 60,
                }
            });
            await invoke('idle_update_settings', {
                settings: {
                    idle_threshold_seconds: general.idle_threshold_min * 60,
                    enabled: true,
                }
            });
            console.log('✅ Settings applied to timer and idle backends');
        } catch (err) {
            console.error('Failed to load settings:', err);
            set({ isLoading: false, isInitialized: true });
        }
    },

    // Update timer settings (partial) - auto-saves with debounce
    updateTimer: (timerUpdate) => {
        set((state) => ({
            settings: {
                ...state.settings,
                timer: { ...state.settings.timer, ...timerUpdate },
            },
            isDirty: true,
        }));

        // Auto-save with 300ms debounce
        get()._debouncedSave();
    },

    // Update notification settings (partial)
    updateNotification: (notificationUpdate) => {
        set((state) => ({
            settings: {
                ...state.settings,
                notification: { ...state.settings.notification, ...notificationUpdate },
            },
            isDirty: true,
        }));

        // Auto-save with debounce
        get()._debouncedSave();
    },

    // Update general settings (partial)
    updateGeneral: (generalUpdate) => {
        set((state) => ({
            settings: {
                ...state.settings,
                general: { ...state.settings.general, ...generalUpdate },
            },
            isDirty: true,
        }));

        // Auto-save with debounce
        get()._debouncedSave();
    },

    // Save settings to backend and apply to engines
    save: async () => {
        if (!isTauri) {
            console.log('🌐 Settings save: browser mode - skipped');
            set({ isDirty: false });
            return;
        }

        try {
            const settings = get().settings;

            // 1. Save to file
            await invoke('settings_save', { settings });

            // 2. Apply timer settings to backend
            const timerSettings = {
                micro_break_interval: settings.timer.micro_break_interval_min * 60,
                micro_break_duration: settings.timer.micro_break_duration_sec,
                rest_break_interval: settings.timer.rest_break_interval_min * 60,
                rest_break_duration: settings.timer.rest_break_duration_min * 60,
            };
            await invoke('timer_update_settings', { settings: timerSettings });

            // 2b. Sync frontend timerStore
            useTimerStore.getState().updateSettings(timerSettings);

            // 3. Apply idle settings
            await invoke('idle_update_settings', {
                settings: {
                    idle_threshold_seconds: settings.general.idle_threshold_min * 60,
                    enabled: true,
                }
            });

            set({ isDirty: false });
            console.log('✅ Settings saved and applied');
        } catch (err) {
            console.error('Failed to save settings:', err);
            throw err;
        }
    },

    // Reset to defaults
    reset: async () => {
        if (!isTauri) {
            set({ settings: defaultSettings, isDirty: false });
            return;
        }

        try {
            const settings = await invoke<AppSettings>('settings_reset');
            set({ settings, isDirty: false });

            // Apply reset settings to backends
            await invoke('timer_update_settings', {
                settings: {
                    micro_break_interval: settings.timer.micro_break_interval_min * 60,
                    micro_break_duration: settings.timer.micro_break_duration_sec,
                    rest_break_interval: settings.timer.rest_break_interval_min * 60,
                    rest_break_duration: settings.timer.rest_break_duration_min * 60,
                }
            });
            await invoke('idle_update_settings', {
                settings: {
                    idle_threshold_seconds: settings.general.idle_threshold_min * 60,
                    enabled: true,
                }
            });

            console.log('✅ Settings reset to defaults and applied');
        } catch (err) {
            console.error('Failed to reset settings:', err);
        }
    },
}));
