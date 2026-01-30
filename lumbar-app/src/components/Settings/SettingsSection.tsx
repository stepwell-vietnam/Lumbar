import { FC, ReactNode } from 'react';

interface SettingsSectionProps {
    icon: string;
    title: string;
    children: ReactNode;
}

export const SettingsSection: FC<SettingsSectionProps> = ({ icon, title, children }) => {
    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{icon}</span>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                {children}
            </div>
        </div>
    );
};
