import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle } from 'lucide-react';
import { useEscalationStore } from '../../stores/escalationStore';

interface SnoozeButtonProps {
    minutes?: number;
    onSnooze?: () => void;
    variant?: 'light' | 'dark';
}

export const SnoozeButton: FC<SnoozeButtonProps> = ({
    minutes = 5,
    onSnooze,
    variant = 'dark',
}) => {
    const { t } = useTranslation();
    const { snoozeCount, canSnooze, maxSnooze, snooze } = useEscalationStore();

    // Passive-aggressive text based on snooze count
    const getSnoozeText = (): string => {
        if (snoozeCount === 0) {
            return t('snooze.first', { minutes });
        } else if (snoozeCount === 1) {
            return t('snooze.second', { minutes });
        } else if (snoozeCount === 2) {
            return t('snooze.third', { minutes });
        } else {
            return t('snooze.denied');
        }
    };

    const handleSnooze = async () => {
        if (canSnooze) {
            await snooze(minutes);
            onSnooze?.();
        }
    };

    // No more snoozes - show warning
    if (!canSnooze) {
        return (
            <div className="flex items-center justify-center gap-2 text-red-400 py-3">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{t('snooze.no_more')}</span>
            </div>
        );
    }

    // Dark variant (for overlay)
    if (variant === 'dark') {
        return (
            <motion.button
                onClick={handleSnooze}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white/70 font-medium rounded-xl border border-white/20 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <span className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    {getSnoozeText()}
                </span>
                <span className="text-xs text-white/40 mt-1 block">
                    ({snoozeCount}/{maxSnooze} {t('snooze.used')})
                </span>
            </motion.button>
        );
    }

    // Light variant
    return (
        <motion.button
            onClick={handleSnooze}
            className="w-full py-3 bg-gray-200/60 hover:bg-gray-300/60 text-gray-700 font-medium rounded-xl border border-gray-300/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                {getSnoozeText()}
            </span>
            <span className="text-xs text-gray-500 mt-1 block">
                ({snoozeCount}/{maxSnooze} {t('snooze.used')})
            </span>
        </motion.button>
    );
};
