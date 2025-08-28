/**
 * Script to add lore files to the file system
 * This script takes the data from lore_files.json and adds them to the fileSystem.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the lore files data
const loreFilesPath = path.join(__dirname, 'lore_files.json');
const loreFilesData = JSON.parse(fs.readFileSync(loreFilesPath, 'utf-8'));

// Read the current file system data
const fileSystemPath = path.join(__dirname, 'filesystem', 'fileSystem.json');
const fileSystemData = JSON.parse(fs.readFileSync(fileSystemPath, 'utf-8'));

// Helper function to get or create a directory path in the file system
function getOrCreatePath(root, pathParts) {
  let current = root;
  
  for (const part of pathParts) {
    if (!part) continue; // Skip empty parts
    
    // Check if directory exists
    let dir = current.children?.find(child => child.type === 'directory' && child.name === part);
    
    // If not, create it
    if (!dir) {
      dir = {
        type: 'directory',
        name: part,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        attributes: {
          hidden: part === 'hidden',
          system: part === 'system' || part === 'system32',
          readonly: false
        },
        children: []
      };
      
      current.children.push(dir);
    }
    
    current = dir;
  }
  
  return current;
}

// Add lore files to the file system
for (const file of loreFilesData.files) {
  // Parse the path to get directory and filename
  const pathParts = file.path.split('/').filter(Boolean);
  const fileName = pathParts.pop();
  
  // Get or create the directory path
  const parentDir = getOrCreatePath(fileSystemData.fileSystem, pathParts);
  
  // Check if file already exists
  const existingFileIndex = parentDir.children.findIndex(
    child => child.type === 'file' && child.name === fileName
  );
  
  // Prepare file object
  const fileObj = {
    type: 'file',
    name: fileName,
    created: file.created,
    modified: file.modified,
    size: file.content.length,
    content: file.content,
    attributes: file.attributes || {
      hidden: false,
      system: false,
      readonly: false
    }
  };
  
  // Add metadata if provided
  if (file.metadata) {
    fileObj.metadata = file.metadata;
  }
  
  // Add or update file
  if (existingFileIndex >= 0) {
    parentDir.children[existingFileIndex] = fileObj;
  } else {
    parentDir.children.push(fileObj);
  }
}

// Write the updated file system back to disk
fs.writeFileSync(fileSystemPath, JSON.stringify(fileSystemData, null, 2));

console.log(`Added ${loreFilesData.files.length} lore files to the file system`);
