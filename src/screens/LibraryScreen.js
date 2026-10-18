import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import SegmentedControl from '../components/SegmentedControl';
import StoryCard from '../components/StoryCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import useAsync from '../hooks/useAsync';
import { fetchAllStories } from '../services/storyService';
import { useLibrary } from '../context/LibraryContext';
import { colors, spacing } from '../theme/theme';

const SEGMENTS = ['Saved', 'Reading', 'Finished'];

export default function LibraryScreen({ navigation }) {
  const { savedIds, isSaved, toggleSaved } = useLibrary();
  const [segment, setSegment] = useState('Saved');
  const all = useAsync(fetchAllStories, []);

  const openStory = (story) => navigation.openStory(story.id);

  let body;
  if (segment === 'Reading') {
    body = (
      <EmptyState
        icon="book-outline"
        title="Nothing in progress"
        message="Stories you start reading will appear here so you can pick up where you left off."
        actionLabel="Find a story"
        onAction={() => navigation.navigate('Discover')}
      />
    );
  } else if (segment === 'Finished') {
    body = (
      <EmptyState
        icon="checkmark-done-outline"
        title="No finished stories yet"
        message="Stories you complete will be collected here."
        actionLabel="Find a story"
        onAction={() => navigation.navigate('Discover')}
      />
    );
  } else if (all.loading && !all.data) {
    body = <LoadingState label={'Loading your library…'} />;
  } else if (all.error && !all.data) {
    body = <ErrorState message={all.error.message} onRetry={all.reload} />;
  } else {
    // Keep most-recently-saved first (savedIds is ordered newest first).
    const byId = Object.fromEntries((all.data || []).map((s) => [s.id, s]));
    const saved = savedIds.map((id) => byId[id]).filter(Boolean);

    body =
      saved.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="Your library is empty"
          message="Tap the bookmark on any story to save it here for later."
          actionLabel="Discover stories"
          onAction={() => navigation.navigate('Discover')}
        />
      ) : (
        <>
          {all.error ? <ErrorState compact message={all.error.message} onRetry={all.reload} /> : null}
          {saved.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              variant="compact"
              onPress={openStory}
              saved={isSaved(story.id)}
              onToggleSave={toggleSaved}
            />
          ))}
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
            refreshing={all.refreshing}
            onRefresh={all.refresh}
            tintColor={colors.violet}
            colors={[colors.violet]}
          />
        }
      >
        <Header title="Library" subtitle="Everything you've saved and started." />
        <SegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} />
        <View style={styles.spacer} />
        {body}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  spacer: { height: spacing.lg },
});
