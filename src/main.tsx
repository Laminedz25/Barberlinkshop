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
      (registration) => console.log('Service Worker registered with scope:', registration.scope),
      (err) => console.log('Service Worker registration failed:', err)
    );
  });
}

