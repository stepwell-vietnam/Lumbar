// M14: Pill Tabs Component - Cockpit Tools Style
import { FC } from 'react';
import { motion } from 'framer-motion';

export type TabId = string;

interface Tab {
    id: TabId;
    label: string;
}

interface PillTabsProps {
    tabs: Tab[];
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export const PillTabs: FC<PillTabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="inline-flex bg-gray-100/80 backdrop-blur-sm rounded-full p-1 border border-gray-200/50">
            {tabs.map((tab) => (
                <motion.button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${activeTab === tab.id
                            ? 'text-gray-800'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    whileTap={{ scale: 0.95 }}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            className="absolute inset-0 bg-white rounded-full shadow-sm"
                            layoutId="pillTabBackground"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                </motion.button>
            ))}
        </div>
    );
};
