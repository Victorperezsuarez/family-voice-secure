import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { VelaProvider } from './contexts/VelaContext'
import { AuthProvider } from './contexts/AuthContext'
import { OfflineSyncProvider } from './contexts/OfflineSyncContext'
import { registerServiceWorker, requestNotificationPermission } from './utils/pwaUtils'

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  registerServiceWorker().then((registration) => {
    if (registration) {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          console.log('Notifications enabled');
        }
      });
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <VelaProvider>
      <OfflineSyncProvider>
        <App />
      </OfflineSyncProvider>
    </VelaProvider>
  </AuthProvider>
);

