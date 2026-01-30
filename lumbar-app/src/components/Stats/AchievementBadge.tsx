import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { Achievement } from '../../types/stats';

interface AchievementBadgeProps {
    achievement: Achievement;
    showProgress?: boolean;
}

export const AchievementBadge: FC<AchievementBadgeProps> = ({
    achievement,
    showProgress = true
}) => {
    const { t } = useTranslation();
    const isUnlocked = achievement.unlockedAt !== null;

    return (
        <motion.div
            className={`
                relative rounded-xl p-3 border transition-all
                ${isUnlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-300'
                    : 'bg-gray-100 border-gray-200 opacity-60'}
            `}
            whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isUnlocked ? 1 : 0.6, y: 0 }}
        >
            {/* Icon */}
            <div className="text-center mb-2">
                {isUnlocked ? (
                    <motion.span
                        className="text-2xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {achievement.icon}
                    </motion.span>
                ) : (
                    <Lock className="w-5 h-5 mx-auto text-gray-400" />
                )}
            </div>

            {/* Title */}
            <p className={`text-xs font-semibold text-center line-clamp-2 ${isUnlocked ? 'text-amber-800' : 'text-gray-500'}`}>
                {t(achievement.titleKey)}
            </p>

            {/* Progress bar (for locked) */}
            {!isUnlocked && showProgress && (
                <div className="mt-2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${achievement.progress}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-1">
                        {Math.round(achievement.progress)}%
                    </p>
                </div>
            )}

            {/* Unlocked indicator */}
            {isUnlocked && (
                <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="text-white text-[8px]">✓</span>
                </motion.div>
            )}
        </motion.div>
    );
};
