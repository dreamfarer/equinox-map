# How to Update the Map and Database for a New Game Version

The following guide explains how to update the map and database for a new game version.

- [1. Prerequisites](#1-prerequisites)
- [2. Log In to the Game](#2-log-in-to-the-game)
- [3. Run the Update](#3-run-the-update)
- [4. Review the Changes](#4-review-the-changes)
- [5. Upload the Icons](#5-upload-the-icons)

### Optional Steps

These steps are optional and can be skipped if you don't need them.

- [Export the FModel Mapping](#export-the-fmodel-mapping)
- [Adding a New Map](#adding-a-new-map)

## 1. Prerequisites

1. Clone the repository: `git clone git@github.com:dreamfarer/equinox-map.git`
2. Install dependencies: `npm install`
3. Install the [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0): `winget install Microsoft.DotNet.SDK.10`. It runs the exporter of the game files in `tools/exporter`, which is built on [CUE4Parse](https://github.com/FabianFG/CUE4Parse), the library behind [FModel](https://fmodel.app).
4. Make sure Equinox: Homecoming is installed through Steam and updated to the new version.

## 2. Log In to the Game

The shop catalogues and prices are hosted by [LootLocker](https://lootlocker.com/), the backend of Equinox: Homecoming. To download them, the update uses the current game session of your own account, which the game stores in `%LOCALAPPDATA%\ThunderHorse\Saved\SaveGames` on every login.

1. Launch Equinox: Homecoming and log in until you are in the game world.
2. Keep the game running until the update procedure has finished fully.

## 3. Run the Update

```sh
npm run game:update
```

This runs the following steps in order and stops at the first one that fails. Each step can also be run on its own.

1. `npm run game:export` exports the resource locations, item stats, shop data, and icons from the game files to `fmodel/Output/Exports`.
2. `npm run build:extract` extracts the resource locations of the exported maps to `public/markers/resources`.
3. `npm run database:fetch` downloads the catalogue of every shop the game files know to `lootlocker/catalogues`.
4. `npm run database:import` regenerates `public/database/items.json` and the icons in `public/icon/256/item` and adds new items to `public/database/colours.json`.
5. `npm run database:validate` validates the database and lists the items that still need colours.

_If the game is not installed through Steam, pass its directory: `npm run game:export -- --game "D:\Games\Project ThunderHorse"`._

_If the export reports classes that couldn't be read, the mapping doesn't fit the new game version any more. Objects of these classes are exported with properties missing, so don't skip this: generate the mapping again as described in [Export the FModel Mapping](#export-the-fmodel-mapping) and run the update again. A class that still can't be read with a fresh mapping, and that nothing depends on, can be added to `knownUnreadableClasses` in `tools/exporter/Program.cs`._

_If LootLocker rejects the session, [log in to the game](#2-log-in-to-the-game) again and continue with `npm run database:fetch`. To use a different session, set `LOOTLOCKER_SESSION_TOKEN` in the file `.env` in the project root._

_The export needs about 4 GB of free disk space._

## 4. Review the Changes

Both `items.json` and the icons are fully generated, so never edit them by hand.

1. Review the changes with `git status` and `git diff public/database/items.json public/markers`. Every new item, removed item, changed price, and moved resource of the game version shows up here.
2. Set the colours of the new items in `public/database/colours.json`. The import adds every new item at its sorted position with the placeholder `[""]` and prints the items it added. Replace the placeholder with the actual colours, which are defined in `schema/database/colours.ts`. Use an empty list for items that deliberately have no colour.
3. Validate the database again: `npm run database:validate`. It lists the items that still have the placeholder, they are displayed without colours until then.

_Many marker categories, such as characters and weekly quests, are not part of the game export and require manual addition and editing in `public/markers/`._

_Items that are not sold by any shop, like DLCs, are listed by hand in `public/database/extras.json`. Run `npm run database:import` again after adding an item there._

_Nothing is removed from the database just because the game stops selling it. An item or listing that is gone from the catalogues, like the items of an event vendor after the event, is kept and marked as unavailable. To remove an item for good, delete it from `items.json` before running the import. The same goes for the resources: a file in `public/markers/resources` is kept when its resource is gone from the maps._

_A new kind of resource gets its own file in `public/markers/resources`, but doesn't show up on the map on its own. Give it a readable name in `nameOverrides` of `scripts/extract-resources.ts`, add it to `public/meta.json`, to `types/category.ts`, and to the filter menu in `app/(map)/components/sidebar/menu/filter/config.ts`, and create its icon in `public/icon/64`._

_Shops that can't be visited in-game, like test shops, are left out by `excludedShops` in `scripts/database/fetch-catalogues.ts`._

## 5. Upload the Icons

The icons are served from a [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket. This step uploads the new and changed icons in `public/icon` to it.

1. In the Cloudflare dashboard, go to **R2 Object Storage** → **API Tokens** and create a token with **Object Read & Write** permission for the bucket.
2. Create the file `.env` in the project root with the values Cloudflare displays for the token and the bucket:
    ```
    R2_ENDPOINT=<S3 API of the bucket>
    R2_BUCKET=<name of the bucket>
    R2_ACCESS_KEY_ID=<Access Key ID of the token>
    R2_SECRET_ACCESS_KEY=<Secret Access Key of the token>
    ```
3. Preview what would be uploaded: `npm run icons:upload -- --dry-run`
4. Upload the icons: `npm run icons:upload`

_Nothing is ever deleted from the bucket, since the live website still depends on the old icons until the new version is deployed. The dry run lists the icons in the bucket that are no longer part of `public/icon`._

## Export the FModel Mapping

The mapping tells the exporter how the objects of the game are laid out. It is already provided, but a game update that changes this layout makes it outdated, which `npm run game:export` reports. This guide shows you how to export it again.

> [!CAUTION]
> If Equinox: Homecoming ever gained an anti-cheat system, this procedure would probably get you banned.

### Prerequisites

1. Download and install [System Informer](https://github.com/winsiderss/systeminformer/releases) (or any application that allows injecting DLLs).

### Export the Mapping

1. Launch Equinox: Homecoming and enter the game world.
2. Open System Informer and find the process called `ThunderHorseClient-Win64-Shipping.exe`.
3. **Double-Click** on the process → **Modules** → **Options** → **Load Module** → Confirm with **Load** → **Select** `dumper-7.dll` from `dumper-7/` in the project root.
4. The Command Prompt will pop up. Wait until it says **"Press F6 to unload"**, then press **F6**.
5. You have successfully exported the mapping to `C:\Dumper-7\<GameName>\Mappings\<GameName>.usmap`. Replace the `.usmap` in `dumper-7/` of the project root with it.

_You can also build [Dumper-7](https://github.com/Encryqed/Dumper-7) from source and use it instead of the provided DLL._

## Adding a New Map

Adding a new map involves manual work, multiple steps, and a deeper understanding of the app. Therefore, it's probably better to [open a new issue](https://github.com/dreamfarer/equinox-map/issues/new/choose) on GitHub. In general, you will need to append the new map to `app/(map)/[map]/page.tsx`, register it in `app/data/maps.json`, tile it, and add its metadata in `scripts/extract-resources.json`.

### Map Tiling

Interactive maps are usually split into multiple tiles across multiple zoom levels, generated from a large source map, for more efficient usage and lower performance requirements.

1. Run the script `scripts/tile.sh`. This script adds transparent padding, centers and optionally crops the image, and generates tiles. It also prints partial metadata (_for `maps.json`_) to the console:
    ```sh
    sh tile.sh <source-image.png> [<cropX_px> <cropY_px>]
    ```
    (_cropX and cropY are set to 300 in this project_)
2. Move the generated folders containing the tiles to `app/tiles/<map-id>/<version>/`.

### Map Metadata

Marker positions are stored in **Cartesian coordinates** (_in meters_), independent of any specific geographic projection. During the build process, these coordinates are converted to **Web Mercator** according to the transformation rules defined in the map metadata `maps.json`. This decouples the raw data from the runtime map projection, making it easier to adapt or scale in the future. While a purely Cartesian system would be ideal for a flat game map, MapLibre GL currently requires geographic coordinates in Web Mercator projection.

This separation between raw marker data and runtime projection requires telling the runtime how to map the raw marker data into the final projection. This is currently done by visiting the resources with extreme positions in-game and editing the `boundsData` until the mapping is correct.
