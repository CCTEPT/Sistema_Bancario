import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../../../shared/constants/theme';

const EmptyState = ({
  icon = 'inbox',
  title = 'No data found',
  description,
  action,
}) => {
  return (
    <View style={styles.container}>
      <MaterialIcons
        name={icon}
        size={64}
        color={theme.colors.textMuted}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },

  icon: {
    marginBottom: theme.spacing.lg,
  },

  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },

  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },

  action: {
    marginTop: theme.spacing.md,
  },
});

export default EmptyState;
