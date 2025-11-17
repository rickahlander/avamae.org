'use client';

import { createTheme } from '@mui/material/styles';

// Warm & Welcoming Color Palette
const colors = {
  warmGold: '#D4AF37',      // Primary - tree of life, lasting legacy
  softGreen: '#8FBC8F',     // Secondary - growth, renewal
  warmCoral: '#FF7F50',     // Accent - heart, connection
  warmWhite: '#FAF9F6',     // Background
  charcoal: '#36454F',      // Text
  lightGray: '#E8E8E8',     // Borders
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.warmGold,
      light: '#E5C766',
      dark: '#B8962D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.softGreen,
      light: '#A8CCA8',
      dark: '#6FA76F',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: colors.warmCoral,
    },
    info: {
      main: '#1976D2',
    },
    success: {
      main: colors.softGreen,
    },
    background: {
      default: colors.warmWhite,
      paper: '#FFFFFF',
    },
    text: {
      primary: colors.charcoal,
      secondary: '#5A6C7D',
    },
    divider: colors.lightGray,
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: [
        '"Playfair Display"',
        'Georgia',
        'serif',
      ].join(','),
      fontWeight: 700,
    },
    h2: {
      fontFamily: [
        '"Playfair Display"',
        'Georgia',
        'serif',
      ].join(','),
      fontWeight: 600,
    },
    h3: {
      fontFamily: [
        '"Playfair Display"',
        'Georgia',
        'serif',
      ].join(','),
      fontWeight: 600,
    },
    h4: {
      fontFamily: [
        '"Playfair Display"',
        'Georgia',
        'serif',
      ].join(','),
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Rounded, friendly shapes
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
  },
});
