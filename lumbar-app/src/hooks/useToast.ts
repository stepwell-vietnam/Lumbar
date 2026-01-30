// M13: Toast State Hook
import { create } from 'zustand';

interface ToastState {
    message: string;
    isVisible: boolean;
    showToast: (message: string, duration?: number) => void;
    hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
    message: '',
    isVisible: false,

    showToast: (message: string, duration = 3000) => {
        set({ message, isVisible: true });
        setTimeout(() => set({ isVisible: false }), duration);
    },

    hideToast: () => set({ isVisible: false }),
}));
