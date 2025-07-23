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
        'TimeFlowCard', 'ProgressCircle', 'DateParser', 
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
      
      // Create a minimal DOM-like environment
      const context = {
        console: console,
        HTMLElement: class HTMLElement {
          constructor() {
            this.shadowRoot = null;
            this.style = {};
          }
          attachShadow() {
            this.shadowRoot = {
              innerHTML: '',
              querySelector: () => null,
              appendChild: () => {}
            };
            return this.shadowRoot;
          }
          setAttribute() {}
          getAttribute() { return null; }
          addEventListener() {}
          removeEventListener() {}
        },
        customElements: {
          define: function(name, constructor) {
            this[name] = constructor;
            console.log(`Registered custom element: ${name}`);
          },
          get: function(name) {
            return this[name];
          }
        },
        window: {
          customCards: []
        },
        document: {
          createElement: function(tagName) {
            return new context.HTMLElement();
          }
        },
        performance: {
          now: () => Date.now()
        },
        requestAnimationFrame: (callback) => setTimeout(callback, 16)
      };

      // Execute the bundle in the context
      vm.createContext(context);
      vm.runInContext(bundleContent, context);

      // Test component registration
      const timeflowRegistered = context.customElements['timeflow-card'];
      this.addResult('Component Availability: TimeFlow Card', !!timeflowRegistered,
        timeflowRegistered ? 'TimeFlow Card registered' : 'TimeFlow Card not registered');

      const progressRegistered = context.customElements['progress-circle'];
      this.addResult('Component Availability: Progress Circle', !!progressRegistered,
        progressRegistered ? 'Progress Circle registered' : 'Progress Circle not registered');

      // Test card registration
      const cardRegistered = context.window.customCards.length > 0;
      this.addResult('Component Availability: Card registration', cardRegistered,
        cardRegistered ? `${context.window.customCards.length} cards registered` : 'No cards registered');

    } catch (error) {
      this.addResult('Component Availability: Execution', false, `Error: ${error.message}`);
    }
  }

  async testBasicInstantiation() {
    console.log('⚙️ Testing basic instantiation...');

    try {
      const bundleContent = fs.readFileSync('timeflow-card-modular.js', 'utf8');
      
      // Enhanced context with more DOM-like behavior
      const context = {
        console: console,
        Date: Date,
        Math: Math,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        HTMLElement: class HTMLElement {
          constructor() {
            this.shadowRoot = null;
            this.style = {};
            this._config = {};
          }
          attachShadow() {
            this.shadowRoot = {
              innerHTML: '',
              querySelector: () => ({ 
                style: {},
                setAttribute: () => {},
                getAttribute: () => null,
                textContent: '',
                classList: { toggle: () => {}, add: () => {}, remove: () => {} }
              }),
              appendChild: () => {}
            };
            return this.shadowRoot;
          }
          setAttribute() {}
          getAttribute() { return null; }
          addEventListener() {}
          removeEventListener() {}
          setConfig(config) { this._config = config; }
        },
        customElements: {
          define: function(name, constructor) {
            this[name] = constructor;
          },
          get: function(name) {
            return this[name];
          }
        },
        window: {
          customCards: []
        },
        document: {
          createElement: function(tagName) {
            const element = new context.HTMLElement();
            if (tagName === 'timeflow-card' && context.customElements['timeflow-card']) {
              return new context.customElements['timeflow-card']();
            }
            return element;
          }
        },
        performance: {
          now: () => Date.now()
        },
        requestAnimationFrame: (callback) => setTimeout(callback, 16)
      };

      // Execute the bundle
      vm.createContext(context);
      vm.runInContext(bundleContent, context);

      // Test instantiation
      try {
        const TimeFlowCardClass = context.customElements['timeflow-card'];
        if (TimeFlowCardClass) {
          const card = new TimeFlowCardClass();
          this.addResult('Basic Instantiation: Card creation', true, 'Card instance created');

          // Test configuration
          const testConfig = {
            type: 'timeflow-card',
            target_date: '2024-12-31T23:59:59',
            title: 'Test Timer'
          };

          try {
            card.setConfig(testConfig);
            this.addResult('Basic Instantiation: Configuration', true, 'Configuration accepted');
          } catch (configError) {
            this.addResult('Basic Instantiation: Configuration', false, `Config error: ${configError.message}`);
          }

          // Test static methods
          try {
            const stubConfig = TimeFlowCardClass.getStubConfig();
            const hasValidStub = stubConfig && stubConfig.type === 'timeflow-card';
            this.addResult('Basic Instantiation: Stub config', hasValidStub, 
              hasValidStub ? 'Valid stub configuration' : 'Invalid stub configuration');
          } catch (stubError) {
            this.addResult('Basic Instantiation: Stub config', false, `Stub error: ${stubError.message}`);
          }

          // Test version
          try {
            const version = TimeFlowCardClass.version;
            const hasVersion = typeof version === 'string' && version.length > 0;
            this.addResult('Basic Instantiation: Version', hasVersion, 
              hasVersion ? `Version: ${version}` : 'No version');
          } catch (versionError) {
            this.addResult('Basic Instantiation: Version', false, `Version error: ${versionError.message}`);
          }

        } else {
          this.addResult('Basic Instantiation: Card creation', false, 'TimeFlowCard class not available');
        }
      } catch (instantiationError) {
        this.addResult('Basic Instantiation: Card creation', false, `Error: ${instantiationError.message}`);
      }

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
