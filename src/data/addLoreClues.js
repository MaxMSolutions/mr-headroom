/**
 * Add additional mystery clues based on the new lore files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the lore files data
const loreFilesPath = path.join(__dirname, 'lore_files.json');
const loreFilesData = JSON.parse(fs.readFileSync(loreFilesPath, 'utf-8'));

// Read the current clues file
const cluesPath = path.join(__dirname, 'clues.ts');
let cluesContent = fs.readFileSync(cluesPath, 'utf-8');

// Generate new clues based on lore files
const newClues = [];

for (const file of loreFilesData.files) {
  if (!file.metadata?.clue_id) continue;
  
  const isRedHerring = file.metadata.is_red_herring === true;
  const category = file.path.includes('journal') 
    ? 'journal' 
    : file.path.includes('email')
    ? 'email'
    : file.path.includes('system') || file.path.includes('log')
    ? 'system_log'
    : file.path.includes('hidden') || file.path.includes('piece')
    ? 'hidden_file'
    : 'metadata';
  
  const clueId = file.metadata.clue_id;
  
  // Create clue object
  const clue = {
    id: clueId,
    title: clueId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: `Discovery from file: ${file.path}`,
    content: file.content.substring(0, 100) + (file.content.length > 100 ? '...' : ''),
    category,
    isRedHerring,
    relatedFiles: [file.path],
    displayType: isRedHerring ? 'normal' : file.path.includes('hidden') ? 'secret' : 'important',
  };
  
  newClues.push(`  '${clueId}': ${JSON.stringify(clue, null, 2)}`);
}

// Prepare new content to add
const cluesAddition = newClues.join(',\n');

// Find a good place to insert new clues (before the last closing brace)
const lastBraceIndex = cluesContent.lastIndexOf('}');
if (lastBraceIndex !== -1) {
  cluesContent = 
    cluesContent.substring(0, lastBraceIndex) +
    ',\n' +
    cluesAddition +
    cluesContent.substring(lastBraceIndex);
  
  // Write the updated clues back to disk
  fs.writeFileSync(cluesPath, cluesContent);
  
  console.log(`Added ${newClues.length} new clues to the clues.js file`);
}
