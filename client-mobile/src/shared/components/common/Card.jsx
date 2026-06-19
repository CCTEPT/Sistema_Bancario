import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import theme from '../../../shared/constants/theme';

const Card = ({
  children,
  style,
  padding = 'md',
  shadow = true,
  onPress,
}) => {
  const cardStyles = [
    styles.card,
    styles[padding],
    shadow && theme.shadows.md,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    overflow: 'hidden',
  },

  // Padding variants
  none: {
    padding: 0,
  },

  sm: {
    padding: theme.spacing.sm,
  },

  md: {
    padding: theme.spacing.md,
  },

  lg: {
    padding: theme.spacing.lg,
  },

  xl: {
    padding: theme.spacing.xl,
  },
});

export default Card;
