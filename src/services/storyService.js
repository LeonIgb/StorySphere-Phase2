// Mock data service. Every call is async and can fail, so screens are built
// around real loading and error states. Swap the internals for a real API later
// without touching the screens.

import { stories, GENRES } from '../data/stories';
import { creators } from '../data/creators';
import { currentUser } from '../data/currentUser';
import { genreIcons } from '../theme/theme';
import {
  filterStories,
  genreSummary,
  matchCreators,
  recentStories,
  recommendCreators,
  sortStories,
  trendingStories,
} from '../utils/discovery';
import { DEFAULT_SORT } from '../data/discoveryOptions';

let simulateFailure = false;

export function setSimulateFailure(value) {
  simulateFailure = Boolean(value);
}

export function getSimulateFailure() {
  return simulateFailure;
}

// Creators with a story count derived from the sample stories.
const creatorList = creators.map((c) => ({
  ...c,
  storyCount: stories.filter((s) => s.creatorId === c.id).length,
}));
const creatorById = Object.fromEntries(creatorList.map((c) => [c.id, c]));

function withCreator(story) {
  return { ...story, creator: creatorById[story.creatorId] || null };
}

const allStories = stories.map(withCreator);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function guarded(producer, ms = 650) {
  await delay(ms);
  if (simulateFailure) {
    throw new Error('We could not reach StorySphere. Check your connection and try again.');
  }
  return producer();
}

const byFollowers = (a, b) => b.followers - a.followers;

export function fetchHomeFeed() {
  return guarded(() => ({
    featured: allStories.filter((s) => s.featured),
    trending: trendingStories(allStories, 4),
    recent: recentStories(allStories, 5),
    recommended: recommendCreators(creatorList, currentUser.interests, 6),
    genres: genreSummary(allStories, GENRES.slice(1), genreIcons),
  }));
}

// Stories matching the query/filters (sorted), plus creators matching the query.
export function searchStories({
  query = '',
  genre = 'All',
  mediaType = 'All',
  access = 'All',
  sort = DEFAULT_SORT,
} = {}) {
  return guarded(() => {
    const found = sortStories(filterStories(allStories, { query, genre, mediaType, access }), sort);
    return { stories: found, creators: matchCreators(creatorList, query).sort(byFollowers) };
  }, 450);
}

export function fetchCreators() {
  return guarded(() => [...creatorList].sort(byFollowers), 500);
}

export function fetchAllStories() {
  return guarded(() => allStories, 400);
}

// Resolves to null when the id is unknown (screens show a "not found" state).
export function fetchStory(id) {
  return guarded(() => {
    const story = allStories.find((s) => s.id === id);
    if (!story) return null;
    const related = sortStories(
      allStories.filter((s) => s.id !== id && s.genre === story.genre),
      'Popular'
    ).slice(0, 6);
    return { story, related };
  }, 400);
}

export function fetchCreator(id) {
  return guarded(() => {
    const creator = creatorById[id];
    if (!creator) return null;
    const theirStories = sortStories(
      allStories.filter((s) => s.creatorId === id),
      'Popular'
    );
    const ratings = theirStories.reduce((sum, s) => sum + s.ratingCount, 0);
    const averageRating = ratings
      ? theirStories.reduce((sum, s) => sum + s.rating * s.ratingCount, 0) / ratings
      : null;
    return { creator, stories: theirStories, averageRating };
  }, 400);
}
