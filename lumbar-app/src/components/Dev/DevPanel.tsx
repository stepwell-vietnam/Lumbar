import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Bell, Eye, AlertTriangle, Zap, Timer, Settings2 } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useTimerStore } from '../../stores/timerStore';
import { useMascotStore } from '../../stores/mascotStore';


interface DevPanelProps {
    className?: string;
}

export const DevPanel: FC<DevPanelProps> = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [testResult, setTestResult] = useState<string>('');

    const showOverlay = useNotificationStore(state => state.showOverlay);
    const { skipToBreak, reset } = useTimerStore();
    const { setHappy, setSad, setNeutral, incrementSnoozeCount, resetSnoozeCount } = useMascotStore();

    const showResult = (message: string) => {
        setTestResult(message);
        setTimeout(() => setTestResult(''), 3000);
    };

    // Test functions
    const testMicroBreakOverlay = () => {
        showOverlay({
            level: 'overlay',
            title: '👀 Nghỉ mắt thôi!',
            message: 'Nhìn xa 20 giây để mắt được thư giãn',
            timer_type: 'micro_break',
        });
        showResult('✅ Micro break overlay shown');
    };

    const testRestBreakOverlay = () => {
        showOverlay({
            level: 'overlay',
            title: '🧘 Đứng lên vận động!',
            message: 'Hãy nghỉ ngơi và di chuyển một chút',
            timer_type: 'rest_break',
        });
        showResult('✅ Rest break overlay shown');
    };

    const testEscalationL1 = () => {
        showOverlay({
            level: 'hint',
            title: '💡 Gợi ý nhẹ',
            message: 'Đã đến lúc nghỉ ngơi rồi đấy!',
            timer_type: 'micro_break',
        });
        showResult('✅ Escalation L1 (Hint)');
    };

    const testEscalationL2 = () => {
        showOverlay({
            level: 'toast',
            title: '⚠️ Cảnh báo!',
            message: 'Bạn đã bỏ qua break 2 lần. Hãy nghỉ ngơi!',
            timer_type: 'micro_break',
        });
        incrementSnoozeCount();
        showResult('✅ Escalation L2 (Toast) + Snooze count +1');
    };

    const testEscalationL3 = () => {
        showOverlay({
            level: 'overlay',
            title: '🚨 NGHỈ NGAY!',
            message: 'Đây là lần cảnh báo cuối. Hãy chăm sóc sức khỏe!',
            timer_type: 'micro_break',
        });
        incrementSnoozeCount();
        incrementSnoozeCount();
        setSad();
        showResult('✅ Escalation L3 (Overlay) + Mascot sad');
    };

    const testSystemNotification = async () => {
        showResult('🔄 Đang gửi notification...');
        try {
            // Use Rust backend command instead of JS API
            const { invoke } = await import('@tauri-apps/api/core');

            await invoke('send_native_notification', {
                title: '🪵 Lumbar Test',
                body: 'Đây là thông báo test từ Lumbar! Notifications đang hoạt động.',
            });

            showResult('✅ System notification sent via Rust backend!');
        } catch (e: any) {
            console.error('❌ Notification error:', e);
            showResult(`❌ Error: ${e?.message || e}`);
        }
    };

    const testSkipToBreak = async () => {
        await skipToBreak();
        showResult('✅ Skipped to break');
    };

    const testMascotStates = () => {
        setHappy();
        setTimeout(() => setNeutral(), 1000);
        setTimeout(() => setSad(), 2000);
        setTimeout(() => setHappy(), 3000);
        showResult('✅ Mascot: Happy → Neutral → Sad → Happy');
    };

    const resetAll = async () => {
        await reset();
        resetSnoozeCount();
        setNeutral();
        showResult('✅ All states reset');
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 left-4 z-50 p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all ${className}`}
                title="Dev Panel"
            >
                <Bug className="w-5 h-5" />
            </button>

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        className="fixed left-4 bottom-20 z-50 w-80 bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-purple-600/20 border-b border-purple-500/30">
                            <div className="flex items-center gap-2">
                                <Bug className="w-5 h-5 text-purple-400" />
                                <h3 className="text-white font-semibold">Dev Panel</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-white/70" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                            {/* Result feedback */}
                            {testResult && (
                                <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                                    {testResult}
                                </div>
                            )}

                            {/* Overlay Tests */}
                            <div className="space-y-2">
                                <h4 className="text-purple-400 text-sm font-medium flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Overlay Tests
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={testMicroBreakOverlay}
                                        className="p-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 text-sm transition-colors"
                                    >
                                        👀 Micro Break
                                    </button>
                                    <button
                                        onClick={testRestBreakOverlay}
                                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors"
                                    >
                                        🧘 Rest Break
                                    </button>
                                </div>
                            </div>

                            {/* Escalation Tests */}
                            <div className="space-y-2">
                                <h4 className="text-purple-400 text-sm font-medium flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Escalation Levels
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={testEscalationL1}
                                        className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm transition-colors"
                                    >
                                        L1 Hint
                                    </button>
                                    <button
                                        onClick={testEscalationL2}
                                        className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm transition-colors"
                                    >
                                        L2 Toast
                                    </button>
                                    <button
                                        onClick={testEscalationL3}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                                    >
                                        L3 Block
                                    </button>
                                </div>
                            </div>

                            {/* Other Tests */}
                            <div className="space-y-2">
                                <h4 className="text-purple-400 text-sm font-medium flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Quick Actions
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={testSystemNotification}
                                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors flex items-center gap-1 justify-center"
                                    >
                                        <Bell className="w-3 h-3" />
                                        System Notif
                                    </button>
                                    <button
                                        onClick={testSkipToBreak}
                                        className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm transition-colors flex items-center gap-1 justify-center"
                                    >
                                        <Timer className="w-3 h-3" />
                                        Skip to Break
                                    </button>
                                    <button
                                        onClick={testMascotStates}
                                        className="p-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-400 text-sm transition-colors"
                                    >
                                        🪵 Mascot Cycle
                                    </button>
                                    <button
                                        onClick={resetAll}
                                        className="p-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg text-gray-400 text-sm transition-colors flex items-center gap-1 justify-center"
                                    >
                                        <Settings2 className="w-3 h-3" />
                                        Reset All
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-gray-800/50 border-t border-purple-500/20 text-center">
                            <span className="text-xs text-gray-500">
                                🔧 Dev Mode Only - Remove before production
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
