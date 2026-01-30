// M14.1: Stats Panel - Inline stats content (not modal)
import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, TrendingUp, Award, Flame, Coffee, AlertCircle } from 'lucide-react';
import { useStatsStore } from '../../stores/statsStore';

export const StatsPanel: FC = () => {
    const { t } = useTranslation();
    const { todayStats, allTimeStats, achievements, isLoading, initialize } = useStatsStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <motion.div
                    className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📊 {t('stats.title')}
            </h2>

            <div className="grid grid-cols-2 gap-6">
                {/* Today Stats */}
                <motion.div
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('stats.today')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                            <Coffee className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-green-600">{todayStats?.breaksCompleted ?? 0}</p>
                            <p className="text-xs text-gray-500">{t('stats.breaks_taken')}</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-red-500">{todayStats?.breaksMissed ?? 0}</p>
                            <p className="text-xs text-gray-500">{t('stats.breaks_skipped')}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Streak */}
                <motion.div
                    className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 shadow-lg text-white"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2 opacity-90">
                        <Flame className="w-4 h-4" />
                        Streak hiện tại
                    </h3>
                    <div className="flex items-center justify-center">
                        <span className="text-6xl font-bold">{allTimeStats?.currentStreak ?? 0}</span>
                        <span className="text-lg ml-2 opacity-80">ngày</span>
                    </div>
                    <p className="text-center text-sm opacity-80 mt-2">
                        🔥 Kỷ lục: {allTimeStats?.longestStreak ?? 0} ngày
                    </p>
                </motion.div>

                {/* All Time Stats */}
                <motion.div
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 col-span-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {t('stats.all_time')}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <p className="text-3xl font-bold text-blue-600">{allTimeStats?.totalBreaks ?? 0}</p>
                            <p className="text-xs text-gray-500">{t('stats.total_breaks')}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                            <p className="text-3xl font-bold text-purple-600">
                                {Math.round(allTimeStats?.totalWorkHours ?? 0)}h
                            </p>
                            <p className="text-xs text-gray-500">{t('stats.work_hours')}</p>
                        </div>
                        <div className="text-center p-4 bg-teal-50 rounded-xl">
                            <p className="text-3xl font-bold text-teal-600">{allTimeStats?.longestStreak ?? 0}</p>
                            <p className="text-xs text-gray-500">{t('stats.longest_streak')}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Achievements */}
                {achievements.length > 0 && (
                    <motion.div
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 col-span-2"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {t('achievements.title')}
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            {achievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`p-4 rounded-xl text-center transition-all ${achievement.unlockedAt
                                        ? 'bg-yellow-50 border-2 border-yellow-200'
                                        : 'bg-gray-50 opacity-50'
                                        }`}
                                >
                                    <span className="text-3xl">{achievement.icon}</span>
                                    <p className="text-xs font-medium text-gray-700 mt-2">{achievement.titleKey}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
