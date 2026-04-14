import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers';
import { router } from './app/router';
import { initAuth } from './lib/auth';
import { initTheme } from './lib/theme';
import './styles/globals.css';

// Handle PWA shortcut ?action=new-project (store flag before React mounts)
if (new URLSearchParams(window.location.search).get('action') === 'new-project') {
  window.history.replaceState({}, '', window.location.pathname);
  sessionStorage.setItem('ff_action', 'new-project');
}

// Apply saved theme before first paint (avoids flash)
initTheme();
// Initialize auth (mock or firebase listener)
initAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
