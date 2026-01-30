import { FC } from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Toggle: FC<ToggleProps> = ({ checked, onChange }) => {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`
                relative w-11 h-6 rounded-full transition-colors
                ${checked ? 'bg-emerald-500' : 'bg-gray-300'}
            `}
        >
            <motion.div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                animate={{ x: checked ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );
};
