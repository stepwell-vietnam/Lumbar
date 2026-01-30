// M14: Floating Sidebar Component - Cockpit Tools Style
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Home, Timer, BarChart2, Settings } from 'lucide-react';

export type SidebarTab = 'home' | 'timer' | 'stats' | 'settings' | 'help';

interface FloatingSidebarProps {
    activeTab: SidebarTab;
    onTabChange: (tab: SidebarTab) => void;
}

const tabs: { id: SidebarTab; icon: typeof Home; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'timer', icon: Timer, label: 'Timer' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
];

export const FloatingSidebar: FC<FloatingSidebarProps> = ({ activeTab, onTabChange }) => {
    return (
        <motion.div
            className="fixed left-4 top-1/2 -translate-y-1/2 z-30"
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/50 flex flex-col gap-1">
                {tabs.map(({ id, icon: Icon, label }) => (
                    <motion.button
                        key={id}
                        onClick={() => onTabChange(id)}
                        className={`relative p-3 rounded-xl transition-all duration-200 ${activeTab === id
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={label}
                    >
                        <Icon className="w-5 h-5" />
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};
