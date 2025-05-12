# Equinox: Homecoming Interactive Map

Welcome to the interactive map for Blue Scarab Entertainment’s [**Equinox: Homecoming**](https://store.steampowered.com/app/3258290/Equinox_Homecoming/).
This project is currently in development. At this stage, it provides a basic interactive map with no markers, filters, or gameplay layers yet. More features will be added as development progresses, so stay tuned for updates!

## Map Tiling Instructions

To prepare a large map image for use with MapLibre GL, you can tile it using the following command with [**vips**](https://libvips.github.io/libvips/):

```bash
vips dzsave original-map.png tiles --layout google --suffix .png --tile-size 256 --overlap 0
```

This will generate image tiles in the correct format and structure for rendering in the map viewer.
