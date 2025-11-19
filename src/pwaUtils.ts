export const isOnline = () => navigator.onLine;

export const saveOfflineRecording = async (recordingData: any) => {
  const db = await openDB();
  return db.put('recordings', recordingData);
};

const openDB = () => {
  return new Promise<any>((resolve, reject) => {
    const request = indexedDB.open('FamilyVoiceDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) await registration.update();
  }
};

export const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
};

export const canInstallPWA = () => 'BeforeInstallPromptEvent' in window;

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    return (await Notification.requestPermission()) === 'granted';
  }
  return false;
};
