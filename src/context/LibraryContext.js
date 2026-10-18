import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// In-memory saved stories. Persistence (AsyncStorage / backend) comes in a later phase.
const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [savedIds, setSavedIds] = useState([]);

  const toggleSaved = useCallback((id) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }, []);

  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  const value = useMemo(() => ({ savedIds, toggleSaved, isSaved }), [savedIds, toggleSaved, isSaved]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return ctx;
}
