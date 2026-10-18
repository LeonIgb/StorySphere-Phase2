import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import BackHeader from '../components/BackHeader';
import CreatorAvatar from '../components/CreatorAvatar';
import Chip from '../components/Chip';
import SectionHeader from '../components/SectionHeader';
import StoryCard from '../components/StoryCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import useAsync from '../hooks/useAsync';
import { fetchCreator } from '../services/storyService';
import { useLibrary } from '../context/LibraryContext';
import { colors, genreIcons, radius, spacing, typography } from '../theme/theme';
import { formatCount, formatRating } from '../utils/format';

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Storyteller page: profile, stats and their stories. (Following arrives with accounts, later.)
export default function CreatorScreen({ creatorId, navigation }) {
  const { isSaved, toggleSaved } = useLibrary();
  const detail = useAsync(() => fetchCreator(creatorId), [creatorId]);

  const creator = detail.data ? detail.data.creator : null;
  const list = detail.data ? detail.data.stories : [];
  const averageRating = detail.data ? detail.data.averageRating : null;

  let body;
  if (detail.loading && !detail.data) {
    body = <LoadingState label={'Loading storyteller…'} />;
  } else if (detail.error && !detail.data) {
    body = <ErrorState message={detail.error.message} onRetry={detail.reload} />;
  } else if (!creator) {
    body = (
      <EmptyState
        icon="person-outline"
        title="Storyteller not found"
        message="This profile may have been removed or the link is out of date."
        actionLabel="Go back"
        onAction={navigation.goBack}
      />
    );
  } else {
    body = (
      <>
        <View style={styles.card}>
          <CreatorAvatar creator={creator} size={84} />
          <Text style={styles.name}>{creator.name}</Text>
          <View style={styles.handleRow}>
            <Text style={styles.handle}>{creator.handle}</Text>
            {creator.verified ? (
              <View style={styles.verified}>
                <Ionicons name="checkmark-circle" size={14} color={colors.coral} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.bio}>{creator.bio}</Text>

          <View style={styles.statsRow}>
            <Stat value={formatCount(creator.followers)} label="Followers" />
            <View style={styles.divider} />
            <Stat value={String(creator.storyCount)} label="Stories" />
            <View style={styles.divider} />
            <Stat value={averageRating ? formatRating(averageRating) : '–'} label="Avg rating" />
          </View>
        </View>

        <SectionHeader title="Genres" />
        <View style={styles.chipRow}>
          {(creator.genres || [creator.specialty]).map((g) => (
            <Chip
              key={g}
              label={g}
              icon={genreIcons[g]}
              onPress={() => navigation.navigate('Discover', { genre: g })}
              style={styles.chip}
            />
          ))}
        </View>

        <SectionHeader title={`Stories by ${creator.name.split(' ')[0]}`} />
        {list.length === 0 ? (
          <EmptyState
            icon="book-outline"
            title="No stories yet"
            message="Stories from this storyteller will appear here once they publish."
          />
        ) : (
          list.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              variant="compact"
              emphasis="popularity"
              onPress={() => navigation.openStory(story.id)}
              saved={isSaved(story.id)}
              onToggleSave={toggleSaved}
            />
          ))
        )}
      </>
    );
  }

  return (
    <ScreenContainer>
      <BackHeader title={creator ? creator.name : ''} onBack={navigation.goBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {body}
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
  handleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  handle: { ...typography.caption, color: colors.coral },
  verified: { flexDirection: 'row', alignItems: 'center', marginLeft: spacing.sm },
  verifiedText: { ...typography.caption, fontSize: 12, color: colors.textOnDarkMuted, marginLeft: 3 },
  bio: { ...typography.body, color: colors.textOnDarkMuted, textAlign: 'center', marginTop: spacing.md },
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
  chip: { marginBottom: spacing.sm },
});
