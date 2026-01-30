// M12: Platform Detection Hook
import { useState, useEffect } from 'react';

export type Platform = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'web';

export const usePlatform = (): Platform => {
    const [platform, setPlatform] = useState<Platform>('web');

    useEffect(() => {
        const detectPlatform = async () => {
            // Check if running in Tauri (v2 uses __TAURI_INTERNALS__)
            if ('__TAURI_INTERNALS__' in window || '__TAURI__' in window) {
                try {
                    const { platform: tauriPlatform } = await import('@tauri-apps/plugin-os');
                    const os = await tauriPlatform();
                    setPlatform(os as Platform);
                } catch (e) {
                    // Fallback to web
                    console.warn('Could not detect platform:', e);
                }
            }
        };
        detectPlatform();
    }, []);

    return platform;
};

export const isMobile = (platform: Platform): boolean =>
    platform === 'ios' || platform === 'android';

export const isDesktop = (platform: Platform): boolean =>
    platform === 'macos' || platform === 'windows' || platform === 'linux';

export const isWeb = (platform: Platform): boolean =>
    platform === 'web';
