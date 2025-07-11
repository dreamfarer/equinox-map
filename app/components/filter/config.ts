import { TCategory } from '@/types/category';

type CategoryEntry = {
  label: string;
  id: TCategory;
};

export type CategoryGroup = {
  title: string;
  entries: CategoryEntry[];
};

export const categoryGroups: CategoryGroup[] = [
  {
    title: 'Locations',
    entries: [
      { label: 'Characters', id: 'character' },
      { label: 'Shops', id: 'shop' },
      { label: 'Races', id: 'race' },
      { label: 'Fast Travel Points', id: 'fast-travel' },
      { label: 'Scenic Rides', id: 'scenic-ride' },
      { label: 'Caves', id: 'cave' },
    ],
  },
  {
    title: 'Quests',
    entries: [
      { label: 'Weekly Quests', id: 'weekly-quest' },
      { label: 'Main Quests', id: 'main-quest' },
      { label: 'Side Quests', id: 'side-quest' },
      { label: 'Daily Deliveries', id: 'deliveries' },
    ],
  },
  {
    title: 'Resources',
    entries: [
      { label: 'Antlers', id: 'antler' },
      { label: 'Apples', id: 'apple' },
      { label: 'Blackberries', id: 'blackberry' },
      { label: 'Carrots', id: 'carrot' },
      { label: 'Dandelions', id: 'dandelion' },
      { label: 'Delphiniums', id: 'delphinium' },
      { label: 'Dryad Saddle Mushrooms', id: 'dryad-saddle-mushroom' },
      { label: 'Eagle Feathers', id: 'eagle-feather' },
      { label: 'Fossils', id: 'fossil' },
      { label: 'Horseshoes', id: 'horseshoe' },
      { label: 'King Boletus Mushrooms', id: 'king-boletus-mushroom' },
      { label: 'Moss', id: 'moss' },
      { label: 'Poppies', id: 'poppy' },
      { label: 'Raspberries', id: 'raspberry' },
      { label: 'Raven Feathers', id: 'raven-feather' },
      { label: 'Seagull Feathers', id: 'seagull-feather' },
      { label: 'Sulfur Shelf Mushrooms', id: 'sulfur-shelf-mushroom' },
      { label: 'Sunflowers', id: 'sunflower' },
      { label: 'Violets', id: 'violet' },
      { label: 'Water Lilies', id: 'water-lily' },
    ],
  },
];
