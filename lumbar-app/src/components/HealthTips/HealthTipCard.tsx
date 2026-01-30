import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import { useHealthTipsStore } from '../../stores/healthTipsStore';

interface HealthTipCardProps {
    showNavigation?: boolean;
    variant?: 'light' | 'dark';
}

export const HealthTipCard: FC<HealthTipCardProps> = ({
    showNavigation = true,
    variant = 'dark',
}) => {
    const { t } = useTranslation();
    const {
        currentTip,
        currentIndex,
        nextTip,
        prevTip,
        getTotalTips
    } = useHealthTipsStore();

    if (!currentTip) return null;

    const totalTips = getTotalTips();
    const isDark = variant === 'dark';

    return (
        <motion.div
            className={`rounded-2xl p-4 border ${isDark
                    ? 'bg-white/10 backdrop-blur-lg border-white/20'
                    : 'bg-white/80 backdrop-blur-lg border-white/50 shadow-lg'
                }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {t('tips.section_title')}
                </h3>
                <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                    <Timer className="w-3.5 h-3.5" />
                    <span>{currentTip.durationSeconds}s</span>
                </div>
            </div>

            {/* Tip Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTip.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="text-center"
                >
                    {/* Icon */}
                    <div className="text-4xl mb-2">
                        {currentTip.icon}
                    </div>

                    {/* Title */}
                    <h4 className={`font-semibold text-base mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {t(currentTip.titleKey)}
                    </h4>

                    {/* Description */}
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                        {t(currentTip.descriptionKey)}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {showNavigation && totalTips > 1 && (
                <div className={`flex items-center justify-between mt-4 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200/50'
                    }`}>
                    <button
                        onClick={prevTip}
                        className={`p-1.5 rounded-full transition-colors ${isDark
                                ? 'hover:bg-white/10 text-white/70'
                                : 'hover:bg-gray-200/60 text-gray-600'
                            }`}
                        aria-label="Previous tip"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalTips }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex
                                        ? 'bg-[#FF6B35]'
                                        : isDark ? 'bg-white/30' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextTip}
                        className={`p-1.5 rounded-full transition-colors ${isDark
                                ? 'hover:bg-white/10 text-white/70'
                                : 'hover:bg-gray-200/60 text-gray-600'
                            }`}
                        aria-label="Next tip"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </motion.div>
    );
};
