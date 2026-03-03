import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#032D4E',
            color: '#D4CCC0',
            border: '1px solid #443E44',
            borderRadius: '1rem',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#2ABEDD', secondary: '#032D4E' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#032D4E' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
