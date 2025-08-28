/**
 * Script to fix clues.ts structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current clues file
const cluesPath = path.join(__dirname, 'clues.ts');
let content = fs.readFileSync(cluesPath, 'utf-8');

// First extract the early part of the file with the correct interface and main clues object
const mainClosingBraceRegex = /export const clues: ClueCollection = \{[\s\S]*?\n\};/;
const mainMatch = content.match(mainClosingBraceRegex);

if (!mainMatch) {
  console.error('Could not find main clues object');
  process.exit(1);
}

// Extract the correct clues definition
const mainCluesDefinition = mainMatch[0];

// Extract all clues defined with 'clue_id': { ... }, format after the main clues
const additionalCluesRegex = /['"]([^'"]+)['"]:\s*\{([\s\S]*?)},\s+/g;
const additionalClues = [];

let match;
while ((match = additionalCluesRegex.exec(content)) !== null) {
  const clueId = match[1];
  const clueContent = match[2].trim();
  
  // Skip if the clue is already in the main definition
  if (mainCluesDefinition.includes(`'${clueId}'`) || mainCluesDefinition.includes(`"${clueId}"`)) {
    continue;
  }
  
  additionalClues.push({ id: clueId, content: clueContent });
}

// Extract exports at the end
const exportsRegex = /(\/\/ Clues organized by category[\s\S]*$)/;
const exportsMatch = content.match(exportsRegex);
const exportsContent = exportsMatch ? exportsMatch[1] : '';

// Create new content
let newContent = mainCluesDefinition + '\n\n';

// Add functions to get clues
newContent += `/**
 * Function to get all clues
 */
export function getAllClues(): Clue[] {
  return Object.values(clues);
}

/**
 * Function to get a clue by ID
 */
export function getClue(id: string): Clue | undefined {
  return clues[id];
}

`;

// Add each additional clue
additionalClues.forEach(clue => {
  newContent += `// Add additional clue: ${clue.id}\nclues['${clue.id}'] = {\n${clue.content}\n};\n\n`;
});

// Add exports
newContent += exportsContent;

// Write to file
fs.writeFileSync(cluesPath, newContent);
console.log(`Fixed ${additionalClues.length} additional clues`);
