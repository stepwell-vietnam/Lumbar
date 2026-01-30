// M13: Welcome Screen Component
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mascot } from '../Mascot';

interface WelcomeScreenProps {
    onStart: () => void;
    onSettings: () => void;
}

export const WelcomeScreen: FC<WelcomeScreenProps> = ({ onStart, onSettings }) => {
    const { t } = useTranslation();

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
            <motion.div
                className="flex flex-col items-center justify-center p-8 text-center max-w-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
                <Mascot size="xl" />

                <motion.h1
                    className="text-2xl font-bold text-gray-800 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {t('welcome.title')}
                </motion.h1>

                <motion.p
                    className="text-gray-600 mt-4 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {t('welcome.description')}
                </motion.p>

                <motion.p
                    className="text-gray-500 text-sm mt-4 bg-gray-100/80 px-3 py-2 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    💡 {t('welcome.tray_hint')}
                </motion.p>

                <motion.div
                    className="flex flex-col gap-3 mt-8 w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.button
                        onClick={onStart}
                        className="bg-gradient-to-r from-orange-400 to-red-500 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        ✅ {t('welcome.start_now')}
                    </motion.button>

                    <motion.button
                        onClick={onSettings}
                        className="bg-white/80 text-gray-700 py-3 px-6 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        ⚙️ {t('welcome.settings_first')}
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};
