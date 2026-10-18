import React from 'react';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';
import { LibraryProvider } from './src/context/LibraryContext';
import { NoticeProvider } from './src/context/NoticeContext';

export default function App() {
  return (
    <ErrorBoundary>
      <LibraryProvider>
        <NoticeProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </NoticeProvider>
      </LibraryProvider>
    </ErrorBoundary>
  );
}
