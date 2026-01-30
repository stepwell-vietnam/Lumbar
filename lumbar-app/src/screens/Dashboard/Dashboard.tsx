// M14.1: Dashboard - 2-Panel Layout
import { FC, useEffect, useState } from 'react';
import { Sidebar, SidebarTab } from '../../components/Navigation/Sidebar';
import { TimerPanel } from '../../components/Timer/TimerPanel';
import { StatsPanel } from '../Stats/StatsPanel';
import { SettingsInline } from '../../components/Settings/SettingsInline';
import { useIdleStore } from '../../stores/idleStore';

export const Dashboard: FC = () => {
    const [activeTab, setActiveTab] = useState<SidebarTab>('home');
    const { initialize: initIdle, startMonitoring } = useIdleStore();

    useEffect(() => {
        initIdle().then(() => startMonitoring());
    }, [initIdle, startMonitoring]);

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'stats':
                return <StatsPanel />;
            case 'settings':
                return <SettingsInline />;
            case 'home':
            default:
                return <TimerPanel />;
        }
    };

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-blue-50/80 via-white/60 to-purple-50/80">
            {/* Left Sidebar */}
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Right Content Panel */}
            <main className="flex-1 flex flex-col">
                {renderContent()}
            </main>
        </div>
    );
};
