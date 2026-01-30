import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../stores/notificationStore';
import { useEscalationStore } from '../../stores/escalationStore';
import { useMascotStore } from '../../stores/mascotStore';
import { useHealthTipsStore } from '../../stores/healthTipsStore';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { Mascot } from '../Mascot';
import { SnoozeButton } from '../Snooze';
import { HealthTipCard } from '../HealthTips';

export const BreakOverlay: FC = () => {
    const { t } = useTranslation();
    const { isOverlayVisible, currentPayload, hideOverlay } = useNotificationStore();
    const { acknowledge } = useEscalationStore();
    const getMascotMessage = useMascotStore(s => s.getMascotMessage);
    const { setBreakType } = useHealthTipsStore();

    // Select random tip based on break type when overlay shows
    useEffect(() => {
        if (isOverlayVisible) {
            const breakType = currentPayload?.timer_type === 'micro_break' ? 'micro' : 'rest';
            setBreakType(breakType);
        }
    }, [isOverlayVisible, currentPayload?.timer_type, setBreakType]);

    // Handle take break action
    const handleTakeBreak = async () => {
        await acknowledge();
        hideOverlay();
    };

    // Handle snooze (hide overlay, SnoozeButton handles the rest)
    const handleSnooze = () => {
        hideOverlay();
    };

    return (
        <AnimatePresence>
            {isOverlayVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Main card */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full mx-4 border border-white/30 shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Mascot with animations */}
                        <div className="flex flex-col items-center mb-4">
                            <Mascot size="lg" />
                            <motion.p
                                className="text-white/80 mt-3 text-base italic text-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                "{getMascotMessage()}"
                            </motion.p>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-white text-center mb-1">
                            {currentPayload?.title || t('overlay.time_for_break')}
                        </h1>

                        {/* Message */}
                        <p className="text-white/80 text-center text-sm mb-4">
                            {currentPayload?.message || t('overlay.take_care')}
                        </p>

                        {/* Health Tip Card with navigation */}
                        <div className="mb-4">
                            <HealthTipCard showNavigation variant="dark" />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3">
                            {/* Primary: Take Break */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleTakeBreak}
                                className="w-full py-3.5 bg-[#4ECDC4] hover:bg-[#3dbdb5] text-white font-bold rounded-xl shadow-lg transition-colors"
                            >
                                ☕ {t('overlay.take_break')}
                            </motion.button>

                            {/* Secondary: Snooze with passive-aggressive text */}
                            <SnoozeButton
                                minutes={5}
                                onSnooze={handleSnooze}
                                variant="dark"
                            />
                        </div>

                        {/* Break Timer */}
                        <div className="flex items-center justify-center gap-2 mt-4 text-white/50">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                                {t('overlay.break_for')} 20 {t('common.seconds')}
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
