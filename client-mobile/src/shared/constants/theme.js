export const theme = {
  colors: {
    // Background colors
    background: '#141823',
    surface: '#1b202b',
    
    // Primary green colors (matching web)
    primary: '#83fb7f',
    primaryDark: '#298f5f',
    primaryDarker: '#20764e',
    primaryHover: '#62e75f',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textMuted: '#6b7280',
    
    // Border colors
    border: '#1e2530',
    borderLight: '#2d3748',
    
    // Status colors
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    purple: '#8b5cf6',
    
    // Component specific
    card: '#1b202b',
    cardBorder: '#1e2530',
    input: '#1e2530',
    inputBorder: '#2d3748',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Chart colors
    chart1: '#83fb7f',
    chart2: '#3b82f6',
    chart3: '#8b5cf6',
    chart4: '#f59e0b',
    chart5: '#ef4444',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export default theme;
