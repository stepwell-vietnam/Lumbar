import { create } from 'zustand';
import i18n from '../lib/i18n';

export type MascotState = 'happy' | 'sad' | 'angry' | 'sleeping' | 'neutral';

interface MascotStore {
    currentState: MascotState;
    previousState: MascotState;
    snoozeCount: number;

    // Actions
    setState: (state: MascotState) => void;
    setHappy: () => void;
    setSad: () => void;
    setAngry: () => void;
    setSleeping: () => void;
    setNeutral: () => void;
    resetSnoozeCount: () => void;
    incrementSnoozeCount: () => void;

    // Computed
    getMascotEmoji: () => string;
    getMascotMessage: () => string;
}

const emojis: Record<MascotState, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😤',
    sleeping: '😴',
    neutral: '😐',
};

export const useMascotStore = create<MascotStore>((set, get) => ({
    currentState: 'neutral',
    previousState: 'neutral',
    snoozeCount: 0,

    setState: (state) => set((s) => ({
        previousState: s.currentState,
        currentState: state
    })),

    setHappy: () => get().setState('happy'),
    setSad: () => get().setState('sad'),
    setAngry: () => get().setState('angry'),
    setSleeping: () => get().setState('sleeping'),
    setNeutral: () => get().setState('neutral'),

    resetSnoozeCount: () => set({ snoozeCount: 0 }),

    incrementSnoozeCount: () => {
        const count = get().snoozeCount + 1;
        set({ snoozeCount: count });

        // Auto update state based on snooze count
        if (count >= 3) {
            get().setAngry();
        } else if (count >= 1) {
            get().setSad();
        }
    },

    getMascotEmoji: () => {
        return emojis[get().currentState];
    },

    getMascotMessage: () => {
        const state = get().currentState;
        try {
            const messages = i18n.t(`mascot.${state}.messages`, { returnObjects: true });
            if (Array.isArray(messages) && messages.length > 0) {
                const randomIndex = Math.floor(Math.random() * messages.length);
                return messages[randomIndex] as string;
            }
        } catch {
            // Fallback messages
        }

        // Fallback messages
        const fallbacks: Record<MascotState, string[]> = {
            happy: ['Tuyệt vời! 🎉', 'Great job!'],
            sad: ['Lâu quá rồi... 😢', 'It\'s been so long...'],
            angry: ['Thôi kệ bạn! 😤', 'Fine, whatever!'],
            sleeping: ['Zzz... 😴', 'Sleeping...'],
            neutral: ['Sẵn sàng! 💪', 'Ready!'],
        };

        const fbMessages = fallbacks[state];
        return fbMessages[Math.floor(Math.random() * fbMessages.length)];
    },
}));
