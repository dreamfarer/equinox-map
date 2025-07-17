import { TCategory } from './category';
import { TPopups } from './popup';
import { TBookmarkId } from './bookmark';
import { TMarkerFeatureCollection } from './marker-feature-collection';

export type TMarkerContext = {
  enabled: Record<TCategory, boolean>;
  popups: TPopups;
  markers: TMarkerFeatureCollection | null;
  bookmarkIds: TBookmarkId[];
  categoryBookmarkMap: Record<string, string[]>;
  flyToMarker: (id: string, category?: string) => void;
  toggleBookmark: (id: TBookmarkId) => void;
  toggleBookmarks: (categoryId: string) => void;
  clearBookmarks: () => void;
  toggleCategory: (category: TCategory) => void;
};
