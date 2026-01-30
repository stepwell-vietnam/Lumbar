import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Activity } from 'lucide-react';
import { useIdleStore } from '../../stores/idleStore';

interface IdleIndicatorProps {
    showText?: boolean;
}

export const IdleIndicator: FC<IdleIndicatorProps> = ({ showText = true }) => {
    const { state, initialize, startMonitoring } = useIdleStore();

    useEffect(() => {
        initialize().then(() => {
            startMonitoring();
        });
    }, [initialize, startMonitoring]);

    const isIdle = state.status === 'idle';

    // Format idle time
    const formatIdleTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={state.status}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          ${isIdle
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'}
        `}
            >
                {isIdle ? (
                    <>
                        <Moon className="w-4 h-4" />
                        {showText && (
                            <span className="text-sm">
                                Idle {formatIdleTime(state.idle_seconds)}
                            </span>
                        )}
                    </>
                ) : (
                    <>
                        <Activity className="w-4 h-4" />
                        {showText && <span className="text-sm">Active</span>}
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};
