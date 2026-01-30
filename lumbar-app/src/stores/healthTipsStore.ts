import { create } from 'zustand';
import { HealthTip, getTipsForBreakType } from '../data/healthTips';

interface HealthTipsState {
    currentTip: HealthTip | null;
    currentIndex: number;
    filteredTips: HealthTip[];
    breakType: 'micro' | 'rest';

    // Actions
    setBreakType: (type: 'micro' | 'rest') => void;
    selectRandomTip: () => void;
    nextTip: () => void;
    prevTip: () => void;
    goToTip: (index: number) => void;

    // Getters
    getTotalTips: () => number;
}

export const useHealthTipsStore = create<HealthTipsState>((set, get) => ({
    currentTip: null,
    currentIndex: 0,
    filteredTips: [],
    breakType: 'micro',

    setBreakType: (type) => {
        const tips = getTipsForBreakType(type);
        const randomIndex = Math.floor(Math.random() * tips.length);
        set({
            breakType: type,
            filteredTips: tips,
            currentIndex: randomIndex,
            currentTip: tips[randomIndex],
        });
    },

    selectRandomTip: () => {
        const { breakType, filteredTips } = get();
        const tips = filteredTips.length > 0 ? filteredTips : getTipsForBreakType(breakType);
        const randomIndex = Math.floor(Math.random() * tips.length);
        set({
            filteredTips: tips,
            currentIndex: randomIndex,
            currentTip: tips[randomIndex],
        });
    },

    nextTip: () => {
        const { currentIndex, filteredTips } = get();
        if (filteredTips.length === 0) return;
        const nextIndex = (currentIndex + 1) % filteredTips.length;
        set({
            currentIndex: nextIndex,
            currentTip: filteredTips[nextIndex],
        });
    },

    prevTip: () => {
        const { currentIndex, filteredTips } = get();
        if (filteredTips.length === 0) return;
        const prevIndex = currentIndex === 0 ? filteredTips.length - 1 : currentIndex - 1;
        set({
            currentIndex: prevIndex,
            currentTip: filteredTips[prevIndex],
        });
    },

    goToTip: (index) => {
        const { filteredTips } = get();
        if (index >= 0 && index < filteredTips.length) {
            set({
                currentIndex: index,
                currentTip: filteredTips[index],
            });
        }
    },

    getTotalTips: () => get().filteredTips.length,
}));
