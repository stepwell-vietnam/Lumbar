export interface HealthTip {
    id: string;
    icon: string;
    titleKey: string;      // i18n key for title
    descriptionKey: string; // i18n key for description
    durationSeconds: number;
    category: 'eye' | 'body' | 'breathing' | 'stretch';
    forBreakType: 'micro' | 'rest' | 'both';
}

export const healthTips: HealthTip[] = [
    {
        id: 'look_away',
        icon: '👀',
        titleKey: 'tips.look_away.title',
        descriptionKey: 'tips.look_away.description',
        durationSeconds: 20,
        category: 'eye',
        forBreakType: 'micro',
    },
    {
        id: 'neck_rotation',
        icon: '🔄',
        titleKey: 'tips.neck_rotation.title',
        descriptionKey: 'tips.neck_rotation.description',
        durationSeconds: 30,
        category: 'stretch',
        forBreakType: 'rest',
    },
    {
        id: 'shoulder_stretch',
        icon: '💪',
        titleKey: 'tips.shoulder_stretch.title',
        descriptionKey: 'tips.shoulder_stretch.description',
        durationSeconds: 30,
        category: 'stretch',
        forBreakType: 'rest',
    },
    {
        id: 'blink_exercise',
        icon: '👁️',
        titleKey: 'tips.blink_exercise.title',
        descriptionKey: 'tips.blink_exercise.description',
        durationSeconds: 10,
        category: 'eye',
        forBreakType: 'micro',
    },
    {
        id: 'deep_breathing',
        icon: '🧘',
        titleKey: 'tips.deep_breathing.title',
        descriptionKey: 'tips.deep_breathing.description',
        durationSeconds: 30,
        category: 'breathing',
        forBreakType: 'both',
    },
    {
        id: 'wrist_rotation',
        icon: '✋',
        titleKey: 'tips.wrist_rotation.title',
        descriptionKey: 'tips.wrist_rotation.description',
        durationSeconds: 20,
        category: 'stretch',
        forBreakType: 'both',
    },
    {
        id: 'back_stretch',
        icon: '🪑',
        titleKey: 'tips.back_stretch.title',
        descriptionKey: 'tips.back_stretch.description',
        durationSeconds: 20,
        category: 'body',
        forBreakType: 'rest',
    },
];

// Helper functions
export const getTipsForBreakType = (breakType: 'micro' | 'rest'): HealthTip[] => {
    return healthTips.filter(
        tip => tip.forBreakType === breakType || tip.forBreakType === 'both'
    );
};

export const getRandomTip = (breakType: 'micro' | 'rest'): HealthTip => {
    const tips = getTipsForBreakType(breakType);
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
};

export const getTipsByCategory = (category: HealthTip['category']): HealthTip[] => {
    return healthTips.filter(tip => tip.category === category);
};
