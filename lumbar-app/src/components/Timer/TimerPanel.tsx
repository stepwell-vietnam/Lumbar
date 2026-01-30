// M14.1: Timer Panel - Main home content
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mascot } from '../Mascot';
import { useTimerStore } from '../../stores/timerStore';
import { useIdleStore } from '../../stores/idleStore';
import { IdleIndicator } from '../ui';

export const TimerPanel: FC = () => {
    const { t } = useTranslation();
    const timerState = useTimerStore(s => s.state);
    const start = useTimerStore(s => s.start);
    const pause = useTimerStore(s => s.pause);
    const resume = useTimerStore(s => s.resume);
    const { state: idleState } = useIdleStore();

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return { mins: mins.toString().padStart(2, '0'), secs: secs.toString().padStart(2, '0') };
    };

    const { mins, secs } = formatTime(timerState.remaining_seconds);

    // Timer action handler
    const handleTimerAction = () => {
        if (timerState.status === 'running') {
            pause();
        } else if (timerState.status === 'paused') {
            resume();
        } else {
            start('micro_break');
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            {/* Status Row */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${timerState.status === 'running' ? 'bg-green-500 animate-pulse' :
                            timerState.status === 'paused' ? 'bg-yellow-500' :
                                timerState.status === 'break' ? 'bg-blue-500 animate-pulse' :
                                    'bg-gray-400'
                        }`} />
                    <span className="text-sm font-medium text-gray-600">
                        {timerState.status === 'running' ? 'Working' :
                            timerState.status === 'paused' ? 'Paused' :
                                timerState.status === 'break' ? 'Break Time' :
                                    'Ready'}
                    </span>
                </div>
                <IdleIndicator showText />
            </div>

            {/* Mascot */}
            <motion.div
                className="mb-6"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
            >
                <Mascot size="xl" />
            </motion.div>

            {/* Timer Display */}
            <motion.div
                className="bg-white/70 backdrop-blur-sm rounded-3xl px-16 py-10 shadow-xl border border-white/50 mb-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <div className="text-8xl font-light text-gray-800 tracking-tight tabular-nums text-center">
                    <span>{mins}</span>
                    <span className="text-gray-300 mx-2">:</span>
                    <span>{secs}</span>
                </div>
                <p className="text-gray-500 text-center mt-3 text-lg">
                    {idleState.status === 'idle' ? '😴 Đang nghỉ...' : t('timer.nextBreak')}
                </p>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <motion.button
                    onClick={handleTimerAction}
                    className="px-8 py-3 rounded-full border-2 border-gray-300 text-gray-600 font-medium text-lg hover:border-gray-400 hover:text-gray-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {timerState.status === 'running' ? 'Pause' :
                        timerState.status === 'paused' ? 'Resume' : 'Start'}
                </motion.button>
                <motion.button
                    onClick={() => start('micro_break')}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Take Break
                </motion.button>
            </div>
        </div>
    );
};
