import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    isVisible: boolean;
    message: string;
    type?: ToastType;
    onClose?: () => void;
}

const toastStyles: Record<ToastType, { bg: string; icon: typeof Check; color: string }> = {
    success: { bg: 'bg-green-500', icon: Check, color: 'text-white' },
    error: { bg: 'bg-red-500', icon: X, color: 'text-white' },
    info: { bg: 'bg-blue-500', icon: Info, color: 'text-white' },
    warning: { bg: 'bg-amber-500', icon: AlertTriangle, color: 'text-white' },
};

export const Toast: FC<ToastProps> = ({ isVisible, message, type = 'success', onClose }) => {
    const style = toastStyles[type];
    const Icon = style.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] ${style.bg} ${style.color} px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[200px]`}
                >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{message}</span>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
