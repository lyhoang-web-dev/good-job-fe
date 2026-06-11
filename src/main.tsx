import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { RoutePendingSkeleton } from '@/lib/components/layout/PageSkeleton';
import { Provider } from '@/lib/components/ui/provider';
import Page404 from '@/lib/pages/404';
import { queryClient } from '@/lib/services/constants';
import { consumeAccessTokenFromUrlHash } from '@/lib/services/sessionAccessToken';

import { routeTree } from './routeTree.gen';

import './index.css';

consumeAccessTokenFromUrlHash();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: () => <RoutePendingSkeleton />,
  defaultNotFoundComponent: () => <Page404 />,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider context={{ queryClient }} router={router} />
        </QueryClientProvider>
      </Provider>
    </StrictMode>
  );
}
