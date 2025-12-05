const IGNORED_MARKER_IDS_LOCAL_STORAGE_KEY = 'ignored-marker-ids-v1';

export function loadCollectedMarkerIdsFromLocalStorage(): string[] {
  if (typeof window === 'undefined') return [];
  const collectedMarkerIds: string =
    localStorage.getItem(IGNORED_MARKER_IDS_LOCAL_STORAGE_KEY) ?? '[]';
  return JSON.parse(collectedMarkerIds);
}

export function saveCollectedMarkerIdsToLocalStorage(
  collectedMarkerIds: string[]
) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    IGNORED_MARKER_IDS_LOCAL_STORAGE_KEY,
    JSON.stringify(collectedMarkerIds)
  );
}
