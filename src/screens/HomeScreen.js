import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import IconButton from '../components/IconButton';
import SectionHeader from '../components/SectionHeader';
import StoryCard from '../components/StoryCard';
import CreatorCard from '../components/CreatorCard';
import GenreTile from '../components/GenreTile';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import useAsync from '../hooks/useAsync';
import { fetchHomeFeed } from '../services/storyService';
import { useLibrary } from '../context/LibraryContext';
import { useNotice } from '../context/NoticeContext';
import { currentUser } from '../data/currentUser';
import { colors, spacing } from '../theme/theme';
import { greeting } from '../utils/format';

export default function HomeScreen({ navigation }) {
  const { showNotice } = useNotice();
  const { isSaved, toggleSaved } = useLibrary();
  const feed = useAsync(fetchHomeFeed, []);

  const openStory = (story) => navigation.openStory(story.id);
  const openCreator = (creator) => navigation.openCreator(creator.id);

  const data = feed.data;
  const firstName = currentUser.name.split(' ')[0];

  const storyList = (list, emphasis) =>
    list.map((story) => (
      <StoryCard
        key={story.id}
        story={story}
        variant="compact"
        emphasis={emphasis}
        onPress={openStory}
        saved={isSaved(story.id)}
        onToggleSave={toggleSaved}
      />
    ));

  let body;
  if (feed.loading && !data) {
    body = <LoadingState />;
  } else if (feed.error && !data) {
    body = <ErrorState message={feed.error.message} onRetry={feed.reload} />;
  } else if (!data || (data.featured.length === 0 && data.trending.length === 0)) {
    body = (
      <EmptyState
        icon="book-outline"
        title="No stories yet"
        message="New stories will show up here as creators publish them."
        actionLabel="Refresh"
        onAction={feed.reload}
      />
    );
  } else {
    body = (
      <>
        {feed.error ? <ErrorState compact message={feed.error.message} onRetry={feed.reload} /> : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscroll}>
          {data.featured.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              variant="featured"
              onPress={openStory}
              saved={isSaved(story.id)}
              onToggleSave={toggleSaved}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Browse by genre" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscroll}>
          {data.genres.map((genre, index) => (
            <GenreTile
              key={genre.name}
              name={genre.name}
              count={genre.count}
              icon={genre.icon}
              accent={index % 2 === 0 ? 'violet' : 'coral'}
              onPress={() => navigation.navigate('Discover', { genre: genre.name })}
            />
          ))}
        </ScrollView>

        <SectionHeader
          title="Trending now"
          actionLabel="See all"
          onAction={() => navigation.navigate('Discover', { sort: 'Popular' })}
        />
        {storyList(data.trending, 'popularity')}

        <SectionHeader title="Recommended storytellers" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscroll}>
          {data.recommended.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} reason={creator.reason} onPress={openCreator} />
          ))}
        </ScrollView>

        <SectionHeader
          title="Recently published"
          actionLabel="See all"
          onAction={() => navigation.navigate('Discover', { sort: 'Newest' })}
        />
        {storyList(data.recent, 'newest')}
      </>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={feed.refreshing}
            onRefresh={feed.refresh}
            tintColor={colors.violet}
            colors={[colors.violet]}
          />
        }
      >
        <Header
          eyebrow={greeting()}
          title={`Welcome back, ${firstName}`}
          subtitle="Pick up a story or find your next obsession."
          right={
            <IconButton
              name="notifications-outline"
              label="Notifications"
              onPress={() =>
                showNotice(
                  'Notifications',
                  'Activity from creators you follow will appear here in a later phase.',
                  'notifications-outline'
                )
              }
            />
          }
        />
        {body}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  hscroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  bottomSpace: { height: spacing.lg },
});
