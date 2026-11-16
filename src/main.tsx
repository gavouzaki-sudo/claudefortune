import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './style.css';

// Only clean up stale applet-specific service workers in development mode,
// preserving AI Studio's internal preview proxy (_service-worker.js)
// and keeping VitePWA's production service worker active.
if (import.meta.env.DEV && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      const scriptURL =
        reg.active?.scriptURL ||
        reg.installing?.scriptURL ||
        reg.waiting?.scriptURL ||
        '';
      // Never unregister AI Studio's internal proxy service worker
      if (scriptURL.includes('_service-worker')) {
        continue;
      }
      if (scriptURL.includes('sw.js') || scriptURL.includes('workbox')) {
        reg.unregister().catch(() => {});
      }
    }
  }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
