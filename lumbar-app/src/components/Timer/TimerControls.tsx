import { FC } from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { useTimerStore, TimerType } from '../../stores/timerStore';
import { useSettingsStore } from '../../stores/settingsStore';

interface TimerControlsProps {
    showTypeSelector?: boolean;
}

export const TimerControls: FC<TimerControlsProps> = ({
    showTypeSelector = true
}) => {
    const { state, start, pause, resume, reset, skipToBreak } = useTimerStore();
    const { settings } = useSettingsStore();

    const handlePlayPause = async () => {
        if (state.status === 'idle') {
            await start('micro_break');
        } else if (state.status === 'running') {
            await pause();
        } else if (state.status === 'paused') {
            await resume();
        }
    };

    const handleTimerTypeChange = async (type: TimerType) => {
        await reset();
        await start(type);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Timer Type Selector */}
            {showTypeSelector && state.status === 'idle' && (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleTimerTypeChange('micro_break')}
                        className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${state.timer_type === 'micro_break'
                                ? 'bg-[#FF6B35] text-white shadow-md'
                                : 'bg-gray-200/60 text-gray-700 hover:bg-gray-300/60'}
            `}
                    >
                        👀 Micro ({settings.timer.micro_break_interval_min}m)
                    </button>
                    <button
                        onClick={() => handleTimerTypeChange('rest_break')}
                        className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${state.timer_type === 'rest_break'
                                ? 'bg-[#FF6B35] text-white shadow-md'
                                : 'bg-gray-200/60 text-gray-700 hover:bg-gray-300/60'}
            `}
                    >
                        🧘 Rest ({settings.timer.rest_break_interval_min}m)
                    </button>
                </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center gap-4">
                {/* Reset Button */}
                <button
                    onClick={reset}
                    className="p-3 rounded-full bg-gray-200/60 hover:bg-gray-300/60 transition-all disabled:opacity-30"
                    disabled={state.status === 'idle'}
                >
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                </button>

                {/* Play/Pause Button */}
                <button
                    onClick={handlePlayPause}
                    className="p-4 rounded-full bg-[#FF6B35] hover:bg-[#e55a2b] transition-all shadow-lg"
                >
                    {state.status === 'running' ? (
                        <Pause className="w-8 h-8 text-white" />
                    ) : (
                        <Play className="w-8 h-8 text-white" />
                    )}
                </button>

                {/* Skip to Break Button */}
                <button
                    onClick={skipToBreak}
                    className="p-3 rounded-full bg-gray-200/60 hover:bg-gray-300/60 transition-all disabled:opacity-30"
                    disabled={state.status === 'idle' || state.is_break_time}
                >
                    <FastForward className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
    );
};
