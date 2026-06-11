import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { SseBridge } from '@/lib/components/layout/SseBridge';
import { AppToaster } from '@/lib/components/ui/toaster';
import { Layout } from '@/lib/layout';

export type RouterContext = {
  queryClient: QueryClient;
};

const title = 'Good Job';
const description = 'Employee recognition and rewards';
const url = 'https://example.com';

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      { name: 'theme-color', content: '#1a56cc' },
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:url', content: url },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <Layout>
        <Outlet />
      </Layout>
      <AppToaster />
      <SseBridge />
      <TanStackDevtools
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          {
            name: 'TanStack Query',
            render: <ReactQueryDevtoolsPanel />,
          },
        ]}
      />
    </>
  ),
});
