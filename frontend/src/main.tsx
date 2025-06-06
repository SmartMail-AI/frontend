import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LoginContextProvider } from './contexts/LoginContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import router from './lib/routes';

const queryClient = new QueryClient();

async function enableMocking() {
  if (import.meta.env.MODE !== 'development' || !import.meta.env.VITE_MSW_ENABLED) {
    return;
  }

  // const { worker } = await import('./mocks');
  //
  // return worker.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <LoginContextProvider>
          <RouterProvider router={router} />
        </LoginContextProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
});
