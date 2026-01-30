// M12: Mobile Layout Component
import { FC, ReactNode } from 'react';
import { usePlatform, isMobile } from '../../hooks/usePlatform';
import { BottomTabBar, TabId } from './BottomTabBar';

interface MobileLayoutProps {
    children: ReactNode;
    activeTab?: TabId;
    onTabChange?: (tab: TabId) => void;
}

export const MobileLayout: FC<MobileLayoutProps> = ({
    children,
    activeTab = 'home',
    onTabChange
}) => {
    const platform = usePlatform();

    // On desktop, just render children
    if (!isMobile(platform)) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-sky-100 to-teal-100">
            {/* Safe area padding for notch */}
            <div className="h-[env(safe-area-inset-top)]" />

            {/* Main content */}
            <main className="flex-1 overflow-y-auto px-4 pb-24">
                {children}
            </main>

            {/* Bottom tab bar */}
            <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />

            {/* Safe area padding for home indicator */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
    );
};
