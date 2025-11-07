# Equinox: Homecoming Interactive Map

This interactive map for [Equinox: Homecoming](https://store.steampowered.com/app/3258290/Equinox_Homecoming/) is a community-driven project – created and maintained by players, for players. Try it out [here](https://equinoxmap.app/)!

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

### Icon Processing

Icons are processed using a script prior to deployment. The script optionally crops the input image, resizes it, and exports it to WebP format at a specified quality setting.

```bash
npm run build:prepare -- <img> <quality> <cropX> <cropY> <size>
```

### Map Tiling

To prepare a large map image for use with MapLibre GL, run the script `scripts/tile.sh`:

```bash
sh tile.sh <source-image.png> [<cropX_px> <cropY_px>]
```

This script adds transparent padding, centers and optionally crops the image, and generates tiles. It also prints a partial `map.json` configuration to the console.

Thanks to the separation between raw marker data and the runtime projection, you won’t need to adjust marker coordinates or apply runtime shifts when padding, shifting or scaling the map image, unless the source image itself changes. All coordinates are resolved at build time.

## Statistics

Since launch, the project has seen **9'090** unique visitors and **955'960** total requests, aggregated across all months. These statistics are provided by Cloudflare.

<details>
<summary>October 2025</summary>
<br>

Unique Visitors: **2'360** \
Total Requests: **273'980**

</details>

<details>
<summary>September 2025</summary>
<br>

Unique Visitors: **1'780** \
Total Requests: **234'350**

</details>

<details>
<summary>August 2025</summary>
<br>

Unique Visitors: **1'410** \
Total Requests: **119'880**

</details>

<details>
<summary>July 2025</summary>
<br>

Unique Visitors: **1'530** \
Total Requests: **130'770**

</details>

<details>
<summary>June 2025</summary>
<br>

Unique Visitors: **2'010** \
Total Requests: **196'980**

</details>

## Acknowledgements

This project wouldn’t be possible without the tireless efforts of the following individuals – and of course, [Blue Scarab Entertainment](https://www.bluescarab.se/), the studio behind _Equinox: Homecoming_:

- [**CookieFox**](https://discordapp.com/users/631401395454476298): Reported missing and incorrect locations, helped gather clothing and tack data, and tracked reputation gains for weekly quests initially.
- [**dreamfarer**](https://github.com/dreamfarer): Leads overall concept, planning, communications, software engineering, DevOps, and data processing.
- [**Laika**](https://discordapp.com/users/465185463226073109): Created the original resource map in image form.
- [**lil big guy**](https://discordapp.com/users/323358848184221707): Submitted missing locations.
- [**Onyx**](https://discordapp.com/users/403687942687686660): Provided the artefact locations.
- [**Snowhawk**](https://discordapp.com/users/163581134209286144): Maintains a comprehensive [Google Sheet](https://docs.google.com/spreadsheets/d/1brrDNw7LZ8xx_Wryy8NNE05T4MEF4cvGN1b9SYE4jjE/edit?usp=sharing) tracking characters, quests, deliveries, clothing, tack, and more.
- [**Sugertoxity**](https://discordapp.com/users/608320065439268864): Helped plan the overall concept, communications and early location data sourcing and processing.
- [**Yumemi**](https://discordapp.com/users/260818698091102209): Submitted missing locations.
- [**zaaap!**](https://www.youtube.com/@zaaap): Produced a [video showcase](https://youtu.be/MgLdL8X9BY8?si=bUZRQiI6bdl6MCRE) of the interactive map.
- [**☾ \* 𝔉𝔢𝔢𝔩𝔦 ༓ ☽**](https://discordapp.com/users/194775629244268545): Submitted a missing location.
