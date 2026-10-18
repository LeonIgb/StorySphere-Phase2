import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import BackHeader from '../components/BackHeader';
import IconButton from '../components/IconButton';
import AccessBadge from '../components/AccessBadge';
import Button from '../components/Button';
import Chip from '../components/Chip';
import CreatorAvatar from '../components/CreatorAvatar';
import SectionHeader from '../components/SectionHeader';
import StoryCard from '../components/StoryCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import useAsync from '../hooks/useAsync';
import { fetchStory } from '../services/storyService';
import { useLibrary } from '../context/LibraryContext';
import { useNotice } from '../context/NoticeContext';
import { colors, mediaIcons, radius, spacing, typography } from '../theme/theme';
import { formatCount, formatRating, timeAgo } from '../utils/format';

function Stat({ icon, iconColor, value, label }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValueRow}>
        <Ionicons name={icon} size={15} color={iconColor || colors.indigo500} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Story preview page. The reader itself arrives in a later phase.
export default function StoryDetailScreen({ storyId, navigation }) {
  const { showNotice } = useNotice();
  const { isSaved, toggleSaved } = useLibrary();
  const detail = useAsync(() => fetchStory(storyId), [storyId]);

  const story = detail.data ? detail.data.story : null;
  const related = detail.data ? detail.data.related : [];
  const saved = story ? isSaved(story.id) : false;

  let body;
  if (detail.loading && !detail.data) {
    body = <LoadingState label={'Loading story…'} />;
  } else if (detail.error && !detail.data) {
    body = <ErrorState message={detail.error.message} onRetry={detail.reload} />;
  } else if (!story) {
    body = (
      <EmptyState
        icon="book-outline"
        title="Story not found"
        message="This story may have been removed or the link is out of date."
        actionLabel="Go back"
        onAction={navigation.goBack}
      />
    );
  } else {
    const premium = story.access === 'Premium';
    const media = story.mediaType || 'Written';
    const creator = story.creator;

    body = (
      <>
        <View style={[styles.cover, { backgroundColor: story.coverColor || colors.indigo700 }]}>
          <Ionicons name={story.icon || 'book'} size={72} color="rgba(251, 246, 236, 0.92)" />
          <View style={styles.coverMedia}>
            <Ionicons name={mediaIcons[media] || 'document-text'} size={13} color={colors.textOnDark} />
            <Text style={styles.coverMediaText}>{media.toUpperCase()}</Text>
          </View>
          <AccessBadge access={story.access} onCover style={styles.coverAccess} />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.genre}>{story.genre.toUpperCase()}</Text>
          <Text style={styles.title}>{story.title}</Text>

          {creator ? (
            <Pressable
              onPress={() => navigation.openCreator(creator.id)}
              accessibilityRole="button"
              accessibilityLabel={`View ${creator.name}`}
              style={({ pressed }) => [styles.creatorRow, pressed && { opacity: 0.8 }]}
            >
              <CreatorAvatar creator={creator} size={40} />
              <View style={styles.creatorText}>
                <Text style={styles.creatorName}>{creator.name}</Text>
                <Text style={styles.creatorHandle}>{creator.handle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.indigo300} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <Stat icon="star" iconColor={colors.gold} value={formatRating(story.rating)} label={`${formatCount(story.ratingCount)} ratings`} />
          <View style={styles.divider} />
          <Stat icon="heart" iconColor={colors.coral} value={formatCount(story.likes)} label="Likes" />
          <View style={styles.divider} />
          <Stat icon="time-outline" value={`${story.readMinutes}m`} label={media === 'Video' ? 'Runtime' : 'Length'} />
          <View style={styles.divider} />
          <Stat icon="albums-outline" value={String(story.chapters)} label="Chapters" />
        </View>

        <Text style={styles.published}>Published {timeAgo(story.daysAgo)}</Text>
        <Text style={styles.blurb}>{story.blurb}</Text>

        {premium ? (
          <View style={styles.premiumNote}>
            <Ionicons name="lock-closed" size={18} color={colors.coralDark} />
            <Text style={styles.premiumText}>
              This is a premium story. Premium access arrives with accounts and memberships in a later phase.
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {premium ? (
            <Button
              title="Unlock with Premium"
              icon="lock-closed"
              variant="accent"
              fullWidth
              onPress={() =>
                showNotice(
                  'Premium is coming',
                  'Memberships and payments are not part of this build yet. Save the story to your Library to find it again.',
                  'lock-closed-outline'
                )
              }
            />
          ) : (
            <Button
              title="Start reading"
              icon="book-outline"
              fullWidth
              onPress={() =>
                showNotice(
                  'The reader is coming',
                  'The story reader arrives in a later phase. Save this story to your Library to find it again.',
                  'book-outline'
                )
              }
            />
          )}
          <Button
            title={saved ? 'Saved to library' : 'Save to library'}
            icon={saved ? 'bookmark' : 'bookmark-outline'}
            variant="secondary"
            fullWidth
            style={styles.secondaryAction}
            onPress={() => toggleSaved(story.id)}
          />
        </View>

        {story.tags && story.tags.length > 0 ? (
          <>
            <SectionHeader title="Tags" />
            <View style={styles.tagRow}>
              {story.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  onPress={() => navigation.navigate('Discover', { query: tag })}
                  style={styles.tag}
                />
              ))}
            </View>
          </>
        ) : null}

        {related.length > 0 ? (
          <>
            <SectionHeader
              title={`More ${story.genre}`}
              actionLabel="See all"
              onAction={() => navigation.navigate('Discover', { genre: story.genre })}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscroll}>
              {related.map((item) => (
                <StoryCard
                  key={item.id}
                  story={item}
                  variant="tile"
                  onPress={() => navigation.openStory(item.id)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}
      </>
    );
  }

  return (
    <ScreenContainer>
      <BackHeader
        title={story ? story.genre : ''}
        onBack={navigation.goBack}
        right={
          story ? (
            <IconButton
              name={saved ? 'bookmark' : 'bookmark-outline'}
              label={saved ? 'Remove from library' : 'Save to library'}
              color={saved ? colors.coral : colors.indigo900}
              onPress={() => toggleSaved(story.id)}
            />
          ) : null
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {body}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  hscroll: { paddingHorizontal: spacing.xl },
  cover: {
    height: 210,
    borderRadius: radius.xl,
    marginHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverMedia: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 15, 46, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  coverMediaText: { ...typography.micro, fontSize: 10, color: colors.textOnDark, marginLeft: 5 },
  coverAccess: { position: 'absolute', right: spacing.md, top: spacing.md },
  titleBlock: { paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  genre: { ...typography.micro, color: colors.coralDark },
  title: { ...typography.display, fontSize: 26, color: colors.textPrimary, marginTop: spacing.xs },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream50,
    borderWidth: 1,
    borderColor: colors.cream300,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  creatorText: { flex: 1, marginLeft: spacing.md },
  creatorName: { ...typography.heading, fontSize: 15, color: colors.textPrimary },
  creatorHandle: { ...typography.caption, color: colors.textSecondary },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.indigo900,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValueRow: { flexDirection: 'row', alignItems: 'center' },
  statValue: { ...typography.heading, fontSize: 16, color: colors.textOnDark, marginLeft: 4 },
  statLabel: { ...typography.caption, fontSize: 11, color: colors.textOnDarkMuted, marginTop: 2 },
  divider: { width: 1, height: 28, backgroundColor: colors.indigo700 },
  published: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  blurb: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  premiumNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.coralSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  premiumText: { ...typography.caption, flex: 1, color: colors.textPrimary, marginLeft: spacing.md, lineHeight: 18 },
  actions: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  secondaryAction: { marginTop: spacing.md },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl },
  tag: { marginBottom: spacing.sm },
});
