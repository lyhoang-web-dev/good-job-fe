import { createSystem, defaultConfig } from '@chakra-ui/react';

/** Good Job — Warm Studio (Chakra tokens + global CSS vars in index.css) */
export const theme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Fraunces', Georgia, serif" },
        body: { value: "'DM Sans', system-ui, sans-serif" },
        mono: { value: "'DM Mono', ui-monospace, monospace" },
      },
      colors: {
        brand: {
          ink: { value: '#1A1A2E' },
          inkHover: { value: '#2D2D4E' },
          coral: { value: '#FF6B6B' },
          gold: { value: '#FFB347' },
          sage: { value: '#6BAE8A' },
        },
        surface: {
          base: { value: '#FAFAF8' },
          cream: { value: '#F4F1EC' },
          elevated: { value: '#FFFFFF' },
        },
        text: {
          primary: { value: '#1A1A2E' },
          secondary: { value: '#6B6B7A' },
          muted: { value: '#A0A0B0' },
        },
        border: {
          subtle: { value: 'rgba(26, 26, 46, 0.08)' },
          medium: { value: 'rgba(26, 26, 46, 0.15)' },
        },
        coreValue: {
          teamwork: { value: '#4ECDC4' },
          ownership: { value: '#FF8C42' },
          innovation: { value: '#9B59B6' },
          integrity: { value: '#27AE60' },
          customer_focus: { value: '#3498DB' },
        },
      },
      radii: {
        card: { value: '16px' },
        input: { value: '12px' },
        pill: { value: '999px' },
      },
      shadows: {
        card: {
          value:
            '0 1px 3px rgba(26,26,46,0.06), 0 4px 16px rgba(26,26,46,0.04)',
        },
        cardHover: { value: '0 4px 20px rgba(26,26,46,0.10)' },
        dropdown: { value: '0 8px 32px rgba(26,26,46,0.12)' },
      },
    },
  },
});
