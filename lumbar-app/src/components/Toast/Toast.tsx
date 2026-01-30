// M13: Toast Component
import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
    message: string;
    isVisible: boolean;
}

export const Toast: FC<ToastProps> = ({ message, isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800/95 backdrop-blur-sm text-white px-5 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
                initial={{ opacity: 0, y: 20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 20, x: '-50%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
                <span className="text-sm font-medium">{message}</span>
            </motion.div>
        )}
    </AnimatePresence>
);
