// M14.1: Sidebar Component - Fixed navigation menu
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart2, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type SidebarTab = 'home' | 'stats' | 'settings' | 'about';

interface SidebarProps {
    activeTab: SidebarTab;
    onTabChange: (tab: SidebarTab) => void;
}

const menuItems: { id: SidebarTab; icon: typeof Home; labelKey: string }[] = [
    { id: 'home', icon: Home, labelKey: 'nav.home' },
    { id: 'stats', icon: BarChart2, labelKey: 'nav.stats' },
    { id: 'settings', icon: Settings, labelKey: 'nav.settings' },
];

export const Sidebar: FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();

    return (
        <aside className="w-56 bg-white/60 backdrop-blur-xl border-r border-gray-200/50 flex flex-col h-full">
            {/* Logo */}
            <div className="p-5 border-b border-gray-200/50">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
                    🪵 Lumbar
                </h1>
                <p className="text-xs text-gray-500 mt-1">Break Reminder</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3">
                <ul className="space-y-1">
                    {menuItems.map(({ id, icon: Icon, labelKey }) => (
                        <li key={id}>
                            <motion.button
                                onClick={() => onTabChange(id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === id
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                    }`}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{t(labelKey)}</span>
                            </motion.button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200/50">
                <p className="text-[10px] text-gray-400 text-center">
                    v2.1.0 • Made with ❤️
                </p>
            </div>
        </aside>
    );
};
