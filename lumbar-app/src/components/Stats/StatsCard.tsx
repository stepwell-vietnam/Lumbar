import { FC } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    icon: string;
    label: string;
    value: string | number;
    subValue?: string;
    color?: 'orange' | 'teal' | 'purple' | 'gray';
}

export const StatsCard: FC<StatsCardProps> = ({
    icon,
    label,
    value,
    subValue,
    color = 'gray'
}) => {
    const colorClasses = {
        orange: 'bg-orange-100 text-orange-600',
        teal: 'bg-teal-100 text-teal-600',
        purple: 'bg-purple-100 text-purple-600',
        gray: 'bg-gray-100 text-gray-600',
    };

    return (
        <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm"
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-xl font-bold text-gray-800">{value}</p>
                    {subValue && (
                        <p className="text-xs text-gray-400">{subValue}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
