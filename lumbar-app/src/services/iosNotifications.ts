// M12: iOS Notifications Service
import {
    isPermissionGranted,
    requestPermission,
    sendNotification
} from '@tauri-apps/plugin-notification';

/**
 * Initialize iOS push notifications
 */
export const initIOSNotifications = async (): Promise<boolean> => {
    try {
        // Check permission
        let permissionGranted = await isPermissionGranted();

        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
        }

        if (!permissionGranted) {
            console.warn('⚠️ Notification permission denied');
            return false;
        }

        console.log('✅ iOS notifications initialized');
        return true;
    } catch (e) {
        console.error('Failed to init notifications:', e);
        return false;
    }
};

/**
 * Send a break notification
 */
export const sendBreakNotification = async (type: 'micro' | 'rest'): Promise<void> => {
    try {
        await sendNotification({
            title: type === 'micro' ? '👀 Micro Break!' : '🧘 Rest Time!',
            body: type === 'micro'
                ? 'Look away from screen for 20 seconds'
                : 'Time to stand up and stretch!',
        });
    } catch (e) {
        console.error('Failed to send notification:', e);
    }
};

/**
 * Send streak reminder notification
 */
export const sendStreakReminder = async (days: number): Promise<void> => {
    try {
        await sendNotification({
            title: '🔥 Protect Your Streak!',
            body: `Don't break your ${days}-day streak!`,
        });
    } catch (e) {
        console.error('Failed to send streak reminder:', e);
    }
};
