// M14.1: Settings Panel Inline - No modal, direct content
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { RotateCcw, Check } from 'lucide-react';

import { useSettingsStore } from '../../stores/settingsStore';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { NumberInput } from './NumberInput';
import { Toggle } from './Toggle';
import { Select } from './Select';

export const SettingsInline: FC = () => {
    const { t, i18n } = useTranslation();
    const [showSaved] = useState(false);
    const {
        settings,
        isLoading,
        initialize,
        updateTimer,
        updateNotification,
        updateGeneral,
        reset
    } = useSettingsStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    const handleReset = async () => {
        if (confirm(t('settings.confirm_reset'))) {
            await reset();
        }
    };

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

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <motion.div
                    className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    ⚙️ {t('settings.title')}
                </h2>
                <div className="flex gap-3">
                    <motion.button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RotateCcw className="w-4 h-4" />
                        {t('settings.reset')}
                    </motion.button>
                    {showSaved && (
                        <motion.span
                            className="flex items-center gap-1 text-green-600"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Check className="w-4 h-4" />
                            {t('common.saved_successfully')}
                        </motion.span>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Timer Settings */}
                <motion.div
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <SettingsSection title={t('settings.timer')} icon="⏱️">
                        <SettingsRow label={t('settings.micro_break_interval')}>
                            <NumberInput
                                value={settings.timer.micro_break_interval_min}
                                onChange={(val) => updateTimer({ micro_break_interval_min: val })}
                                min={1}
                                max={60}
                                step={1}
                                suffix={t('timer.minutes')}
                            />
                        </SettingsRow>
                        <SettingsRow label={t('settings.micro_break_duration')}>
                            <NumberInput
                                value={settings.timer.micro_break_duration_sec}
                                onChange={(val) => updateTimer({ micro_break_duration_sec: val })}
                                min={5}
                                max={120}
                                step={5}
                                suffix={t('common.seconds')}
                            />
                        </SettingsRow>
                        <SettingsRow label={t('settings.rest_break_interval')}>
                            <NumberInput
                                value={settings.timer.rest_break_interval_min}
                                onChange={(val) => updateTimer({ rest_break_interval_min: val })}
                                min={15}
                                max={120}
                                step={5}
                                suffix={t('timer.minutes')}
                            />
                        </SettingsRow>
                        <SettingsRow label={t('settings.rest_break_duration')}>
                            <NumberInput
                                value={settings.timer.rest_break_duration_min}
                                onChange={(val) => updateTimer({ rest_break_duration_min: val })}
                                min={1}
                                max={30}
                                step={1}
                                suffix={t('timer.minutes')}
                            />
                        </SettingsRow>
                    </SettingsSection>
                </motion.div>

                {/* Notification Settings */}
                <motion.div
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <SettingsSection title={t('settings.notifications')} icon="🔔">
                        <SettingsRow label={t('settings.sound_enabled')}>
                            <Toggle
                                checked={settings.notification.sound_enabled}
                                onChange={(val) => updateNotification({ sound_enabled: val })}
                            />
                        </SettingsRow>
                    </SettingsSection>
                </motion.div>

                {/* General Settings */}
                <motion.div
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <SettingsSection title={t('settings.general')} icon="🌐">
                        <SettingsRow label={t('settings.language')}>
                            <Select
                                value={settings.general.language}
                                options={languageOptions}
                                onChange={handleLanguageChange}
                            />
                        </SettingsRow>
                        <SettingsRow label={t('settings.theme')}>
                            <Select
                                value={settings.general.theme}
                                options={themeOptions}
                                onChange={(val) => updateGeneral({ theme: val as 'system' | 'light' | 'dark' })}
                            />
                        </SettingsRow>
                    </SettingsSection>
                </motion.div>
            </div>
        </div>
    );
};
