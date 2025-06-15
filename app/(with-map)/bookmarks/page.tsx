import Bookmarks from '@/app/components/bookmarks';

export default function BookmarkMenuPage() {
  return (
    <>
      <h1 className="sr-only">
        Bookmarks – View, Manage and Track Saved Markers
      </h1>
      <p className="sr-only">
        Add bookmarks via the filter menu, the search bar or inside popups. For
        single-category markers, use right-click or long-press on mobile to
        quickly toggle the bookmark. Track your progress by toggling bookmarks
        off as you collect.
      </p>
      <Bookmarks />
    </>
  );
}
