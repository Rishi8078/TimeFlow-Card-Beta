#!/usr/bin/env node

/**
 * Build script for TimeFlow Card - Modular Architecture with Lit 3.x support
 * Bundles all modules into a single file for distribution
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distFile = path.join(__dirname, 'timeflow-card-modular.js');

/**
 * Resolves ES6 imports and bundles files with Lit support
 */
function bundleFiles() {
  const processedFiles = new Set();
  const externalImports = new Set();
  
  function processFile(filePath) {
    if (processedFiles.has(filePath)) {
      return '';
    }
    
    processedFiles.add(filePath);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File not found: ${filePath}`);
      return '';
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract and process imports - improved regex to handle various import patterns
    const importRegex = /import\s+(\{[^}]+\}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"];?\s*/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importedItems = match[1];
      const importPath = match[2];
      
      // Check if this is an external import (like 'lit', 'lit/decorators.js')
      if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
        // This is an external import - preserve it at the top level
        externalImports.add(match[0].trim());
        content = content.replace(match[0], '');
        continue;
      }
      
      // Handle relative imports (internal modules)
      let resolvedPath;
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // Relative import
        resolvedPath = path.resolve(path.dirname(filePath), importPath);
        if (!resolvedPath.endsWith('.js')) {
          resolvedPath += '.js';
        }
      } else {
        // Absolute import from src
        resolvedPath = path.join(srcDir, importPath);
        if (!resolvedPath.endsWith('.js')) {
          resolvedPath += '.js';
        }
      }
      
      // Process the imported file recursively
      const importedContent = processFile(resolvedPath);
      
      // Remove the import statement
      content = content.replace(match[0], '');
      
      // Add the imported content at the beginning
      content = importedContent + '\n' + content;
    }
    
    // Remove export statements and convert to regular declarations
    content = content.replace(/export\s+class\s+/g, 'class ');
    content = content.replace(/export\s+\{[^}]+\};\s*$/gm, '');
    content = content.replace(/export\s+default\s+/g, '');
    
    return content;
  }
  
  // Start with the entry point
  const entryPoint = path.join(srcDir, 'index.js');
  let bundledContent = processFile(entryPoint);
  
  // Add external imports at the top
  const externalImportsArray = Array.from(externalImports);
  const externalImportsContent = externalImportsArray.length > 0 
    ? externalImportsArray.join('\n') + '\n\n' 
    : '';
  
  // Return the bundle with external imports at the top
  return externalImportsContent + bundledContent;
}

/**
 * Main build function
 */
function build() {
  console.log('🏗️  Building TimeFlow Card with Lit 3.x...');
  
  try {
    const bundledContent = bundleFiles();
    
    // Add header comment
    const header = `/**
 * TimeFlow Card - Modular Architecture Bundle with Lit 3.x
 * Generated: ${new Date().toISOString()}
 * 
 * This bundle includes all modular components:
 * - TimeFlowCardBeta (Main card component using LitElement) 
 * - ProgressCircleBeta (Progress circle component using LitElement)
 * - TemplateService (Template evaluation)
 * - CountdownService (Countdown logic)
 * - DateParser (Date parsing utilities)
 * - ConfigValidator (Configuration validation)
 * - StyleManager (Style management)
 * 
 * External Dependencies:
 * - Lit 3.x (LitElement, html, css, property, state decorators)
 */

`;
    
    const finalContent = header + bundledContent;
    
    fs.writeFileSync(distFile, finalContent, 'utf8');
    console.log('✅ Bundle created:', distFile);
    console.log('📦 Size:', (fs.statSync(distFile).size / 1024).toFixed(2), 'KB');
    console.log('🔗 External dependencies preserved for CDN/bundler resolution');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

/**
 * Watches for changes during development
 */
function watchFiles() {
  console.log('👀 Watching for changes...');
  
  function watchDir(dir) {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.js')) {
        const filePath = path.join(dir, filename);
        if (fs.existsSync(filePath)) {
          console.log('📝 Changed:', filename);
          setTimeout(build, 100); // Debounce
        }
      }
    });
  }
  
  watchDir(srcDir);
  build(); // Initial build
}

// Main execution
if (require.main === module) {
  const isWatchMode = process.argv.includes('--watch');
  
  if (isWatchMode) {
    watchFiles();
  } else {
    build();
  }
}

module.exports = { bundleFiles, build };
