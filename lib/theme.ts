// lib/theme.ts
import { extendTheme } from '@chakra-ui/react';

// Extend the Chakra UI theme for custom styles
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f2ff',
      100: '#b3d9ff',
      200: '#80bfff',
      300: '#4da6ff',
      400: '#1a8cff',
      500: '#0073e6',
      600: '#0059b3',
      700: '#004080',
      800: '#00264d',
      900: '#000d1a',
    },
  },
  fonts: {
    heading: 'var(--font-inter)',
    body: 'var(--font-inter)',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme;