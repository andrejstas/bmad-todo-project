import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  globalCss: {
    '*:focus-visible': {
      outline: '2px solid #007AFF',
      outlineOffset: '2px',
      boxShadow: 'none',
    },
  },
  theme: {
    tokens: {
      colors: {
        bg: { value: '#FAFAFA' },
        surface: { value: '#FFFFFF' },
        fg: { value: '#1D1D1F' },
        'fg.muted': { value: '#6E6E73' },
        accent: { value: '#007AFF' },
        'accent.hover': { value: '#0066D6' },
        success: { value: '#34C759' },
        danger: { value: '#FF3B30' },
        border: { value: '#E5E5EA' },
        'input.bg': { value: '#F2F2F7' },
      },
      fonts: {
        body: { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
        heading: { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
      },
      fontSizes: {
        title: { value: '20px' },
        counter: { value: '14px' },
        body: { value: '16px' },
      },
      fontWeights: {
        normal: { value: '400' },
        medium: { value: '500' },
        semibold: { value: '600' },
      },
      lineHeights: {
        normal: { value: '1.5' },
      },
      spacing: {
        xs: { value: '4px' },
        sm: { value: '8px' },
        md: { value: '16px' },
        lg: { value: '24px' },
        xl: { value: '32px' },
        '2xl': { value: '48px' },
      },
      radii: {
        card: { value: '12px' },
        checkbox: { value: '6px' },
      },
      shadows: {
        card: { value: '0 1px 3px rgba(0,0,0,0.08)' },
        'input.inset': { value: 'inset 0 1px 2px rgba(0,0,0,0.05)' },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
