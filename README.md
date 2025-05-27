# Equinox: Homecoming Interactive Map

This interactive map for [Equinox: Homecoming](https://store.steampowered.com/app/3258290/Equinox_Homecoming/) is a community-driven project — created and maintained by players, for players. Try it out [here](https://equinoxmap.app/)!

## Implemented Features

The following features are fully implemented and available in the live version:

- Toggle marker categories on/off via click in the menu
- Search for markers using the search bar
- Click a search result to fly to that marker on the map
- Click a marker to open a popup with additional information
- Bookmark markers directly from the search results or within popups
- View only your bookmarked markers via the **Bookmarks** tab

## Roadmap

We are committed to maintaining this project long-term. Our immediate goals include:

- Add remaining markers (e.g., weekly, side and main quests)
- Plot the course of the race when opening the popup
- Display a short visual tutorial when first visiting the app
- Refactor and abstracting code for future expansion
- Implement caching & efficient bandwidth usage

## Feedback, Issues, Suggestions

Have feedback, found a bug, or have a feature request? Fill out this [Google Form](https://docs.google.com/forms/d/e/1FAIpQLScLE-dfJ5pjGvxtdScB9KYc0hX9cZI7c1ba80hR33Ceieu2JA/viewform?usp=header) or open an [issue](https://github.com/dreamfarer/equinox-map/issues/new) on GitHub.

## Technical Overview

### Deployment

The project is currently running on **free** plans. The serverless Next.js frontend is hosted on [Vercel](https://vercel.com/), and the map tiles are stored in a [Cloudflare R2](https://www.cloudflare.com/en-gb/developer-platform/products/r2/) bucket.

### Data Sourcing & Processing

This is a collaborative community effort, with data sourced by players exploring the game.
We've implemented a **development mode**, accessible at [equinoxmap.app/dev](https://equinoxmap.app/dev). Clicking on the map in this mode spawns a marker and copies a template to the clipboard.

All markers are first added to `/public/markers` in the `data` branch. They are then processed if necessary and ultimately merged into the `main` branch via a pull request. A GitHub workflow resets the `data` branch to match the current `main` state. At build time, a script merges, validates, and converts marker data to GeoJSON for use with MapLibre GL.

Marker positions are stored in **Cartesian coordinates** (in meters), independent of any specific geographic projection. During the build process, these coordinates are converted to **Web Mercator** according to the transformation rules defined in `map.json`. This decouples the raw data from the runtime map projection, making it easier to adapt or scale in the future.

While a purely Cartesian system would be ideal for a flat game map, MapLibre GL currently requires geographic coordinates in Web Mercator projection.

### Map Tiling

To prepare a large map image for use with MapLibre GL, you can generate tiles using [**vips**](https://libvips.github.io/libvips/):

```bash
vips dzsave original-map.png tiles --layout google --suffix .png --tile-size 256 --overlap 0
```

This generates image tiles in the correct format and structure for rendering within the map viewer.

## Acknowledgements

This project wouldn’t be possible without the tireless efforts of the following individuals — and of course, [Blue Scarab Entertainment](https://www.bluescarab.se/), the studio behind _Equinox: Homecoming_:

- **Overall Idea & Planning**: [dreamfarer](https://github.com/dreamfarer) and [Sugertoxity](https://discordapp.com/users/608320065439268864)
- **Software Engineering & DevOps**: [dreamfarer](https://github.com/dreamfarer)
- **Data Sourcing**: [Laika](https://discordapp.com/users/465185463226073109), [Sugertoxity](https://discordapp.com/users/608320065439268864), [CookieFox](https://discordapp.com/users/631401395454476298) and [Yumemi](https://discordapp.com/users/260818698091102209)
- **Data Processing**: [dreamfarer](https://github.com/dreamfarer) and [Sugertoxity](https://discordapp.com/users/608320065439268864)
