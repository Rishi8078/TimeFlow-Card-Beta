const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.resolve(__dirname, '..'); // TimeFlow-Card-Beta root
const TARGET_DIR = path.resolve(__dirname, '../../timeflow-card'); // timeflow-card root

// Files/Directories to process
// EXCLUDING rollup.config.js and package.json to preserve Main's build identity
const INCLUDED_PATHS = [
  'src',
  'tsconfig.json'
];

// Special file renames (Source -> Target)
const FILE_RENAMES = {
  'TimeFlowCardEditorBeta.ts': 'TimeFlowCardEditor.ts'
};

// String replacements to convert Beta code to Main code
// ORDER MATTERS: Specific replacements first, generic ones last
const REPLACEMENTS = [
  // 1. Custom Element Tags (HTML templates)
  { from: /<progress-circle-beta/g, to: '<progress-circle' },
  { from: /<\/progress-circle-beta>/g, to: '</progress-circle>' },
  { from: /<error-display-beta/g, to: '<error-display' },
  { from: /<\/error-display-beta>/g, to: '</error-display>' },
  { from: /<timeflow-card-beta-editor/g, to: '<timeflow-card-editor' }, // unlikely in HTML but good practice

  // 2. Custom Element Registration (Strings)
  { from: /'progress-circle-beta'/g, to: "'progress-circle'" },
  { from: /"progress-circle-beta"/g, to: '"progress-circle"' },
  { from: /'error-display-beta'/g, to: "'error-display'" },
  { from: /"error-display-beta"/g, to: '"error-display"' },
  { from: /'timeflow-card-beta'/g, to: "'timeflow-card'" },
  { from: /"timeflow-card-beta"/g, to: '"timeflow-card"' },
  { from: /'timeflow-card-beta-editor'/g, to: "'timeflow-card-editor'" },

  // 2b. CSS class attributes (e.g., class="progress-circle-beta")
  { from: /class="progress-circle-beta"/g, to: 'class="progress-circle"' },

  // 2c. CSS selectors using element names (e.g., .compact-progress progress-circle-beta)
  { from: / progress-circle-beta\s*\{/g, to: ' progress-circle {' },
  { from: / progress-circle-beta\s/g, to: ' progress-circle ' },

  // 3. Configuration Types (with custom: prefix)
  { from: /type: 'custom:timeflow-card-beta'/g, to: "type: 'custom:timeflow-card'" },
  { from: /type: "custom:timeflow-card-beta"/g, to: 'type: "custom:timeflow-card"' },

  // 3b. Type registration (without custom: prefix, used in window.customCards)
  { from: /type: 'timeflow-card-beta'/g, to: "type: 'timeflow-card'" },
  { from: /type: "timeflow-card-beta"/g, to: 'type: "timeflow-card"' },

  // 4. Class Names & Imports
  { from: /class TimeFlowCardBeta/g, to: 'class TimeFlowCard' },
  { from: /class ProgressCircleBeta/g, to: 'class ProgressCircle' },
  { from: /class ErrorDisplayBeta/g, to: 'class ErrorDisplay' },
  { from: /class TimeFlowCardEditorBeta/g, to: 'class TimeFlowCardEditor' },
  { from: /export { TimeFlowCardBeta/g, to: 'export { TimeFlowCard' },
  { from: /TimeFlowCardBeta, ProgressCircleBeta/g, to: 'TimeFlowCard, ProgressCircle' }, // Index export line

  // 5. File Headers & Comments
  { from: /\/\/TimeFlowCardBeta.ts/g, to: '//TimeFlowCard.ts' },
  { from: /\/\/ ProgressCircleBeta.ts/g, to: '// ProgressCircle.ts' },
  { from: /\* TimeFlow Card Editor Beta/g, to: '* TimeFlow Card Editor' },
  { from: /\(Beta version\)/g, to: '' },

  // 6. Generic "Beta" stripping (Use with caution, kept for safety on missed items)
  // Replaced generic stripping with targeted ones above to be safer.
  // We explicitly replace the import paths now:
  { from: /import { TimeFlowCardBeta }/g, to: 'import { TimeFlowCard }' },
  { from: /import { ProgressCircleBeta }/g, to: 'import { ProgressCircle }' },
  { from: /import { ErrorDisplayBeta }/g, to: 'import { ErrorDisplay }' },
  { from: /import { TimeFlowCardEditorBeta }/g, to: 'import { TimeFlowCardEditor }' },

  // 7. Fix Component Definitions
  { from: /customElements.get\('timeflow-card-beta'\)/g, to: "customElements.get('timeflow-card')" },
  { from: /customElements.define\('timeflow-card-beta'/g, to: "customElements.define('timeflow-card'" },

  // 8. Fix Editor Element Creation
  { from: /document.createElement\('timeflow-card-beta-editor'\)/g, to: "document.createElement('timeflow-card-editor')" },

  // 9. Fix remaining Beta references (standalone usages)
  { from: /TimeFlowCardBeta\./g, to: 'TimeFlowCard.' },
  { from: /ProgressCircleBeta\b/g, to: 'ProgressCircle' },
  { from: /ErrorDisplayBeta\b/g, to: 'ErrorDisplay' },
  { from: /TimeFlowCardEditorBeta\b/g, to: 'TimeFlowCardEditor' },
  { from: /TimeFlowCardBeta\b/g, to: 'TimeFlowCard' },

  // 10. Fix import paths for renamed files
  { from: /from '\.\/components\/TimeFlowCardEditorBeta'/g, to: "from './components/TimeFlowCardEditor'" },
  { from: /from "\.\/components\/TimeFlowCardEditorBeta"/g, to: 'from "./components/TimeFlowCardEditor"' },

  // 11. Fix card name in customCards registration
  { from: /name: 'TimeFlow Card beta'/g, to: "name: 'TimeFlow Card'" },
  { from: /name: "TimeFlow Card beta"/g, to: 'name: "TimeFlow Card"' },

  // 12. Fix fallback type patterns (with || operator)
  { from: /\|\| 'custom:timeflow-card-beta'/g, to: "|| 'custom:timeflow-card'" },
  { from: /\|\| "custom:timeflow-card-beta"/g, to: '|| "custom:timeflow-card"' }
];

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  console.error(`Error: Target directory not found at ${TARGET_DIR}`);
  process.exit(1);
}

function processFile(sourcePath, targetPath) {
  let content = fs.readFileSync(sourcePath, 'utf8');

  // Apply replacements
  REPLACEMENTS.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`Synced: ${path.relative(TARGET_DIR, targetPath)}`);
}

function traverseDirectory(currentPath, relativePath = '') {
  const items = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(currentPath, item.name);
    const itemRelativePath = path.join(relativePath, item.name);

    if (item.isDirectory()) {
      traverseDirectory(itemPath, itemRelativePath);
    } else {
      // Check if this file should be renamed
      const fileName = item.name;
      const targetFileName = FILE_RENAMES[fileName] || fileName;

      // Construct target path with potential rename
      const dirName = path.dirname(itemRelativePath);
      const targetRelativePath = path.join(dirName, targetFileName);

      const targetPath = path.join(TARGET_DIR, targetRelativePath);
      processFile(itemPath, targetPath);
    }
  }
}

console.log('Starting SAFER synchronization from Beta to Main...');
console.log(`Source: ${SOURCE_DIR}`);
console.log(`Target: ${TARGET_DIR}`);

INCLUDED_PATHS.forEach(entry => {
  const sourcePath = path.join(SOURCE_DIR, entry);
  const targetPath = path.join(TARGET_DIR, entry);

  if (fs.existsSync(sourcePath)) {
    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      traverseDirectory(sourcePath, entry);
    } else {
      processFile(sourcePath, targetPath);
    }
  } else {
    console.warn(`Warning: Source path not found: ${entry}`);
  }
});

console.log('Synchronization complete!');