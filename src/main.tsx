import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { LoginContextProvider } from './contexts/LoginContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

async function enableMocking() {
  if (import.meta.env.MODE !== 'development' && !import.meta.env.VITE_MSW_ENABLED) {
    return;
  }

  const { worker } = await import('./mocks');

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}

enableMocking().then(() => {
  console.log('Mock service worker has been initialized');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <LoginContextProvider>
          <App />
        </LoginContextProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
});
