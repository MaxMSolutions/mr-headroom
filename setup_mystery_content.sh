#!/bin/bash

echo "Setting up mystery content for the game..."

# Run the script to add lore files to the file system
echo "Adding lore files to the file system..."
node src/data/addLoreFiles.js

# Run the script to add clues based on lore files
echo "Adding clues based on lore files..."
node src/data/addLoreClues.js

echo "Mystery content setup complete!"
