#!/bin/sh
# Usage: sh split_for_r2.sh <source directory> <output directory>

SOURCE_DIR="$1"
OUTPUT_DIR="$2"
MAX_FILES_PER_CHUNK=100

if [ -z "$SOURCE_DIR" ] || [ -z "$OUTPUT_DIR" ]; then
  echo "Usage: $0 <source_dir> <output_dir>"
  exit 1
fi

CHUNK_INDEX=1
FILE_COUNT=0

mkdir -p "$OUTPUT_DIR"

# Enter the source dir so we can work with relative paths
cd "$SOURCE_DIR" || exit 1

find . -type f | while IFS= read -r REL_PATH; do
  # Remove leading './' from path
  REL_PATH=${REL_PATH#./}

  if [ $((FILE_COUNT % MAX_FILES_PER_CHUNK)) -eq 0 ]; then
    CHUNK_FOLDER="$OUTPUT_DIR/chunk_$CHUNK_INDEX"
    mkdir -p "$CHUNK_FOLDER"
    echo "Creating $CHUNK_FOLDER"
    CHUNK_INDEX=$((CHUNK_INDEX + 1))
  fi

  DEST_PATH="$CHUNK_FOLDER/$(dirname "$REL_PATH")"
  mkdir -p "$DEST_PATH"
  cp "$REL_PATH" "$DEST_PATH/"

  FILE_COUNT=$((FILE_COUNT + 1))
done

echo "Done! Created $((CHUNK_INDEX - 1)) chunk(s) in: $OUTPUT_DIR"
