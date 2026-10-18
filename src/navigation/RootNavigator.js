import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import TabBar from '../components/TabBar';
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import CreateScreen from '../screens/CreateScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import CreatorScreen from '../screens/CreatorScreen';
import { colors } from '../theme/theme';

// Dependency-free navigation (no React Navigation), so the app runs on any Snack SDK.
//
//  - Five tabs, mounted lazily and kept alive so scroll position and filters survive.
//  - A detail stack (story / creator pages) rendered on top of the tabs.
//
// Screens get a small `navigation` object:
//   navigate(tab, params?)  switch tab (clears the detail stack); params are handed to that tab
//   openStory(id)           push a story page
//   openCreator(id)         push a creator page
//   goBack()                pop the top detail page
export const TABS = [
  { name: 'Home', component: HomeScreen },
  { name: 'Discover', component: DiscoverScreen },
  { name: 'Create', component: CreateScreen },
  { name: 'Library', component: LibraryScreen },
  { name: 'Profile', component: ProfileScreen },
];

export default function RootNavigator() {
  const [active, setActive] = useState('Home');
  const [visited, setVisited] = useState({ Home: true });
  const [stack, setStack] = useState([]);
  const [tabParams, setTabParams] = useState({});
  const nonce = useRef(0);

  const navigate = useCallback((name, params) => {
    if (!TABS.some((t) => t.name === name)) return;
    setStack([]);
    setVisited((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
    if (params) {
      nonce.current += 1;
      const stamped = { ...params, nonce: nonce.current };
      setTabParams((prev) => ({ ...prev, [name]: stamped }));
    }
    setActive(name);
  }, []);

  const push = useCallback((type, id) => {
    if (!id) return;
    setStack((prev) => {
      const top = prev[prev.length - 1];
      if (top && top.type === type && top.id === id) return prev;
      return [...prev, { type, id }];
    });
  }, []);

  const openStory = useCallback((id) => push('story', id), [push]);
  const openCreator = useCallback((id) => push('creator', id), [push]);
  const goBack = useCallback(() => setStack((prev) => prev.slice(0, -1)), []);

  const navigation = useMemo(
    () => ({ navigate, openStory, openCreator, goBack }),
    [navigate, openStory, openCreator, goBack]
  );

  // Android hardware back: close a detail page first, then return to Home, then exit.
  const backState = useRef({ depth: 0, active: 'Home' });
  backState.current = { depth: stack.length, active };
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (backState.current.depth > 0) {
        goBack();
        return true;
      }
      if (backState.current.active !== 'Home') {
        navigate('Home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [goBack, navigate]);

  const top = stack[stack.length - 1];

  return (
    <View style={styles.root}>
      <View style={styles.screens}>
        {TABS.map(({ name, component: Screen }) =>
          visited[name] ? (
            <View
              key={name}
              style={[styles.screen, active !== name && styles.hidden]}
              pointerEvents={active === name ? 'auto' : 'none'}
            >
              <Screen navigation={navigation} params={tabParams[name]} />
            </View>
          ) : null
        )}

        {top ? (
          <View key={`${top.type}-${top.id}-${stack.length}`} style={styles.overlay}>
            {top.type === 'story' ? (
              <StoryDetailScreen storyId={top.id} navigation={navigation} />
            ) : (
              <CreatorScreen creatorId={top.id} navigation={navigation} />
            )}
          </View>
        ) : null}
      </View>
      <TabBar tabs={TABS.map((t) => t.name)} active={active} onChange={navigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream100 },
  screens: { flex: 1 },
  screen: { ...StyleSheet.absoluteFillObject },
  hidden: { display: 'none' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.cream100 },
});
