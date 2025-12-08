import maplibregl, { Offset, Popup as MapLibrePopup } from 'maplibre-gl';
import { Root, createRoot } from 'react-dom/client';
import Popup from '../components/map/popup';
import {
  calculatePopupOffset,
  createCategoriesKey,
  getFilteredPopupCategories,
} from '@/lib/popup-utility';
import { TCategoryPayloads, TPopups } from '@/types/popup';
import { ExtendedMap } from '@/types/extended-map';
import { TCategory } from '@/types/category';
import { TMarkerFeature } from '@/types/marker';

interface RenderArgs {
  feature: TMarkerFeature;
  popups: TPopups;
  activeCategories: TCategory[];
  map: maplibregl.Map;
}

interface UpdateArgs {
  map: maplibregl.Map;
  popups: TPopups;
  activeCategories: TCategory[];
}

export class ActivePopup {
  private mapLibrePopup: MapLibrePopup | null = null;
  private root: Root | null = null;
  private markerId: string | null = null;

  isSame(markerId: string) {
    return markerId === this.markerId;
  }

  remove() {
    this.mapLibrePopup?.remove();
    this.root?.unmount();
    this.mapLibrePopup = null;
    this.root = null;
    this.markerId = null;
  }

  private internalRender(
    map: maplibregl.Map,
    markerId: string,
    coordinates: number[],
    anchor: string,
    categories: TCategoryPayloads,
    initialCategory: string
  ) {
    const container = document.createElement('div');
    const root = createRoot(container);
    const categoriesKey = createCategoriesKey(categories);

    root.render(
      <Popup
        key={categoriesKey}
        id={markerId}
        categories={categories}
        initialCategory={initialCategory}
      />
    );

    const popupInstance = new MapLibrePopup({
      closeButton: false,
      className: 'equinox-popup',
      offset: calculatePopupOffset(anchor as 'center' | 'bottom') as Offset,
    })
      .setDOMContent(container)
      .setLngLat([coordinates[0], coordinates[1]])
      .addTo(map);

    popupInstance.on('close', () => this.remove());

    this.mapLibrePopup = popupInstance;
    this.root = root;
    this.markerId = markerId;

    const extMap = map as ExtendedMap;
    extMap.__activePopupRoot = root;
    extMap.__activePopupInstance = popupInstance;
    extMap.__activePopupMarkerId = markerId;
  }

  render({ feature, popups, activeCategories, map }: RenderArgs) {
    const { id, anchor } = feature.properties;
    const coordinates = feature.geometry.coordinates;

    const categories = getFilteredPopupCategories(id, popups, activeCategories);
    if (!categories || Object.keys(categories).length === 0) return;

    const defaultCategory = Object.keys(categories)[0];
    const requestedCategory =
      (map as ExtendedMap).__requestedCategoryForPopup ?? defaultCategory;

    this.internalRender(
      map,
      id,
      coordinates,
      anchor,
      categories,
      requestedCategory
    );
  }

  update({ popups, activeCategories }: UpdateArgs) {
    if (!this.root || !this.markerId) return;

    const categories = getFilteredPopupCategories(
      this.markerId,
      popups,
      activeCategories
    );
    if (!categories || Object.keys(categories).length === 0) return;

    const defaultCategory = Object.keys(categories)[0];
    const categoriesKey = createCategoriesKey(categories);

    this.root.render(
      <Popup
        key={categoriesKey}
        id={this.markerId}
        categories={categories}
        initialCategory={defaultCategory}
      />
    );
  }
}
