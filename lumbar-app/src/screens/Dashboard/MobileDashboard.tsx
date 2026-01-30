// M12: Mobile Dashboard Screen
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mascot } from '../../components/Mascot';
import { useTimerStore } from '../../stores/timerStore';

export const MobileDashboard: FC = () => {
    const { t } = useTranslation();
    const state = useTimerStore(s => s.state);
    const start = useTimerStore(s => s.start);
    const pause = useTimerStore(s => s.pause);
    const resume = useTimerStore(s => s.resume);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTimerToggle = () => {
        if (state.status === 'running') {
            pause();
        } else if (state.status === 'paused') {
            resume();
        } else {
            start('micro_break');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 py-8">
            {/* Mascot */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                <Mascot size="xl" />
            </motion.div>

            {/* Timer Card */}
            <motion.div
                className="w-full max-w-xs bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <p className="text-center text-gray-500 text-sm mb-2">
                    {t('timer.nextBreak')}
                </p>
                <p className="text-center text-6xl font-bold text-gray-800 tabular-nums">
                    {formatTime(state.remaining_seconds)}
                </p>
                <p className="text-center text-gray-500 text-sm mt-2">
                    {state.timer_type === 'micro_break' ? '👀 Micro Break' : '🧘 Rest Break'}
                </p>
            </motion.div>

            {/* Status Badge */}
            <motion.div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${state.status === 'running'
                        ? 'bg-green-100 text-green-700'
                        : state.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <span className="text-lg">
                    {state.status === 'running' ? '💻' : state.status === 'paused' ? '⏸️' : '😴'}
                </span>
                <span className="font-medium capitalize">
                    {t(`dashboard.${state.status === 'running' ? 'working' : state.status === 'paused' ? 'paused' : 'ready'}`)}
                </span>
            </motion.div>

            {/* Action Button */}
            <motion.button
                onClick={handleTimerToggle}
                className="w-full max-w-xs bg-gradient-to-r from-orange-400 to-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.95 }}
            >
                {state.status === 'running' ? '⏸️ Pause' : state.status === 'paused' ? '▶️ Resume' : '▶️ Start Working'}
            </motion.button>
        </div>
    );
};
