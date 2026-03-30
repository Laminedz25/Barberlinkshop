import { createRoot } from 'react-dom/client' // Triggering Fresh Production Build: Sentinel-v1.0.42
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <App />
  </ThemeProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Listen for NEW SW waiting (= new version deployed)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // A new version is available — show update banner
              const banner = document.createElement('div');
              banner.id = 'pwa-update-banner';
              banner.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#d4af37;color:#000;padding:12px 24px;border-radius:9999px;font-weight:900;font-size:14px;z-index:99999;cursor:pointer;box-shadow:0 8px 32px rgba(0,0,0,0.3);';
              banner.textContent = '✨ تحديث جديد متاح! اضغط هنا لتحديث التطبيق / New update available! Tap to refresh.';
              banner.onclick = () => {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              };
              document.body.appendChild(banner);
            }
          });
        });
      },
      (err) => console.log('Service Worker registration failed:', err)
    );
    
    // Auto-reload if SW controller changes (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[BarberLink] New Service Worker activated — reloading...');
    });
  });
}

