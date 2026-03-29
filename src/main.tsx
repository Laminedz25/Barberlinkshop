import { createRoot } from 'react-dom/client' // Triggering Fresh Production Build: Sentinel-v1.0.42
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <App />
  </ThemeProvider>
);
