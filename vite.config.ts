import babel from '@rolldown/plugin-babel';
import { devtools as tanstackDevtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import checker from 'vite-plugin-checker';
import type { VitePWAOptions } from 'vite-plugin-pwa';
import { VitePWA } from 'vite-plugin-pwa';
import type { PluginOption } from 'vite-plus';
import { defineConfig } from 'vite-plus';

const pwaOptions: Partial<VitePWAOptions> = {
  disable: true,
  registerType: 'autoUpdate',
  manifest: {
    short_name: 'good-job',
    name: 'Good Job',
    lang: 'en',
    start_url: '/',
    background_color: '#FFFFFF',
    theme_color: '#FFFFFF',
    dir: 'ltr',
    display: 'standalone',
    prefer_related_applications: false,
  },
  pwaAssets: {
    disabled: false,
    config: true,
  },
};

const isReactCompilerEnabled =
  process.env.VITE_PLUGIN_REACT_COMPILER === 'true';

const COVERAGE_INCLUDE: ReadonlyArray<string> = [
  'src/lib/components/kudos/**/*.{ts,tsx}',
  'src/lib/components/rewards/**/*.{ts,tsx}',
  'src/lib/components/reward/**/*.{ts,tsx}',
  'src/lib/components/pagination/**/*.{ts,tsx}',
  'src/lib/pages/admin/rewards/**/*.{ts,tsx}',
  'src/lib/pages/feed/**/*.{ts,tsx}',
  'src/lib/pages/login/**/*.{ts,tsx}',
  'src/lib/pages/rewards/**/*.{ts,tsx}',
  'src/lib/hooks/useGivingBudget.ts',
  'src/lib/hooks/useKudoFeed.ts',
  'src/lib/hooks/useKudoForm.ts',
  'src/lib/hooks/useLogin.ts',
  'src/lib/hooks/useLogout.ts',
  'src/lib/hooks/useMediaUpload.ts',
  'src/lib/hooks/useMe.ts',
  'src/lib/hooks/useNotifications.ts',
  'src/lib/hooks/useOffsetPagination.ts',
  'src/lib/hooks/useReaction.ts',
  'src/lib/hooks/useRedeem.ts',
  'src/lib/hooks/useResponsivePagination.ts',
  'src/lib/hooks/useRewardFilter.ts',
  'src/lib/hooks/useRewards.ts',
  'src/lib/hooks/useSSE.ts',
  'src/lib/services/api.ts',
  'src/lib/services/sessionAccessToken.ts',
  'src/lib/services/kudos.ts',
  'src/lib/services/queryKeys.ts',
  'src/lib/services/rewards-catalog-params.ts',
  'src/lib/services/rewards.ts',
  'src/lib/services/users.ts',
  'src/lib/utils/format/**/*.ts',
  'src/lib/utils/paginate.ts',
  'src/lib/utils/validate/file-validation.ts',
  'src/lib/utils/validate/validate-quantity-total.ts',
  'src/lib/utils/cache/query-cache.ts',
  'src/lib/validations/kudo.validation.ts',
  'src/lib/constants/media.ts',
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isCheckDisabled = mode === 'production' || !!process.env.VITEST;
  return {
    lint: { options: { typeAware: true, typeCheck: true } },
    staged: {
      'src/**/*.{js,jsx,ts,tsx,json,css,scss,md}': ['ultracite fix'],
      '*.{ts,js,json,md}': ['ultracite fix'],
    },
    plugins: [
      tanstackDevtools(),
      tanstackRouter({ autoCodeSplitting: true }),
      react(),
      ...(isReactCompilerEnabled
        ? [
            babel({
              presets: [reactCompilerPreset()],
            }),
          ]
        : []),
      ...(isCheckDisabled
        ? []
        : [
            checker({
              typescript: true,
            }),
          ]),
      visualizer({ template: 'sunburst' }) as unknown as PluginOption,
      VitePWA(pwaOptions),
    ],
    server: {
      port: 3000,
      open: true,
    },
    resolve: {
      tsconfigPaths: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        reportsDirectory: './coverage',
        // include: ['src/**/*.{ts,tsx}'],
        include: [...COVERAGE_INCLUDE],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.spec.{ts,tsx}',
          'src/test/**',
          'src/routeTree.gen.ts',
          '**/*.d.ts',
        ],
      },
    },
  };
});
