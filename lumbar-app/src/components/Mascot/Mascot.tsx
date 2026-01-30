import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMascotStore, MascotState } from '../../stores/mascotStore';
import { useRelationshipStore } from '../../stores/relationshipStore';
import { SpeechBubble } from './SpeechBubble';
import { getContextualMessage, getLevelVariant } from '../../utils/messageHelper';

interface MascotProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showMessage?: boolean;
    showContextualMessage?: boolean;
    className?: string;
}

// Size mapping
const sizeMap = {
    sm: 'text-3xl',   // 30px
    md: 'text-5xl',   // 48px
    lg: 'text-7xl',   // 72px
    xl: 'text-8xl',   // 96px
};

// Animation variants per state
const animations: Record<MascotState, { animate: object; transition: object }> = {
    happy: {
        animate: {
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
        },
        transition: {
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 2,
        },
    },
    sad: {
        animate: {
            y: [0, 3, 0],
            scale: [1, 0.95, 1],
        },
        transition: {
            duration: 2,
            repeat: Infinity,
        },
    },
    angry: {
        animate: {
            x: [-2, 2, -2, 2, 0],
            rotate: [0, -3, 3, -3, 0],
        },
        transition: {
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 1,
        },
    },
    sleeping: {
        animate: {
            scale: [1, 1.03, 1],
            opacity: [1, 0.85, 1],
        },
        transition: {
            duration: 2.5,
            repeat: Infinity,
        },
    },
    neutral: {
        animate: {
            scale: [1, 1.02, 1],
        },
        transition: {
            duration: 3,
            repeat: Infinity,
        },
    },
};

export const Mascot: FC<MascotProps> = ({
    size = 'md',
    showMessage = false,
    showContextualMessage = false,
    className = '',
}) => {
    const currentState = useMascotStore(s => s.currentState);
    const getMascotEmoji = useMascotStore(s => s.getMascotEmoji);
    const getMascotMessage = useMascotStore(s => s.getMascotMessage);

    const { getMessageContext, currentLevel } = useRelationshipStore();

    const [contextMessage, setContextMessage] = useState('');
    const [showBubble, setShowBubble] = useState(false);

    // Update contextual message when showing
    useEffect(() => {
        if (showContextualMessage) {
            const context = getMessageContext();
            const message = getContextualMessage(context);
            setContextMessage(message);
            setShowBubble(true);

            // Auto-hide after 8 seconds
            const timer = setTimeout(() => {
                setShowBubble(false);
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [showContextualMessage, getMessageContext]);

    const animation = animations[currentState];
    const bubbleVariant = getLevelVariant(currentLevel);

    return (
        <div className={`flex flex-col items-center gap-2 relative ${className}`}>
            {/* Contextual SpeechBubble from relationship system */}
            {showContextualMessage && (
                <SpeechBubble
                    message={contextMessage}
                    isVisible={showBubble}
                    position="top"
                    variant={bubbleVariant}
                />
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentState}
                    className={`${sizeMap[size]} select-none`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{
                        scale: 1,
                        rotate: 0,
                        ...animation.animate,
                    }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        ...animation.transition,
                    }}
                >
                    🪵{getMascotEmoji()}
                </motion.div>
            </AnimatePresence>

            {/* Z-z-z effect for sleeping */}
            {currentState === 'sleeping' && (
                <motion.div
                    className="absolute text-xl text-gray-500 pointer-events-none"
                    style={{ top: '-10px', right: '-20px' }}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        x: [0, 15],
                        y: [0, -20],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                >
                    💤
                </motion.div>
            )}

            {/* Basic speech bubble for message */}
            {showMessage && !showContextualMessage && (
                <motion.div
                    className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg text-gray-700 text-sm max-w-[200px] text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white/90" />
                    {getMascotMessage()}
                </motion.div>
            )}
        </div>
    );
};
