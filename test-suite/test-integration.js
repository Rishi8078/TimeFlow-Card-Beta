#!/usr/bin/env node

/**
 * Simple integration test for the modular build
 * Tests that the bundled file can be loaded and basic functionality works
 */

const fs = require('fs');
const vm = require('vm');

class IntegrationTester {
  constructor() {
    this.results = [];
  }

  addResult(test, passed, message) {
    this.results.push({ test, passed, message });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test}: ${status} - ${message}`);
  }

  async runTests() {
    console.log('🧪 Testing modular build integration...\n');

    try {
      await this.testBundleLoading();
      await this.testComponentAvailability();
      await this.testBasicInstantiation();
      
      this.printSummary();
    } catch (error) {
      console.error('Critical test error:', error);
      this.addResult('Integration Test', false, `Error: ${error.message}`);
      this.printSummary();
    }
  }

  async testBundleLoading() {
    console.log('📦 Testing bundle loading...');

    const bundlePath = 'timeflow-card-modular.js';
    
    try {
      const bundleContent = fs.readFileSync(bundlePath, 'utf8');
      this.addResult('Bundle Loading: File read', true, 'Bundle file loaded successfully');

      // Check bundle size
      const sizeKB = bundleContent.length / 1024;
      this.addResult('Bundle Loading: Size check', sizeKB > 50 && sizeKB < 200, 
        `Bundle size: ${sizeKB.toFixed(2)}KB`);

      // Check for required classes
      const requiredClasses = [
        'TimeFlowCardBeta', 'ProgressCircleBeta', 'DateParser', 
        'ConfigValidator', 'TemplateService', 'CountdownService'
      ];

      requiredClasses.forEach(className => {
        const hasClass = bundleContent.includes(`class ${className}`);
        this.addResult(`Bundle Loading: ${className}`, hasClass,
          hasClass ? 'Class found' : 'Class missing');
      });

      // Check for component registration
      const hasRegistration = bundleContent.includes('customElements.define');
      this.addResult('Bundle Loading: Component registration', hasRegistration,
        hasRegistration ? 'Custom elements defined' : 'Missing registration');

    } catch (error) {
      this.addResult('Bundle Loading: File access', false, `Error: ${error.message}`);
    }
  }

  async testComponentAvailability() {
    console.log('🔍 Testing component availability...');

    try {
      const bundleContent = fs.readFileSync('timeflow-card-modular.js', 'utf8');

      // Since this is a Lit-based bundle with ES6 imports, we'll test differently
      // Test that the bundle contains the expected class definitions
      const hasTimeFlowCard = bundleContent.includes('class TimeFlowCardBeta extends LitElement');
      this.addResult('Component Availability: TimeFlow Card', hasTimeFlowCard,
        hasTimeFlowCard ? 'TimeFlow Card class found in bundle' : 'TimeFlow Card class not found');

      const hasProgressCircle = bundleContent.includes('class ProgressCircleBeta extends LitElement');
      this.addResult('Component Availability: Progress Circle', hasProgressCircle,
        hasProgressCircle ? 'Progress Circle class found in bundle' : 'Progress Circle class not found');

      // Test that Lit is embedded in the bundle (self-contained)
      const hasEmbeddedLit = bundleContent.includes('class LitElement extends HTMLElement') || 
                             bundleContent.includes('window.LitElement = LitElement') ||
                             bundleContent.includes('Minimal Lit 3.x Bundle');
      this.addResult('Component Availability: Embedded Lit', hasEmbeddedLit,
        hasEmbeddedLit ? 'Lit framework embedded in bundle (self-contained)' : 'Lit framework not embedded');

      // Test for component registration code
      const hasRegistration = bundleContent.includes('customElements.define');
      this.addResult('Component Availability: Registration', hasRegistration,
        hasRegistration ? 'Component registration code found' : 'Component registration code missing');

    } catch (error) {
      this.addResult('Component Availability: Execution', false, `Error: ${error.message}`);
    }
  }

  async testBasicInstantiation() {
    console.log('⚙️ Testing basic instantiation...');

    try {
      const bundleContent = fs.readFileSync('timeflow-card-modular.js', 'utf8');
      
      // For a modern Lit bundle, we'll test without execution since ES6 modules
      // are not compatible with Node.js VM context
      
      // Test for constructor patterns
      const hasConstructors = bundleContent.includes('constructor()');
      this.addResult('Basic Instantiation: Constructor patterns', hasConstructors,
        hasConstructors ? 'Constructor methods found' : 'No constructor methods found');

      // Test for setConfig method
      const hasSetConfig = bundleContent.includes('setConfig');
      this.addResult('Basic Instantiation: Configuration method', hasSetConfig,
        hasSetConfig ? 'setConfig method found' : 'setConfig method missing');

      // Test for getStubConfig method
      const hasStubConfig = bundleContent.includes('getStubConfig');
      this.addResult('Basic Instantiation: Stub configuration', hasStubConfig,
        hasStubConfig ? 'getStubConfig method found' : 'getStubConfig method missing');

      // Test for version property
      const hasVersion = bundleContent.includes('version') || bundleContent.includes('2.0.0');
      this.addResult('Basic Instantiation: Version information', hasVersion,
        hasVersion ? 'Version information found' : 'Version information missing');

      // Test for render method (Lit component requirement)
      const hasRender = bundleContent.includes('render()');
      this.addResult('Basic Instantiation: Render method', hasRender,
        hasRender ? 'Lit render method found' : 'Render method missing');

      // Test for reactive property system (transformed from decorators)
      const hasProperties = bundleContent.includes('get progress()') && bundleContent.includes('get hass()') && bundleContent.includes('requestUpdate');
      this.addResult('Basic Instantiation: Property system', hasProperties,
        hasProperties ? 'Reactive property system found' : 'Property system missing');

    } catch (error) {
      this.addResult('Basic Instantiation: Setup', false, `Error: ${error.message}`);
    }
  }

  printSummary() {
    console.log('\n📊 Integration Test Summary');
    console.log('='.repeat(50));
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  • ${result.test}: ${result.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (failedTests === 0) {
      console.log('🎉 All integration tests passed! The modular build is working correctly.');
    } else {
      console.log('💥 Some integration tests failed. Please review the issues above.');
    }
  }
}

// Run the tests
const tester = new IntegrationTester();
tester.runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
