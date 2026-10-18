import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import IconButton from './IconButton';
import { colors, spacing, typography } from '../theme/theme';

// Top bar for detail screens: back button, optional centered title, optional right action.
export default function BackHeader({ title, onBack, right }) {
  return (
    <View style={styles.bar}>
      <IconButton name="arrow-back" label="Go back" onPress={onBack} />
      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title || ''}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    flex: 1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  right: { width: 42, height: 42, alignItems: 'flex-end', justifyContent: 'center' },
});
