import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../../shared/constants/theme';

const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  style,
}) => {
  const badgeStyles = [
    styles.badge,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  text: {
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },

  // Variants
  default: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  defaultText: {
    color: theme.colors.text,
  },

  primary: {
    backgroundColor: `${theme.colors.primary}20`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },

  primaryText: {
    color: theme.colors.primary,
  },

  success: {
    backgroundColor: `${theme.colors.success}20`,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },

  successText: {
    color: theme.colors.success,
  },

  danger: {
    backgroundColor: `${theme.colors.danger}20`,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },

  dangerText: {
    color: theme.colors.danger,
  },

  warning: {
    backgroundColor: `${theme.colors.warning}20`,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },

  warningText: {
    color: theme.colors.warning,
  },

  info: {
    backgroundColor: `${theme.colors.info}20`,
    borderWidth: 1,
    borderColor: theme.colors.info,
  },

  infoText: {
    color: theme.colors.info,
  },

  purple: {
    backgroundColor: `${theme.colors.purple}20`,
    borderWidth: 1,
    borderColor: theme.colors.purple,
  },

  purpleText: {
    color: theme.colors.purple,
  },

  // Sizes
  small: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    minWidth: 60,
  },

  smallText: {
    fontSize: theme.fontSize.xs,
  },

  medium: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minWidth: 80,
  },

  mediumText: {
    fontSize: theme.fontSize.sm,
  },

  large: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minWidth: 100,
  },

  largeText: {
    fontSize: theme.fontSize.md,
  },
});

export default Badge;
