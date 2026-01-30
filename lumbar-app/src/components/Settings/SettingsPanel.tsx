import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X, Check } from 'lucide-react';

import { useSettingsStore } from '../../stores/settingsStore';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { NumberInput } from './NumberInput';
import { Toggle } from './Toggle';
import { Select } from './Select';
import { Toast } from '../common/Toast';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPanel: FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const [showToast, setShowToast] = useState(false);
    const {
        settings,
        isDirty,
        isLoading,
        initialize,
        updateTimer,
        updateNotification,
        updateGeneral,
        save,
        reset
    } = useSettingsStore();

    useEffect(() => {
        if (isOpen) {
            initialize();
        }
    }, [isOpen, initialize]);

    const handleSave = async () => {
        // Show toast immediately when user clicks Save
        setShowToast(true);

        // Save in background
        try {
            await save();
        } catch (e) {
            console.error('Save error:', e);
        }

        // Close modal after toast is shown
        setTimeout(() => {
            setShowToast(false);
            onClose();
        }, 1500);
    };

    const handleReset = async () => {
        if (confirm(t('settings.confirm_reset'))) {
            await reset();
        }
    };

    // Language change handler
    const handleLanguageChange = (lang: string) => {
        updateGeneral({ language: lang });
        if (lang !== 'system') {
            i18n.changeLanguage(lang);
        }
    };

    const languageOptions = [
        { value: 'system', label: t('settings.lang_system') },
        { value: 'vi', label: 'Tiếng Việt' },
        { value: 'en', label: 'English' },
    ];

    const themeOptions = [
        { value: 'system', label: t('settings.theme_system') },
        { value: 'light', label: t('settings.theme_light') },
        { value: 'dark', label: t('settings.theme_dark') },
    ];

    return (
        <>
            <Toast
                isVisible={showToast}
                message={t('common.saved_successfully') || '✅ Đã lưu thành công!'}
                type="success"
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 flex items-start justify-center pt-8 pb-8 bg-black/50 backdrop-blur-sm overflow-y-auto"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-md mx-4 shadow-2xl"
                        >
                            {/* Header - Minimalist */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    ⚙️ {t('settings.title')}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content - Clean sections */}
                            <div className="p-5 space-y-5">
                                {isLoading ? (
                                    <div className="text-gray-400 text-center py-8">Loading...</div>
                                ) : (
                                    <>
                                        {/* Timer Settings */}
                                        <SettingsSection icon="⏱️" title={t('settings.timer')}>
                                            <SettingsRow label={t('settings.micro_interval')}>
                                                <NumberInput
                                                    value={settings.timer.micro_break_interval_min}
                                                    onChange={(v) => updateTimer({ micro_break_interval_min: v })}
                                                    min={10}
                                                    max={60}
                                                    suffix=" min"
                                                />
                                            </SettingsRow>
                                            <SettingsRow label={t('settings.micro_duration')}>
                                                <NumberInput
                                                    value={settings.timer.micro_break_duration_sec}
                                                    onChange={(v) => updateTimer({ micro_break_duration_sec: v })}
                                                    min={10}
                                                    max={60}
                                                    suffix=" sec"
                                                />
                                            </SettingsRow>
                                            <SettingsRow label={t('settings.rest_interval')}>
                                                <NumberInput
                                                    value={settings.timer.rest_break_interval_min}
                                                    onChange={(v) => updateTimer({ rest_break_interval_min: v })}
                                                    min={30}
                                                    max={120}
                                                    step={5}
                                                    suffix=" min"
                                                />
                                            </SettingsRow>
                                            <SettingsRow label={t('settings.rest_duration')}>
                                                <NumberInput
                                                    value={settings.timer.rest_break_duration_min}
                                                    onChange={(v) => updateTimer({ rest_break_duration_min: v })}
                                                    min={3}
                                                    max={15}
                                                    suffix=" min"
                                                />
                                            </SettingsRow>
                                        </SettingsSection>

                                        {/* Notification Settings */}
                                        <SettingsSection icon="🔔" title={t('settings.notifications')}>
                                            <SettingsRow label={t('settings.sound')}>
                                                <Toggle
                                                    checked={settings.notification.sound_enabled}
                                                    onChange={(v) => updateNotification({ sound_enabled: v })}
                                                />
                                            </SettingsRow>
                                            <SettingsRow label={t('settings.notification_level')}>
                                                <NumberInput
                                                    value={settings.notification.notification_level}
                                                    onChange={(v) => updateNotification({ notification_level: v })}
                                                    min={1}
                                                    max={3}
                                                />
                                            </SettingsRow>
                                            <SettingsRow label={t('settings.snooze_limit')}>
                                                <NumberInput
                                                    value={settings.notification.snooze_limit}
                                                    onChange={(v) => updateNotification({ snooze_limit: v })}
                                                    min={1}
                                                    max={5}
                                                />
                                            </SettingsRow>
                                        </SettingsSection>

                                        {/* General Settings */}
                                        <SettingsSection icon="🌐" title={t('settings.general')}>
                                            <SettingsRow label={t('settings.language')}>
                                                <Select
                                                    value={settings.general.language}
                                                    onChange={handleLanguageChange}
                                                    options={languageOptions}
                                                />
                                            </SettingsRow>
                                            <SettingsRow label={t('settings.theme')}>
                                                <Select
                                                    value={settings.general.theme}
                                                    onChange={(v) => updateGeneral({ theme: v })}
                                                    options={themeOptions}
                                                />
                                            </SettingsRow>
                                            <SettingsRow label={t('settings.start_with_os')}>
                                                <Toggle
                                                    checked={settings.general.start_with_os}
                                                    onChange={(v) => updateGeneral({ start_with_os: v })}
                                                />
                                            </SettingsRow>
                                            <SettingsRow label={t('settings.idle_threshold')}>
                                                <NumberInput
                                                    value={settings.general.idle_threshold_min}
                                                    onChange={(v) => updateGeneral({ idle_threshold_min: v })}
                                                    min={1}
                                                    max={10}
                                                    suffix=" min"
                                                />
                                            </SettingsRow>
                                        </SettingsSection>
                                    </>
                                )}
                            </div>

                            {/* Footer - Clean action buttons */}
                            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all text-sm"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    {t('settings.reset')}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!isDirty}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm shadow-sm"
                                >
                                    <Check className="w-4 h-4" />
                                    {t('common.save')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
