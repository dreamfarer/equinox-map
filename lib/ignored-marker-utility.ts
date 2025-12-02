const IGNORED_MARKER_IDS_LOCAL_STORAGE_KEY = 'ignored-marker-ids-v1';

export function loadIgnoredMarkerIdsFromLocalStorage(): string[] {
  if (typeof window === 'undefined') return [];
  const ignoredMarkerIds: string =
    localStorage.getItem(IGNORED_MARKER_IDS_LOCAL_STORAGE_KEY) ?? '[]';
  return JSON.parse(ignoredMarkerIds);
}

export function saveIgnoredMarkerIdsToLocalStorage(ignoredMarkerIds: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    IGNORED_MARKER_IDS_LOCAL_STORAGE_KEY,
    JSON.stringify(ignoredMarkerIds)
  );
}
