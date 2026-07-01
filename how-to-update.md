# How to Update the Map and Database for a New Game Version

The following guides explain how to update the map and database for a new game version. Although most steps are automated, some manual work is still required.

* [Export Resource Locations, Item Stats, and Image Paths using FModel](#export-resource-locations-item-stats-and-image-paths-using-fmodel)
* [Export Shop Product Catalogues and Prices using Fiddler Classic](#export-shop-product-catalogues-and-prices-using-fiddler-classic)

### Optional Steps

These steps are optional and can be skipped if you don't need them.

* [Export the FModel Mapping](#export-the-fmodel-mapping)
* [Adding a New Map](#adding-a-new-map)

## Export Resource Locations, Item Stats, and Image Paths using FModel

### Prerequisites

1. Download [FModel](https://fmodel.app/download) and extract it to `fmodel/` in the project root.

### Setup FModel
1. **Open** FModel. If Microsoft Defender SmartScreen blocks the executable, click **More info** and then **Run anyway**.
2. On the first launch, the **Directory Selector** will open automatically. Under **Directory**, input the path to `ThunderHorseClient.exe` (*something like `C:\Program Files (x86)\Steam\steamapps\common\Project ThunderHorse`*) and click **OK**.
3. Go to **Settings** and toggle **Local Mapping File (drag & drop)**. Input the path to `5.5.4-0+UE5-ThunderHorse.usmap` (`dumper-7\5.5.4-0+UE5-ThunderHorse\Mappings` from the project root). FModel will now restart automatically.

### Export Data
The following directories need to be exported to update the map and database. However, feel free to discover everything else on your own.
1. Open the `ThunderHorse-WindowsClient.utoc` archive by **double-clicking** it.
2. Navigate to `ThunderHorse/Content/Maps/GreenIsland/GreenIsland/_Generated_`, right-click, and choose **Save Folder's Packages Properties (.json)**.
3. Repeat step 2 for the ride island maps `ThunderHorse/Content/Maps/Ride_Maps/Ride_Map_1/_Generated_`, `ThunderHorse/Content/Maps/Ride_Maps/Ride_Map_2/_Generated_`, `ThunderHorse/Content/Maps/Ride_Maps/Ride_Map_3/_Generated_` and `ThunderHorse/Content/Maps/Ride_Maps/Ride_Map_4/_Generated_`.
4. Navigate to `ThunderHorse/Content/UserInterface/Textures/Items/Character/Gear`, right-click, and choose **Save Folder's Packages Textures**.
5. Repeat step 4 for `ThunderHorse/Content/UserInterface/Textures/Items/Horse/Gear`.

*If FModel throws errors during exporting, either [open a new issue](https://github.com/dreamfarer/equinox-map/issues/new/choose) on GitHub or try generating the mapping again yourself using the instructions in the [Export the FModel Mapping](#export-the-fmodel-mapping) section.*

## Export Shop Product Catalogues and Prices using Fiddler Classic

In this step we are going to set up Fiddler Classic to decrypt the HTTPS traffic from [LootLocker](https://lootlocker.com/). LootLocker is Equinox: Homecoming's backend which hosts the item catalogues and prices.

> [!CAUTION]
> **ALWAYS** revoke the root CA certificate after exporting, as explained below, since anyone who knows Fiddler's private key could use it to decrypt **ALL** your encrypted traffic. After cleanup, it will ask you to trust the root certificate again, so make sure to revoke it.

> [!WARNING]
> Close all unnecessary applications to not interfere with their traffic and to avoid any potential issues.

### Prerequisites

1. Download and install [Fiddler Classic](https://www.telerik.com/fiddler/fiddler-classic).
2. Make sure Equinox: Homecoming is installed and you can log in.
3. Create the folder `fiddler-classic/Exports` in the project root, if it doesn't already exist. This is where the exported files go later on.

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

### Prerequisites

1. Download and install [System Informer](https://github.com/winsiderss/systeminformer/releases) (or any application that allows injecting DLLs).

### Export the FModel Mapping
1. Launch Equinox: Homecoming and enter the game world.
2. Open **System Informer** and find the process called `ThunderHorseClient-Win64-Shipping.exe`.
3. **Double-Click** on the process → **Modules** → **Options** → **Load Module** → Confirm with **Load** → **Select** `dumper-7.dll` from `dumper-7/` in the project root.
4. The Command Prompt will pop up. Wait until it says "**Press F6 to unload**", then **press F6**.
5. You have successfully exported the FModel mapping to `C:\Dumper-7\<GameName>\Mappings\<GameName>.usmap`.

*You can also build [Dumper-7](https://github.com/Encryqed/Dumper-7) from source and use it instead of the provided DLL.*

## Adding a New Map

Adding a new map involves manual work, multiple steps, and a deeper understanding of the app. Therefore, it's probably better to [open a new issue](https://github.com/dreamfarer/equinox-map/issues/new/choose) on GitHub. Generally, however, you will need to append the new map to `app\(map)\[map]\page.tsx`, register it in `app/data/maps.json`, tile it, and add its metadata in `scripts/extract-resources.json`.

### Map Tiling

Interactive maps are usually split into multiple tiles on multiple zoom levels from a large source map for more efficient usage and lower performance requirements.
1. Run the script `scripts/tile.sh`. This script adds transparent padding, centers and optionally crops the image and generates tiles. It also prints partial metadata (*for `maps.json`*) to the console:
    ```sh
    sh tile.sh <source-image.png> [<cropX_px> <cropY_px>]
    ```
   (*cropX and cropY are set to 300 in this project*)
2. Move the generated folders containing the tiles to `app/tiles/<map-id>/<version>/`.

### Map Metadata

Marker positions are stored in **Cartesian coordinates** (_in meters_), independent of any specific geographic projection. During the build process, these coordinates are converted to **Web Mercator** according to the transformation rules defined in the map metadata `maps.json`. This decouples the raw data from the runtime map projection, making it easier to adapt or scale in the future. While a purely Cartesian system would be ideal for a flat game map, MapLibre GL currently requires geographic coordinates in Web Mercator projection. 

This separation between raw marker data and runtime projection requires telling the runtime how to map the raw marker data into the final projection. This is currently done by visiting the resources with extreme positions in-game and editing the `boundsData` until the mapping is correct.

## Appendix

### LootLocker Item Catalogue URLs

If each of these URLs appears in the response list, you have successfully visited all shops.

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
https://api.lootlocker.com/game/catalog/key/premium_bundles_2/prices?per_page=40
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