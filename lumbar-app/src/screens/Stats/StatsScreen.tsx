import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, TrendingUp, Calendar, Award } from 'lucide-react';
import { useStatsStore } from '../../stores/statsStore';
import { StatsCard, StreakDisplay, AchievementBadge } from '../../components/Stats';

interface StatsScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StatsScreen: FC<StatsScreenProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const {
        todayStats,
        allTimeStats,
        achievements,
        isLoading,
        initialize
    } = useStatsStore();

    useEffect(() => {
        if (isOpen) {
            initialize();
        }
    }, [isOpen, initialize]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 bg-black/50 backdrop-blur-sm overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-md mx-4 shadow-2xl"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Clean minimal */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h1 className="text-lg font-semibold text-gray-800">
                                📊 {t('stats.title')}
                            </h1>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <motion.div
                                        className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* Streak Section */}
                                    <StreakDisplay
                                        currentStreak={allTimeStats?.currentStreak ?? 0}
                                        longestStreak={allTimeStats?.longestStreak ?? 0}
                                    />

                                    {/* Today Stats */}
                                    <section>
                                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {t('stats.today')}
                                        </h2>
                                        <div className="grid grid-cols-2 gap-3">
                                            <StatsCard
                                                icon="☕"
                                                label={t('stats.breaks_completed')}
                                                value={todayStats?.breaksCompleted ?? 0}
                                                color="teal"
                                            />
                                            <StatsCard
                                                icon="⏸️"
                                                label={t('stats.snoozes')}
                                                value={todayStats?.snoozeCount ?? 0}
                                                color="orange"
                                            />
                                        </div>
                                    </section>

                                    {/* All Time Stats */}
                                    <section>
                                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            {t('stats.all_time')}
                                        </h2>
                                        <div className="grid grid-cols-2 gap-3">
                                            <StatsCard
                                                icon="🎯"
                                                label={t('stats.breaks_completed')}
                                                value={allTimeStats?.totalBreaks ?? 0}
                                                color="purple"
                                            />
                                            <StatsCard
                                                icon="⏱️"
                                                label={t('stats.work_hours')}
                                                value={allTimeStats?.totalWorkHours ?? 0}
                                                subValue="hours"
                                                color="gray"
                                            />
                                        </div>
                                    </section>

                                    {/* Achievements */}
                                    {achievements.length > 0 && (
                                        <section>
                                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                <Award className="w-4 h-4" />
                                                {t('achievements.title')}
                                            </h2>
                                            <div className="grid grid-cols-3 gap-2">
                                                {achievements.map(achievement => (
                                                    <AchievementBadge
                                                        key={achievement.id}
                                                        achievement={achievement}
                                                        showProgress
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
