import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface StreakDisplayProps {
    currentStreak: number;
    longestStreak: number;
}

export const StreakDisplay: FC<StreakDisplayProps> = ({
    currentStreak,
    longestStreak
}) => {
    const { t } = useTranslation();

    // Generate flame icons based on streak
    const getFlames = (count: number) => {
        if (count >= 30) return '🔥🔥🔥';
        if (count >= 7) return '🔥🔥';
        if (count >= 3) return '🔥';
        return '✨';
    };

    return (
        <motion.div
            className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm">{t('stats.current_streak')}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{currentStreak}</span>
                        <span className="text-lg">{t('stats.days')}</span>
                    </div>
                </div>
                <motion.div
                    className="text-4xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2
                    }}
                >
                    {getFlames(currentStreak)}
                </motion.div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/60 text-xs">
                    {t('stats.longest_streak')}: {longestStreak} {t('stats.days')}
                </p>
            </div>
        </motion.div>
    );
};
