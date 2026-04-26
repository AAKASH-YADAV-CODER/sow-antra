import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n/config';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register Service Worker for PWA (Offline Support)
// Only register in production. In development, ensure all SWs are cleared to avoid stale bundles.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      if (process.env.NODE_ENV === 'production') {
        // Register fresh in production
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('Service Worker: Registered', reg.scope))
          .catch(err => console.log('Service Worker: Registration Failed', err));
      } else {
        // Unregister and clear everything in development
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Service Worker: Unregistered (Dev Mode)');
        }
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
        if (cacheKeys.length > 0) {
          console.log('Service Worker: Caches Cleared (Dev Mode)');
        }
      }
    } catch (e) {
      console.warn('SW management error:', e);
    }
  });
}
