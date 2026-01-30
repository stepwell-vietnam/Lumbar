import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Check if running in Tauri context
const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

// Types matching Rust structs
export type TimerType = 'micro_break' | 'rest_break';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'break';

export interface TimerState {
    status: TimerStatus;
    timer_type: TimerType;
    remaining_seconds: number;
    total_seconds: number;
    is_break_time: boolean;
}

export interface TimerSettings {
    micro_break_interval: number;
    micro_break_duration: number;
    rest_break_interval: number;
    rest_break_duration: number;
}

interface TimerStore {
    // State
    state: TimerState;
    settings: TimerSettings;
    isInitialized: boolean;
    _mockTimerId: ReturnType<typeof setInterval> | null;

    // Actions
    initialize: () => Promise<void>;
    start: (timerType: TimerType) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    reset: () => Promise<void>;
    skipToBreak: () => Promise<void>;
    acknowledgeBreak: () => Promise<void>;
    updateSettings: (settings: TimerSettings) => Promise<void>;
    _startMockTimer: () => void;
    _stopMockTimer: () => void;
}

const defaultState: TimerState = {
    status: 'idle',
    timer_type: 'micro_break',
    remaining_seconds: 20 * 60,
    total_seconds: 20 * 60,
    is_break_time: false,
};

const defaultSettings: TimerSettings = {
    micro_break_interval: 20 * 60,
    micro_break_duration: 20,
    rest_break_interval: 60 * 60,
    rest_break_duration: 5 * 60,
};

export const useTimerStore = create<TimerStore>((set, get) => ({
    state: defaultState,
    settings: defaultSettings,
    isInitialized: false,
    _mockTimerId: null,

    // Internal: Start mock timer for browser dev mode
    _startMockTimer: () => {
        get()._stopMockTimer(); // Clear existing timer

        const timerId = setInterval(() => {
            const currentState = get().state;
            if (currentState.status !== 'running' && currentState.status !== 'break') {
                return;
            }

            if (currentState.remaining_seconds > 0) {
                set({
                    state: {
                        ...currentState,
                        remaining_seconds: currentState.remaining_seconds - 1
                    }
                });
            } else {
                // Time's up - handle break/work transition
                const settings = get().settings;
                if (currentState.is_break_time) {
                    // Break done → back to work
                    const interval = currentState.timer_type === 'micro_break'
                        ? settings.micro_break_interval
                        : settings.rest_break_interval;
                    set({
                        state: {
                            ...currentState,
                            remaining_seconds: interval,
                            total_seconds: interval,
                            is_break_time: false,
                            status: 'running'
                        }
                    });
                } else {
                    // Work done → start break
                    const duration = currentState.timer_type === 'micro_break'
                        ? settings.micro_break_duration
                        : settings.rest_break_duration;
                    set({
                        state: {
                            ...currentState,
                            remaining_seconds: duration,
                            total_seconds: duration,
                            is_break_time: true,
                            status: 'break'
                        }
                    });
                }
            }
        }, 1000);

        set({ _mockTimerId: timerId });
    },

    // Internal: Stop mock timer
    _stopMockTimer: () => {
        const timerId = get()._mockTimerId;
        if (timerId) {
            clearInterval(timerId);
            set({ _mockTimerId: null });
        }
    },

    initialize: async () => {
        if (get().isInitialized) return;

        if (isTauri) {
            try {
                // Get initial state from Rust
                const state = await invoke<TimerState>('timer_get_state');
                const settings = await invoke<TimerSettings>('timer_get_settings');

                set({ state, settings, isInitialized: true });

                // Listen for tick events
                await listen<TimerState>('timer:tick', (event) => {
                    set({ state: event.payload });
                });

                // Listen for break events
                await listen<TimerState>('timer:break', (event) => {
                    set({ state: event.payload });
                });

                // Listen for work resumed events
                await listen<TimerState>('timer:work_resumed', (event) => {
                    set({ state: event.payload });
                });

                // Listen for idle events to auto-pause/resume
                await listen<{ status: string }>('idle:became_idle', async () => {
                    const currentState = get().state;
                    if (currentState.status === 'running') {
                        console.log('⏸️ Auto-pausing timer due to idle');
                        await get().pause();
                    }
                });

                await listen<{ status: string }>('idle:became_active', async () => {
                    const currentState = get().state;
                    if (currentState.status === 'paused') {
                        console.log('▶️ Auto-resuming timer - user is back');
                        await get().resume();
                    }
                });
            } catch (error) {
                console.error('Failed to initialize timer:', error);
            }
        } else {
            // Browser mode - use defaults
            console.log('🌐 Running in browser mode - using mock timer');
            set({ isInitialized: true });
        }
    },

    start: async (timerType: TimerType) => {
        const settings = get().settings;
        const totalSeconds = timerType === 'micro_break'
            ? settings.micro_break_interval
            : settings.rest_break_interval;

        if (isTauri) {
            try {
                const state = await invoke<TimerState>('timer_start', { timerType });
                set({ state });
            } catch (error) {
                console.error('Failed to start timer:', error);
            }
        } else {
            // Mock timer for browser
            set({
                state: {
                    status: 'running',
                    timer_type: timerType,
                    remaining_seconds: totalSeconds,
                    total_seconds: totalSeconds,
                    is_break_time: false
                }
            });
            get()._startMockTimer();
        }
    },

    pause: async () => {
        if (isTauri) {
            try {
                const state = await invoke<TimerState>('timer_pause');
                set({ state });
            } catch (error) {
                console.error('Failed to pause timer:', error);
            }
        } else {
            // Mock pause
            get()._stopMockTimer();
            set({
                state: {
                    ...get().state,
                    status: 'paused'
                }
            });
        }
    },

    resume: async () => {
        if (isTauri) {
            try {
                const state = await invoke<TimerState>('timer_resume');
                set({ state });
            } catch (error) {
                console.error('Failed to resume timer:', error);
            }
        } else {
            // Mock resume
            set({
                state: {
                    ...get().state,
                    status: 'running'
                }
            });
            get()._startMockTimer();
        }
    },

    reset: async () => {
        if (isTauri) {
            try {
                const state = await invoke<TimerState>('timer_reset');
                set({ state });
            } catch (error) {
                console.error('Failed to reset timer:', error);
            }
        } else {
            // Mock reset
            get()._stopMockTimer();
            set({ state: defaultState });
        }
    },

    skipToBreak: async () => {
        const settings = get().settings;
        const currentState = get().state;
        const duration = currentState.timer_type === 'micro_break'
            ? settings.micro_break_duration
            : settings.rest_break_duration;

        if (isTauri) {
            try {
                const state = await invoke<TimerState>('timer_skip_to_break');
                set({ state });
            } catch (error) {
                console.error('Failed to skip to break:', error);
            }
        } else {
            // Mock skip to break
            set({
                state: {
                    ...currentState,
                    remaining_seconds: duration,
                    total_seconds: duration,
                    is_break_time: true,
                    status: 'break'
                }
            });
        }
    },

    acknowledgeBreak: async () => {
        const settings = get().settings;
        const currentState = get().state;
        const interval = currentState.timer_type === 'micro_break'
            ? settings.micro_break_interval
            : settings.rest_break_interval;

        if (isTauri) {
            try {
                const state = await invoke<TimerState>('timer_acknowledge_break');
                set({ state });
            } catch (error) {
                console.error('Failed to acknowledge break:', error);
            }
        } else {
            // Mock acknowledge
            set({
                state: {
                    ...currentState,
                    remaining_seconds: interval,
                    total_seconds: interval,
                    is_break_time: false,
                    status: 'running'
                }
            });
            get()._startMockTimer();
        }
    },

    updateSettings: async (settings: TimerSettings) => {
        if (isTauri) {
            try {
                await invoke('timer_update_settings', { settings });
                set({ settings });
            } catch (error) {
                console.error('Failed to update settings:', error);
            }
        } else {
            // Mock update
            set({ settings });
        }
    },
}));
