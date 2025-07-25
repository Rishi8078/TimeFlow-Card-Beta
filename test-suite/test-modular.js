#!/usr/bin/env node

/**
 * Automated test script for TimeFlow Card modular build
 * Tests module structure, bundling, and basic functionality
 */

const fs = require('fs');
const path = require('path');

class ModularBuildTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(formatted);
    
    if (type === 'error') {
      this.errors.push(message);
    }
  }

  addResult(test, passed, message) {
    this.results.push({ test, passed, message });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    this.log(`${test}: ${status} - ${message}`, passed ? 'info' : 'error');
  }

  async runTests() {
    this.log('🧪 Starting TimeFlow Card modular build tests...');
    
    try {
      await this.testFileStructure();
      await this.testBuildOutput();
      await this.testModuleIntegrity();
      await this.testBundleContent();
      
      this.printSummary();
    } catch (error) {
      this.log(`Critical test error: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async testFileStructure() {
    this.log('📁 Testing file structure...');

    const requiredFiles = [
      'src/index.js',
      'src/components/TimeFlowCard.js',
      'src/components/ProgressCircle.js',
      'src/services/TemplateService.js',
      'src/services/CountdownService.js',
      'src/utils/DateParser.js',
      'src/utils/ConfigValidator.js',
      'src/utils/StyleManager.js',
      'build.js',
      'timeflow-card-modular.js'
    ];

    requiredFiles.forEach(file => {
      const exists = fs.existsSync(file);
      this.addResult(`File Structure: ${file}`, exists, 
        exists ? 'File exists' : 'File missing');
    });

    // Test directory structure
    const requiredDirs = ['src', 'src/components', 'src/services', 'src/utils'];
    requiredDirs.forEach(dir => {
      const exists = fs.existsSync(dir) && fs.statSync(dir).isDirectory();
      this.addResult(`Directory Structure: ${dir}`, exists,
        exists ? 'Directory exists' : 'Directory missing');
    });
  }

  async testBuildOutput() {
    this.log('🔨 Testing build output...');

    const bundleFile = 'timeflow-card-modular.js';
    
    if (!fs.existsSync(bundleFile)) {
      this.addResult('Build Output: Bundle file', false, 'Bundle file does not exist');
      return;
    }

    const stats = fs.statSync(bundleFile);
    const sizeKB = stats.size / 1024;
    
    // Bundle should be reasonable size (50-150KB)
    const sizeOk = sizeKB >= 50 && sizeKB <= 150;
    this.addResult('Build Output: Bundle size', sizeOk, 
      `${sizeKB.toFixed(2)}KB ${sizeOk ? '(reasonable)' : '(suspicious)'}`);

    // Test if bundle is recent (modified within last hour)
    const ageMinutes = (Date.now() - stats.mtime.getTime()) / 60000;
    const recentBuild = ageMinutes < 60;
    this.addResult('Build Output: Build freshness', recentBuild,
      `Built ${ageMinutes.toFixed(1)} minutes ago`);
  }

  async testModuleIntegrity() {
    this.log('🔍 Testing module integrity...');

    const modules = [
      { file: 'src/components/TimeFlowCard.js', expectedExports: ['TimeFlowCardBeta'] },
      { file: 'src/components/ProgressCircle.js', expectedExports: ['ProgressCircleBeta'] },
      { file: 'src/services/TemplateService.js', expectedExports: ['TemplateService'] },
      { file: 'src/services/CountdownService.js', expectedExports: ['CountdownService'] },
      { file: 'src/utils/DateParser.js', expectedExports: ['DateParser'] },
      { file: 'src/utils/ConfigValidator.js', expectedExports: ['ConfigValidator'] },
      { file: 'src/utils/StyleManager.js', expectedExports: ['StyleManager'] }
    ];

    modules.forEach(module => {
      try {
        const content = fs.readFileSync(module.file, 'utf8');
        
        // Check for export statements
        const hasExports = module.expectedExports.every(exportName => 
          content.includes(`export class ${exportName}`) || 
          content.includes(`export { ${exportName}`)
        );
        
        this.addResult(`Module Integrity: ${module.file}`, hasExports,
          hasExports ? 'Exports found' : 'Missing expected exports');

        // Check for basic class structure
        const hasClassDefinition = module.expectedExports.every(exportName =>
          content.includes(`class ${exportName}`)
        );
        
        this.addResult(`Module Structure: ${module.file}`, hasClassDefinition,
          hasClassDefinition ? 'Class definitions found' : 'Missing class definitions');

        // Check for imports (except index.js)
        if (module.file !== 'src/index.js') {
          const hasImports = content.includes('import') || content.includes('require');
          // Note: Some modules might not have imports, which is okay
          this.addResult(`Module Imports: ${module.file}`, true,
            hasImports ? 'Has imports' : 'No imports (standalone module)');
        }

      } catch (error) {
        this.addResult(`Module Integrity: ${module.file}`, false, 
          `Error reading file: ${error.message}`);
      }
    });
  }

  async testBundleContent() {
    this.log('📦 Testing bundle content...');

    const bundleFile = 'timeflow-card-modular.js';
    
    if (!fs.existsSync(bundleFile)) {
      this.addResult('Bundle Content: File exists', false, 'Bundle file missing');
      return;
    }

    try {
      const content = fs.readFileSync(bundleFile, 'utf8');
      
      // Test for expected classes in bundle
      const expectedClasses = [
        'TimeFlowCardBeta', 'ProgressCircleBeta', 'TemplateService', 'CountdownService',
        'DateParser', 'ConfigValidator', 'StyleManager'
      ];

      expectedClasses.forEach(className => {
        const hasClass = content.includes(`class ${className}`);
        this.addResult(`Bundle Content: ${className}`, hasClass,
          hasClass ? 'Class found in bundle' : 'Class missing from bundle');
      });

      // Test for component registration
      const hasRegistration = content.includes('customElements.define');
      this.addResult('Bundle Content: Component registration', hasRegistration,
        hasRegistration ? 'Custom elements registration found' : 'Missing component registration');

      // Test for card registration
      const hasCardRegistration = content.includes('window.customCards');
      this.addResult('Bundle Content: Card registration', hasCardRegistration,
        hasCardRegistration ? 'Card registration found' : 'Missing card registration');

      // Test that internal imports have been resolved, but external imports are preserved
      const importMatches = content.match(/import .* from ['"][^'"]*['"];?/g) || [];
      const internalImports = importMatches.filter(imp => 
        imp.includes("'./") || imp.includes('"./') || 
        imp.includes("'../") || imp.includes('"../')
      );
      const externalImports = importMatches.filter(imp => 
        imp.includes("'lit") || imp.includes('"lit')
      );
      
      const hasUnresolvedInternalImports = internalImports.length > 0;
      const hasValidExternalImports = externalImports.length > 0;
      
      this.addResult('Bundle Content: Import resolution', !hasUnresolvedInternalImports,
        hasUnresolvedInternalImports 
          ? `Unresolved internal imports found: ${internalImports.length}` 
          : hasValidExternalImports 
            ? `All internal imports resolved, external Lit imports preserved: ${externalImports.length}`
            : 'All internal imports resolved');

      // Test for version information
      const hasVersion = content.includes('TimeFlowCardBeta.version') || content.includes('Version 1.2.0');
      this.addResult('Bundle Content: Version info', hasVersion,
        hasVersion ? 'Version information found' : 'Missing version information');

      // Test bundle header
      const hasHeader = content.includes('TimeFlow Card - Modular Architecture Bundle');
      this.addResult('Bundle Content: Build header', hasHeader,
        hasHeader ? 'Build header found' : 'Missing build header');

    } catch (error) {
      this.addResult('Bundle Content: Reading', false, `Error: ${error.message}`);
    }
  }

  printSummary() {
    this.log('\n📊 Test Summary');
    this.log('='.repeat(50));
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    this.log(`Total Tests: ${totalTests}`);
    this.log(`Passed: ${passedTests}`);
    this.log(`Failed: ${failedTests}`);
    this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      this.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        this.log(`  • ${result.test}: ${result.message}`);
      });
    }
    
    if (this.errors.length > 0) {
      this.log('\n🚨 Errors:');
      this.errors.forEach(error => {
        this.log(`  • ${error}`);
      });
    }
    
    this.log('\n' + '='.repeat(50));
    
    if (failedTests === 0) {
      this.log('🎉 All tests passed! Modular build is working correctly.');
      process.exit(0);
    } else {
      this.log('💥 Some tests failed. Please review the issues above.');
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ModularBuildTester();
  tester.runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = ModularBuildTester;
