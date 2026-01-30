// M12: Bottom Tab Bar Component
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, BarChart2, Settings, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'home' | 'stats' | 'settings' | 'awards';

interface BottomTabBarProps {
    activeTab?: TabId;
    onTabChange?: (tab: TabId) => void;
}

export const BottomTabBar: FC<BottomTabBarProps> = ({
    activeTab = 'home',
    onTabChange
}) => {
    const { t } = useTranslation();

    const tabs: { id: TabId; icon: typeof Home; label: string }[] = [
        { id: 'home', icon: Home, label: t('nav.home', 'Home') },
        { id: 'stats', icon: BarChart2, label: t('nav.stats', 'Stats') },
        { id: 'settings', icon: Settings, label: t('nav.settings', 'Settings') },
        { id: 'awards', icon: Award, label: t('nav.awards', 'Awards') },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-40">
            <div className="flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
                {tabs.map(({ id, icon: Icon, label }) => (
                    <motion.button
                        key={id}
                        onClick={() => onTabChange?.(id)}
                        className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${activeTab === id ? 'text-orange-500' : 'text-gray-500'
                            }`}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{label}</span>

                        {activeTab === id && (
                            <motion.div
                                className="absolute -bottom-1 w-1 h-1 bg-orange-500 rounded-full"
                                layoutId="activeTabIndicator"
                            />
                        )}
                    </motion.button>
                ))}
            </div>
        </nav>
    );
};
