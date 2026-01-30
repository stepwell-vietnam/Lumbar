import { FC, ReactNode } from 'react';

interface SettingsRowProps {
    label: string;
    children: ReactNode;
}

export const SettingsRow: FC<SettingsRowProps> = ({ label, children }) => {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-gray-700 text-sm">{label}</span>
            <div>{children}</div>
        </div>
    );
};
