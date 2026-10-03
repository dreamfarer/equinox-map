# How to Update the Map and Database for a New Game Version

The following guides explain how to update the map and database for a new game version. Although most steps are automated, some manual work is still required.

- [Export Resource Locations, Item Stats, and Image Paths using FModel](#export-resource-locations-item-stats-and-image-paths-using-fmodel)
- [Export Shop Product Catalogues and Prices using Fiddler Classic](#export-shop-product-catalogues-and-prices-using-fiddler-classic)
- [Extract Resource Locations](#extract-resource-locations)
- [Update the Database](#update-the-database)
- [Upload the Icons](#upload-the-icons)

### Optional Steps

These steps are optional and can be skipped if you don't need them.

- [Export the FModel Mapping](#export-the-fmodel-mapping)
- [Adding a New Map](#adding-a-new-map)

## Export Resource Locations, Item Stats, and Image Paths using FModel

### Prerequisites

1. Download [FModel](https://fmodel.app/download) and extract it to `fmodel/` in the project root.

### Setup FModel

1. Open FModel. If Microsoft Defender SmartScreen blocks the executable, click **More info** and then **Run anyway**.
2. On the first launch, the **Directory Selector** will open automatically. Under **Directory**, input the path to `ThunderHorseClient.exe` (_something like `C:\Program Files (x86)\Steam\steamapps\common\Project ThunderHorse`_) and click **OK**.
3. Go to **Settings** and toggle **Local Mapping File (drag & drop)**. Input the path to `5.5.4-0+UE5-ThunderHorse.usmap` (`dumper-7\5.5.4-0+UE5-ThunderHorse\Mappings` from the project root). FModel will now restart automatically.

### Export Data

The following directories need to be exported to update the map and database. However, feel free to discover everything else on your own.

1. **Double-Click** the `ThunderHorse-WindowsClient.utoc` archive to open it.
2. Navigate to `ThunderHorse/Content/Maps/GreenIsland/GreenIsland/_Generated_`, **Right-Click**, and choose **Save Folder's Packages Properties (.json)**.
3. Repeat step 2 for the ride island maps `ThunderHorse/Content/Maps/Ride_Maps/Ride_Map_1/_Generated_`, `ThunderHorse/Content/Maps/Ride_Maps/Ride_Map_2/_Generated_`, `ThunderHorse/Content/Maps/Ride_Maps/Ride_Map_3/_Generated_` and `ThunderHorse/Content/Maps/Ride_Maps/Ride_Map_4/_Generated_`.
4. Navigate to `ThunderHorse/Content/Blueprints/Items`, **Right-Click**, and choose **Save Folder's Packages Properties (.json)**. This is where the item stats, display names, upgrade items, and image paths come from.
5. Repeat step 4 for `ThunderHorse/Content/Blueprints/Data`. This is where the names of the shops, bundles, factions, and currencies come from, as well as the reputation each shop requires.
6. Navigate to `ThunderHorse/Content/UserInterface/Textures/Items/Character/Gear`, **Right-Click**, and choose **Save Folder's Packages Textures**.
7. Repeat step 6 for `ThunderHorse/Content/UserInterface/Textures/Items/Horse/Gear`, `ThunderHorse/Content/UserInterface/Textures/Items/Collectables`, and `ThunderHorse/Content/UserInterface/Textures/Buttons`.

_If FModel throws errors during exporting, either [open a new issue](https://github.com/dreamfarer/equinox-map/issues/new/choose) on GitHub or try generating the mapping again yourself using the instructions in the [Export the FModel Mapping](#export-the-fmodel-mapping) section._

## Export Shop Product Catalogues and Prices using Fiddler Classic

In this step we are going to set up Fiddler Classic to decrypt the HTTPS traffic from [LootLocker](https://lootlocker.com/). LootLocker is Equinox: Homecoming's backend which hosts the item catalogues and prices.

> [!CAUTION]
> **ALWAYS** revoke the root CA certificate after exporting, as explained below, since anyone who knows Fiddler's private key could use it to decrypt **ALL** your encrypted traffic. After clean-up, it will ask you to trust the root certificate again, so make sure to revoke it.

> [!WARNING]
> Close all unnecessary applications to not interfere with their traffic and to avoid any potential issues.

### Prerequisites

1. Download and install [Fiddler Classic](https://www.telerik.com/fiddler/fiddler-classic).
2. Make sure Equinox: Homecoming is installed and you can log in.
3. Create the folder `fiddler-classic/Output/Exports` in the project root, if it doesn't already exist. This is where the exported files go later on.

### Setup Fiddler Classic

1. Open Fiddler Classic → **Tools** → **Options** → **HTTPS** tab.
2. Check **Decrypt HTTPS traffic**.
3. Click **Yes** when prompted to add and trust the root certificate. If Windows shows a security warning asking whether to install the certificate, click **Yes** there too.
4. Go to **Filters** → **Show only if URL contains** and enter `/game/catalog`. This hides all traffic except the shop data we need, so the response list doesn't get cluttered.

### Export Item Catalogues

1. Launch Equinox: Homecoming and log in. Keep Fiddler Classic running in the background the entire time.
2. Visit each shop in-game and open its product catalogue. You have successfully visited a shop once a matching entry appears in Fiddler's response list. Remember to also visit the premium shops. See the [LootLocker Item Catalogue URLs](#lootlocker-item-catalogue-urls) appendix for the full list of URLs. Once every URL in that list has appeared in the response list, you have visited all shops.
3. Go through each response in the list. If a yellow bar reading **"Response body is encoded. Click to decode."** appears above the response body, click it to decode the response.
4. Select every response with **Shift+Click**, then **Right-Click** → **Save** → **Response** → **Response Body...**, and save them into `fiddler-classic/Output/Exports`. You can keep the default file names Fiddler suggests. You have successfully exported all item catalogues.

### Cleanup Fiddler Classic

1. Go to **Tools** → **Options** → **HTTPS** tab again.
2. Click **Actions** → **Reset All Certificates**.
3. Confirm the prompts.
4. It will ask you to trust the root certificate again, so make sure to **revoke** it by pressing **No**.
5. Uncheck **Decrypt HTTPS traffic** to disable decryption.

## Export the FModel Mapping

The mapping for FModel is already provided. This guide shows you how to export it again in case the provided mapping is outdated.

> [!CAUTION]
> If Equinox: Homecoming ever gained an anti-cheat system, this procedure would probably get you banned.

### Prerequisites

1. Download and install [System Informer](https://github.com/winsiderss/systeminformer/releases) (or any application that allows injecting DLLs).

### Export the Mapping

1. Launch Equinox: Homecoming and enter the game world.
2. Open System Informer and find the process called `ThunderHorseClient-Win64-Shipping.exe`.
3. **Double-Click** on the process → **Modules** → **Options** → **Load Module** → Confirm with **Load** → **Select** `dumper-7.dll` from `dumper-7/` in the project root.
4. The Command Prompt will pop up. Wait until it says **"Press F6 to unload"**, then press **F6**.
5. You have successfully exported the FModel mapping to `C:\Dumper-7\<GameName>\Mappings\<GameName>.usmap`.

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

## Extract Resource Locations

The exported resource locations from the section [Export Resource Locations, Item Stats, and Image Paths using FModel](#export-resource-locations-item-stats-and-image-paths-using-fmodel) are spread across thousands of files and contain much information we don't need. Therefore, this step extracts the resource locations into a single JSON file per category and removes all unnecessary data.

1. Clone the repository: `git clone git@github.com:dreamfarer/equinox-map.git` (_if not already done_)
2. Install dependencies: `npm install` (_if not already done_)
3. Extract the resource locations: `npm run build:extract`. This will populate the `public/markers/resources` directory.

_Many categories, such as characters and weekly quests, are not included in this automatic extraction and require manual addition and editing in `public/markers/`._

## Update the Database

The database is built from the exports of the sections [Export Resource Locations, Item Stats, and Image Paths using FModel](#export-resource-locations-item-stats-and-image-paths-using-fmodel) and [Export Shop Product Catalogues and Prices using Fiddler Classic](#export-shop-product-catalogues-and-prices-using-fiddler-classic). The catalogues know what each shop sells at which price, the game files know everything else: names, types, stats, upgrade items, icons, and which shop, faction, and reputation level a catalogue belongs to.

1. Import the exports: `npm run database:import`. This will regenerate `public/database/items.json` and the icons in `public/icon/256/item`. Both are fully generated, so never edit them by hand. The import stops with an explanation if the exports don't fit together, for example if a catalogue of a shop is missing.
2. Review the changes with `git diff public/database/items.json`. Every new item, removed item, and changed price of the game version shows up here.
3. Set the colours of the new items in `public/database/colours.json`. The import adds every new item at its sorted position with the placeholder `[""]` and prints the items it added. Replace the placeholder with the actual colours, which are defined in `schema/database/colours.ts`. Use an empty list for items that deliberately have no colour.
4. Validate the database: `npm run database:validate`. It lists the items that still have the placeholder, they are displayed without colours until then.

_Items that are not sold by any shop, like DLCs, are listed by hand in `public/database/extras.json`. Run the import again after adding an item there._

_An item no longer offered by its shop is kept in the database and marked as unavailable._

## Upload the Icons

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

## Appendix

### LootLocker Item Catalogue URLs

If each of these 58 URLs appears in the response list, you have successfully visited all shops.

```
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_1/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_6/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_7/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_8/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_10/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_3/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_4/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_5/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_9/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_farms_level_2/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/premium_mounts_v1_0/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/premium_bundles/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/premium_riding_pass/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/premium_early_access/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/premium_gear/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/premium_currency/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/multiplayer_activities_shop/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_1/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_8/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_2/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_5/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_6/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_7/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_3/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_10/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_9/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_town_level_4/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/riding_club_shop_2/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_1/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_2/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_3/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_4/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_9/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_5/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_7/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_6/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_8/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_equestrians_level_10/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_1/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_3/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_2/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_5/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_4/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_9/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_6/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_10/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_7/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_wilds_level_8/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_10/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_8/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_4/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_5/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_6/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_7/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_9/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_1/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_2/prices?per_page=40
https://api.lootlocker.com/game/catalog/key/faction_alderwood_fishermen_level_3/prices?per_page=40
```
