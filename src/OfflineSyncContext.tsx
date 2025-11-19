import React, { createContext, useContext, useState, useEffect } from 'react';

interface OfflineSyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  syncData: () => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncData = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPendingChanges(0);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <OfflineSyncContext.Provider value={{ isOnline, isSyncing, pendingChanges, syncData }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) throw new Error('useOfflineSync must be used within OfflineSyncProvider');
  return context;
};
