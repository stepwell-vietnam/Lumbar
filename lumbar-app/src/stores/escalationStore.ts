import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useMascotStore } from './mascotStore';

export type NotificationLevel = 'hint' | 'toast' | 'overlay';

interface EscalationPayload {
    level: NotificationLevel;
    snooze_count: number;
    can_snooze: boolean;
}

interface EscalationState {
    currentLevel: NotificationLevel | null;
    snoozeCount: number;
    canSnooze: boolean;
    maxSnooze: number;
    isInitialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    handleHint: (payload: EscalationPayload) => void;
    handleToast: (payload: EscalationPayload) => void;
    handleOverlay: (payload: EscalationPayload) => void;
    snooze: (minutes: number) => Promise<boolean>;
    acknowledge: () => Promise<void>;
}

// Detect if running in Tauri
const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

export const useEscalationStore = create<EscalationState>((set, get) => ({
    currentLevel: null,
    snoozeCount: 0,
    canSnooze: true,
    maxSnooze: 3,
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;

        if (isTauri) {
            // Listen for escalation events
            await listen<EscalationPayload>('notification:hint', (event) => {
                get().handleHint(event.payload);
            });

            await listen<EscalationPayload>('notification:toast', (event) => {
                get().handleToast(event.payload);
            });

            await listen<EscalationPayload>('notification:overlay', (event) => {
                get().handleOverlay(event.payload);
            });

            console.log('✅ Escalation store initialized');
        } else {
            console.log('🌐 Escalation store: browser mode');
        }

        set({ isInitialized: true });
    },

    handleHint: (payload) => {
        console.log('🟡 Level 1: Hint notification');
        set({
            currentLevel: 'hint',
            snoozeCount: payload.snooze_count,
            canSnooze: payload.can_snooze,
        });
    },

    handleToast: (payload) => {
        console.log('🟠 Level 2: Toast notification');
        set({
            currentLevel: 'toast',
            snoozeCount: payload.snooze_count,
            canSnooze: payload.can_snooze,
        });
    },

    handleOverlay: (payload) => {
        console.log('🔴 Level 3: Overlay notification');
        set({
            currentLevel: 'overlay',
            snoozeCount: payload.snooze_count,
            canSnooze: payload.can_snooze,
        });
    },

    snooze: async (minutes: number) => {
        if (!get().canSnooze) {
            console.warn('No more snoozes available!');
            return false;
        }

        // Update mascot based on snooze count
        const mascotStore = useMascotStore.getState();
        mascotStore.incrementSnoozeCount();

        if (isTauri) {
            try {
                const result = await invoke<{ success: boolean; snooze_count: number; can_snooze: boolean }>(
                    'escalation_snooze',
                    { minutes }
                );

                set({
                    snoozeCount: result.snooze_count,
                    canSnooze: result.can_snooze,
                    currentLevel: null,
                });

                return result.success;
            } catch (error) {
                console.error('Snooze failed:', error);
                // Fallback to local state
            }
        }

        // Browser mock / fallback
        const newCount = get().snoozeCount + 1;
        set({
            snoozeCount: newCount,
            canSnooze: newCount < 3,
            currentLevel: null,
        });
        return true;
    },

    acknowledge: async () => {
        // Reset mascot
        const mascotStore = useMascotStore.getState();
        mascotStore.resetSnoozeCount();
        mascotStore.setHappy();

        if (isTauri) {
            try {
                await invoke('escalation_acknowledge');
            } catch (error) {
                console.error('Acknowledge failed:', error);
            }
        }

        set({
            snoozeCount: 0,
            canSnooze: true,
            currentLevel: null,
        });

        console.log('✅ Break acknowledged, snooze reset');
    },
}));
