import { useState, useCallback } from 'react';

export type ViewMode = 'grid' | 'list';

interface UseViewModeOptions {
  defaultMode?: ViewMode;
  gridRecordCount?: number;
  listRecordCount?: number;
}

interface UseViewModeReturn {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  recordsPerPage: number;
  isGridView: boolean;
  isListView: boolean;
}

export const useViewMode = (options: UseViewModeOptions = {}): UseViewModeReturn => {
  const {
    defaultMode = 'grid', // Default to grid view
    gridRecordCount = 12,
    listRecordCount = 10,
  } = options;

  const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewModeState(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  const recordsPerPage = viewMode === 'grid' ? gridRecordCount : listRecordCount;

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    recordsPerPage,
    isGridView: viewMode === 'grid',
    isListView: viewMode === 'list',
  };
};

export default useViewMode;