// M11: Soul Breathing - SpeechBubble Component
import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
    message: string;
    isVisible: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    variant?: 'normal' | 'angry' | 'happy' | 'sad';
}

export const SpeechBubble: FC<SpeechBubbleProps> = ({
    message,
    isVisible,
    position = 'top',
    variant = 'normal',
}) => {
    const variantColors = {
        normal: 'bg-white border-gray-200',
        angry: 'bg-red-50 border-red-300',
        happy: 'bg-green-50 border-green-300',
        sad: 'bg-blue-50 border-blue-300',
    };

    const positionClasses = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };

    const tailPositionClasses = {
        top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t border-l',
        bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b border-r',
        left: 'right-[-6px] top-1/2 -translate-y-1/2 border-t border-r',
        right: 'left-[-6px] top-1/2 -translate-y-1/2 border-b border-l',
    };

    const tailBgColors = {
        normal: 'bg-white',
        angry: 'bg-red-50',
        happy: 'bg-green-50',
        sad: 'bg-blue-50',
    };

    const tailBorderColors = {
        normal: 'border-gray-200',
        angry: 'border-red-300',
        happy: 'border-green-300',
        sad: 'border-blue-300',
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`absolute ${positionClasses[position]} z-50`}
                    initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                    <div className={`relative px-3 py-2 rounded-xl border-2 shadow-lg ${variantColors[variant]} max-w-[220px]`}>
                        <p className="text-xs text-gray-800 font-medium leading-relaxed">{message}</p>

                        {/* Bubble tail */}
                        <div
                            className={`absolute w-3 h-3 rotate-45 ${tailBgColors[variant]} ${tailBorderColors[variant]} ${tailPositionClasses[position]}`}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
