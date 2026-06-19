import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import theme from '../../../shared/constants/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.text} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={textStyles}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconLeft: {
    marginRight: theme.spacing.sm,
  },

  iconRight: {
    marginLeft: theme.spacing.sm,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  danger: {
    backgroundColor: theme.colors.danger,
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },

  // Text variants
  primaryText: {
    color: theme.colors.text,
  },
  
  secondaryText: {
    color: theme.colors.text,
  },
  
  dangerText: {
    color: theme.colors.text,
  },
  
  ghostText: {
    color: theme.colors.primary,
  },

  // Sizes
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
  },
  
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 52,
  },

  // Text sizes
  smallText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  
  mediumText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  
  largeText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  
  disabledText: {
    opacity: 0.5,
  },

  text: {
    textAlign: 'center',
  },
});

export default Button;
