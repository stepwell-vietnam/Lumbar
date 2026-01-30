import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTimerStore } from '../../stores/timerStore';

interface TimerDisplayProps {
    size?: 'sm' | 'md' | 'lg';
    showProgress?: boolean;
}

export const TimerDisplay: FC<TimerDisplayProps> = ({
    size = 'md',
    showProgress = true
}) => {
    const { state, initialize } = useTimerStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const progress = state.total_seconds > 0
        ? ((state.total_seconds - state.remaining_seconds) / state.total_seconds) * 100
        : 0;

    // Size classes
    const sizeClasses = {
        sm: 'text-2xl',
        md: 'text-4xl',
        lg: 'text-6xl',
    };

    // Status colors - DARK colors for light vibrancy background
    const statusColors = {
        idle: 'text-gray-500',
        running: 'text-gray-800',
        paused: 'text-amber-600',
        break: 'text-emerald-600',
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Timer Display */}
            <motion.div
                className={`font-bold ${sizeClasses[size]} ${statusColors[state.status]}`}
                key={state.remaining_seconds}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
            >
                {formatTime(state.remaining_seconds)}
            </motion.div>

            {/* Progress Bar */}
            {showProgress && (
                <div className="w-full max-w-xs h-2 bg-gray-300/50 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${state.is_break_time ? 'bg-emerald-500' : 'bg-[#FF6B35]'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            )}

            {/* Status Badge */}
            <div className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${state.is_break_time
                    ? 'bg-emerald-500/20 text-emerald-700'
                    : 'bg-gray-500/20 text-gray-700'}
      `}>
                {state.is_break_time ? '🧘 Break Time' : '💻 Working'}
            </div>
        </div>
    );
};
