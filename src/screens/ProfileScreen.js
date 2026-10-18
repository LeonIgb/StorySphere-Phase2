import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import SectionHeader from '../components/SectionHeader';
import CreatorAvatar from '../components/CreatorAvatar';
import Chip from '../components/Chip';
import { useNotice } from '../context/NoticeContext';
import { useLibrary } from '../context/LibraryContext';
import { currentUser } from '../data/currentUser';
import { getSimulateFailure, setSimulateFailure } from '../services/storyService';
import { colors, radius, spacing, typography } from '../theme/theme';
import { formatCount } from '../utils/format';

const SETTINGS = [
  { key: 'edit', icon: 'person-circle-outline', label: 'Edit profile', note: 'Profile editing arrives in a later phase.' },
  { key: 'notifications', icon: 'notifications-outline', label: 'Notifications', note: 'Notification preferences arrive in a later phase.' },
  { key: 'privacy', icon: 'shield-checkmark-outline', label: 'Privacy & safety', note: 'Privacy controls arrive in a later phase.' },
  { key: 'help', icon: 'help-circle-outline', label: 'Help & feedback', note: 'Help and feedback arrive in a later phase.' },
];

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{formatCount(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { showNotice } = useNotice();
  const { savedIds } = useLibrary();
  const [failureOn, setFailureOn] = useState(getSimulateFailure());

  const toggleFailure = (value) => {
    setSimulateFailure(value);
    setFailureOn(value);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header title="Profile" />

        <View style={styles.card}>
          <CreatorAvatar creator={currentUser} size={78} />
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.handle}>{currentUser.handle}</Text>
          <Text style={styles.bio}>{currentUser.bio}</Text>

          <View style={styles.statsRow}>
            <Stat value={currentUser.stats.stories} label="Stories" />
            <View style={styles.divider} />
            <Stat value={currentUser.stats.followers} label="Followers" />
            <View style={styles.divider} />
            <Stat value={currentUser.stats.following} label="Following" />
            <View style={styles.divider} />
            <Stat value={savedIds.length} label="Saved" />
          </View>
        </View>

        <SectionHeader title="Interests" />
        <View style={styles.chipRow}>
          {currentUser.interests.map((interest) => (
            <Chip key={interest} label={interest} selected />
          ))}
        </View>

        <SectionHeader title="Account" />
        <View style={styles.list}>
          {SETTINGS.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={() => showNotice(item.label, item.note, item.icon)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                styles.row,
                index < SETTINGS.length - 1 && styles.rowBorder,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name={item.icon} size={22} color={colors.indigo500} />
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.indigo300} />
            </Pressable>
          ))}
        </View>

        <SectionHeader title="Developer tools" />
        <View style={styles.list}>
          <View style={styles.row}>
            <Ionicons name="cloud-offline-outline" size={22} color={colors.coralDark} />
            <View style={styles.rowTextBlock}>
              <Text style={styles.rowLabelInline}>Simulate network errors</Text>
              <Text style={styles.rowHint}>Then pull to refresh on any tab to see error states.</Text>
            </View>
            <Switch
              value={failureOn}
              onValueChange={toggleFailure}
              trackColor={{ false: colors.cream300, true: colors.coral }}
              thumbColor={colors.white}
              accessibilityLabel="Simulate network errors"
            />
          </View>
        </View>

        <Text style={styles.version}>{'StorySphere · Phase 1 foundation'}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.indigo900,
    borderRadius: radius.xl,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  name: { ...typography.title, color: colors.textOnDark, marginTop: spacing.md },
  handle: { ...typography.caption, color: colors.coral, marginTop: 2 },
  bio: {
    ...typography.body,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    alignSelf: 'stretch',
    backgroundColor: colors.indigo800,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.heading, color: colors.textOnDark },
  statLabel: { ...typography.caption, fontSize: 11, color: colors.textOnDarkMuted, marginTop: 2 },
  divider: { width: 1, height: 28, backgroundColor: colors.indigo700 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl },
  list: {
    backgroundColor: colors.cream50,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cream300,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.cream200 },
  rowLabel: { ...typography.body, flex: 1, color: colors.textPrimary, marginLeft: spacing.md },
  rowTextBlock: { flex: 1, marginHorizontal: spacing.md },
  rowLabelInline: { ...typography.body, color: colors.textPrimary },
  rowHint: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  version: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
