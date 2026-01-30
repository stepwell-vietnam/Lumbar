// M11: Soul Breathing - Message Helper Utilities
import i18n from 'i18next';
import { RelationshipLevel, MessageContext, TimePeriod } from '../types/relationship';

/**
 * Get a contextual message based on relationship level, time, streak, etc.
 */
export const getContextualMessage = (context: MessageContext): string => {
    const { level, timeContext, streak, consecutiveSnoozes, workMinutes } = context;

    // 1. Priority: Streak milestone messages
    if (streak === 30) {
        const messages = i18n.t('relationship.streak_messages.milestone_30', { returnObjects: true }) as string[];
        return getRandomItem(messages);
    }
    if (streak === 7) {
        const messages = i18n.t('relationship.streak_messages.milestone_7', { returnObjects: true }) as string[];
        return getRandomItem(messages);
    }
    if (streak === 3) {
        const messages = i18n.t('relationship.streak_messages.milestone_3', { returnObjects: true }) as string[];
        return getRandomItem(messages);
    }

    // 2. Streak at risk
    if (streak > 0 && consecutiveSnoozes >= 2) {
        const messages = i18n.t('relationship.streak_messages.streak_reminder', { returnObjects: true }) as string[];
        return getRandomItem(messages).replace('{{days}}', streak.toString());
    }

    // 3. Long work session
    if (workMinutes >= 80) {
        const messages = i18n.t('relationship.intensity_messages.very_long', { returnObjects: true }) as string[];
        return getRandomItem(messages);
    }
    if (workMinutes >= 45) {
        const messages = i18n.t('relationship.intensity_messages.long_session', { returnObjects: true }) as string[];
        return getRandomItem(messages).replace('{{minutes}}', workMinutes.toString());
    }

    // 4. Time-based messages (30% chance)
    if (Math.random() < 0.3) {
        const timeMessages = i18n.t(`time_messages.${timeContext.period}.break_prompt`, { returnObjects: true }) as string[];
        if (Array.isArray(timeMessages) && timeMessages.length > 0) {
            return getRandomItem(timeMessages);
        }
    }

    // 5. Fun facts (10% chance)
    if (Math.random() < 0.1) {
        const funFacts = i18n.t('fun_facts', { returnObjects: true }) as string[];
        if (Array.isArray(funFacts) && funFacts.length > 0) {
            return getRandomItem(funFacts);
        }
    }

    // 6. Fallback: Relationship level messages
    const levelMessages = i18n.t(`relationship.${level}.messages`, { returnObjects: true }) as string[];
    if (Array.isArray(levelMessages) && levelMessages.length > 0) {
        return getRandomItem(levelMessages);
    }

    return i18n.t('mascot.neutral.messages.0');
};

/**
 * Get greeting based on time of day
 */
export const getTimeGreeting = (period: TimePeriod): string => {
    const greetings = i18n.t(`time_messages.${period}.greeting`, { returnObjects: true }) as string[];
    if (Array.isArray(greetings) && greetings.length > 0) {
        return getRandomItem(greetings);
    }
    return 'Hello!';
};

/**
 * Get tip based on time of day
 */
export const getTimeTip = (period: TimePeriod): string => {
    const tips = i18n.t(`time_messages.${period}.tip`, { returnObjects: true }) as string[];
    if (Array.isArray(tips) && tips.length > 0) {
        return getRandomItem(tips);
    }
    return '';
};

/**
 * Get guilt button text based on action and relationship level
 */
export const getGuiltButtonText = (action: 'skip' | 'snooze' | 'take_break', level: RelationshipLevel): { text: string; reaction: string; state: string } => {
    const optionsKey = action === 'skip' ? 'skip_options' : action === 'snooze' ? 'snooze_options' : 'take_break_options';
    const options = i18n.t(`guilt_buttons.${optionsKey}`, { returnObjects: true }) as { text: string; reaction: string; state: string }[];

    if (Array.isArray(options) && options.length > 0) {
        // For villain mode, pick more aggressive options
        if (level === 'villain' && action === 'skip') {
            return options[Math.floor(Math.random() * options.length)];
        }
        return getRandomItem(options);
    }

    return { text: 'OK', reaction: '', state: 'neutral' };
};

/**
 * Get variant for SpeechBubble based on relationship level
 */
export const getLevelVariant = (level: RelationshipLevel): 'normal' | 'angry' | 'happy' | 'sad' => {
    switch (level) {
        case 'angel':
        case 'reconcile':
            return 'happy';
        case 'villain':
            return 'angry';
        case 'dormant':
            return 'sad';
        default:
            return 'normal';
    }
};

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}
