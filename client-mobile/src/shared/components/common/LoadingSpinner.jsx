import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import theme from '../../../shared/constants/theme';

const LoadingSpinner = ({
  size = 'large',
  color,
  text,
  fullScreen = false,
}) => {
  const spinnerColor = color || theme.colors.primary;

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={spinnerColor} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },

  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },

  text: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default LoadingSpinner;
