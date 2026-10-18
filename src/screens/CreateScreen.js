import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import { useNotice } from '../context/NoticeContext';
import { colors, radius, shadows, spacing, typography } from '../theme/theme';

// Phase 1: the creator hub shell. Tools are visible but intentionally not built yet.
const CREATE_OPTIONS = [
  {
    key: 'write',
    icon: 'create-outline',
    title: 'Write a story',
    description: 'Draft chapters with a distraction-free editor.',
    accent: colors.coral,
    accentSoft: colors.coralSoft,
  },
  {
    key: 'audio',
    icon: 'mic-outline',
    title: 'Record an audio story',
    description: 'Narrate your story and share it as an episode.',
    accent: colors.violet,
    accentSoft: colors.violetSoft,
  },
  {
    key: 'visual',
    icon: 'image-outline',
    title: 'Share a visual story',
    description: 'Combine illustrations or photos with short text.',
    accent: colors.indigo500,
    accentSoft: colors.indigo100,
  },
];

export default function CreateScreen() {
  const { showNotice } = useNotice();

  const comingSoon = (title) =>
    showNotice(title, 'This creator tool is coming in a later phase. Your studio is being prepared.', 'construct-outline');

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header title="Create" subtitle="Your studio for stories, audio and visuals." />

        {CREATE_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => comingSoon(option.title)}
            accessibilityRole="button"
            accessibilityLabel={option.title}
            style={({ pressed }) => [styles.card, shadows.card, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, { backgroundColor: option.accentSoft }]}>
              <Ionicons name={option.icon} size={26} color={option.accent} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.indigo300} />
          </Pressable>
        ))}

        <SectionHeader title="Your drafts" />
        <EmptyState
          icon="document-text-outline"
          title="No drafts yet"
          message="Everything you start writing will be saved here, ready to finish or publish."
          actionLabel="Start your first story"
          onAction={() => comingSoon('Write a story')}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream50,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cream300,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, marginHorizontal: spacing.md },
  cardTitle: { ...typography.heading, color: colors.textPrimary },
  cardDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
