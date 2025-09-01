#!/bin/sh
# Usage:
#   sh tile.sh <source-image.png> [<cropX_px> <cropY_px>]
# Examples:
#   sh tile.sh map.png            # no crop
#   sh tile.sh map.png 300 300    # crop 150px from left/right and top/bottom (used in this project)

set -eu

# Arguments
if [ "$#" -ne 1 ] && [ "$#" -ne 3 ]; then
  echo "Usage: $0 <source-image.png> [<cropX_px> <cropY_px>]"
  exit 1
fi
SRC_ORIG="$1"
CROPX=${2:-0}
CROPY=${3:-0}

# Filenames
CROPPED="cropped.png"
SRC_RGBA="source-with-alpha.png"
OUT_PADDED="padded-map.png"
TILE_DIR="tiles"

# Step 0: (optional) lossless crop first
W0=$(vipsheader -f width "$SRC_ORIG")
H0=$(vipsheader -f height "$SRC_ORIG")

TW=$(expr "$W0" - 2 \* "$CROPX")
TH=$(expr "$H0" - 2 \* "$CROPY")

if [ "$TW" -le 0 ] || [ "$TH" -le 0 ]; then
  echo "Error: crop too large for image size ${W0}x${H0} (result would be ${TW}x${TH})."
  exit 1
fi

SRC="$SRC_ORIG"
if [ "$CROPX" -gt 0 ] || [ "$CROPY" -gt 0 ]; then
  vips extract_area "$SRC_ORIG" "$CROPPED" "$CROPX" "$CROPY" "$TW" "$TH"
  SRC="$CROPPED"
fi

# Step 1: Add alpha channel to input image (makes it RGBA with full opacity)
vips bandjoin_const "$SRC" "$SRC_RGBA" 255
SRC="$SRC_RGBA"

# Step 2: Get original image size
W=$(vipsheader -f width "$SRC")
H=$(vipsheader -f height "$SRC")

# Step 3: Determine grid size (next power of 2 tile grid * 256, +1 step)
if [ "$W" -gt "$H" ]; then
  MAX_EDGE=$W
else
  MAX_EDGE=$H
fi

GRID=256
while [ "$GRID" -le "$MAX_EDGE" ]; do
  GRID=$(expr "$GRID" \* 2)
done
GRID=$(expr "$GRID" \* 2)  # one extra level for padding

# Step 4: Compute offsets to center image
OFFX=$(expr \( "$GRID" - "$W" \) / 2)
OFFY=$(expr \( "$GRID" - "$H" \) / 2)

echo "Configuration for 'public/maps.json':"
echo "'tileSize': 256"
echo "'size': [${GRID}, ${GRID}]"
echo "'boundsImage': [${OFFX}, ${OFFY}, $(expr "$OFFX" + "$W"), $(expr "$OFFY" + "$H")]"

# Step 5: Embed image in transparent canvas
vips embed "$SRC" "$OUT_PADDED" \
  "$OFFX" "$OFFY" "$GRID" "$GRID" \
  --background 0

# Step 6: Tile it using dzsave (skip transparent tiles)
vips dzsave "$OUT_PADDED" "$TILE_DIR" \
  --layout google \
  --suffix .png \
  --tile-size 256 \
  --overlap 0 \
  --background 0 \
  --skip-blanks 0

# Cleanup
rm -f "$CROPPED" "$SRC_RGBA" "$OUT_PADDED"

echo "Done!"
