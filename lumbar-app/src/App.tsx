// M13: Enhanced App with First-Run Detection and Auto-Start UX
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Dashboard } from './screens/Dashboard';
import { BreakOverlay } from './components/Overlay';
import { WelcomeScreen } from './components/Welcome';
import { Toast } from './components/Toast';
import { useNotificationStore } from './stores/notificationStore';
import { useTimerStore } from './stores/timerStore';
import { useIdleStore } from './stores/idleStore';
import { useSettingsStore } from './stores/settingsStore';
import { useEscalationStore } from './stores/escalationStore';
import { useFirstRun } from './hooks/useFirstRun';
import { useToast } from './hooks/useToast';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { DevPanel } from './components/Dev';

function App() {
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // First-run detection
  const { isFirstRun, isLoading: isFirstRunLoading, completeFirstRun } = useFirstRun();

  // Toast state
  const { message: toastMessage, isVisible: toastVisible, showToast } = useToast();

  const initSettings = useSettingsStore(state => state.initialize);
  const initTimer = useTimerStore(state => state.initialize);
  const initIdle = useIdleStore(state => state.initialize);
  const initNotifications = useNotificationStore(state => state.initialize);
  const initEscalation = useEscalationStore(state => state.initialize);
  const showOverlay = useNotificationStore(state => state.showOverlay);
  const startTimer = useTimerStore(state => state.start);

  // Initialize all stores on startup
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing Lumbar...');

      // 1. Load settings first (they apply to other stores)
      await initSettings();

      // 2. Initialize other stores in parallel
      await Promise.all([
        initTimer(),
        initIdle(),
        initNotifications(),
        initEscalation(),
      ]);

      // 3. Start idle monitoring
      const idleStore = useIdleStore.getState();
      await idleStore.startMonitoring();

      console.log('✅ Lumbar ready!');
      setIsReady(true);
    };

    initializeApp();
  }, [initSettings, initTimer, initIdle, initNotifications, initEscalation]);

  // Handle start (both first-run and returning users)
  const handleStart = async (minimizeToTray = true) => {
    // Complete first run if applicable
    if (isFirstRun) {
      completeFirstRun();
    }
    setShowSettings(false);

    // Start timer
    startTimer('micro_break');

    // Show toast
    showToast(t('toast.app_running'), 1500);

    // Minimize to tray after delay (if enabled)
    if (minimizeToTray) {
      setTimeout(async () => {
        try {
          // Get random hide message
          const hideMessages = t('toast.hide_to_tray', { returnObjects: true }) as string[];
          const randomMessage = Array.isArray(hideMessages)
            ? hideMessages[Math.floor(Math.random() * hideMessages.length)]
            : t('toast.minimized');

          showToast(randomMessage, 2000);

          // Small delay before hiding so user can see the toast
          setTimeout(async () => {
            await invoke('hide_window');
            console.log('✅ Window hidden to tray');
          }, 500);
        } catch (e) {
          console.warn('⚠️ Could not hide window:', e);
        }
      }, 2500);
    }
  };

  // Handle settings first (for first-run users)
  const handleSettingsFirst = () => {
    setShowSettings(true);
  };

  // Auto-start for returning users
  useEffect(() => {
    if (isReady && !isFirstRunLoading && !isFirstRun) {
      // Returning user: auto-start
      console.log('🔄 Returning user detected, auto-starting...');
      handleStart(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isFirstRunLoading, isFirstRun]);

  // Dev test function - expose globally for console testing
  useEffect(() => {
    (window as unknown as { testOverlay: () => void }).testOverlay = () => {
      showOverlay({
        level: 'overlay',
        title: 'Đến giờ nghỉ rồi!',
        message: 'Hãy nghỉ ngơi 20 giây nhé!',
        timer_type: 'micro_break'
      });
    };
    console.log('🧪 Dev: Call window.testOverlay() to test the break overlay');
  }, [showOverlay]);

  // Show loading state while initializing
  if (!isReady || isFirstRunLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-gray-800 text-xl font-semibold flex items-center gap-3 bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
          <span className="animate-pulse text-3xl">🪵</span>
          <span>Loading Lumbar...</span>
        </div>
      </div>
    );
  }

  // First-run: show Welcome or Settings
  if (isFirstRun) {
    if (showSettings) {
      return (
        <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4 overflow-auto">
          <SettingsPanel
            isOpen={true}
            onClose={() => handleStart(true)}
          />
          <Toast message={toastMessage} isVisible={toastVisible} />
        </div>
      );
    }
    return (
      <>
        <WelcomeScreen onStart={() => handleStart(true)} onSettings={handleSettingsFirst} />
        <Toast message={toastMessage} isVisible={toastVisible} />
      </>
    );
  }

  // Normal dashboard
  return (
    <>
      <Dashboard />
      <BreakOverlay />
      <Toast message={toastMessage} isVisible={toastVisible} />
      <DevPanel />
      {/* Version display for debugging */}
      <div className="fixed bottom-1 right-2 text-[9px] text-gray-400/60 font-mono select-none pointer-events-none z-50">
        v2.1.0 | 30/01
      </div>
    </>
  );
}

export default App;
