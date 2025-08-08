/**
 * TimeFlow Card - Entry point for modular architecture with Lit components
 * Registers Lit-based custom elements and exposes the card to Home Assistant
 */

// Type declarations for Home Assistant globals
declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}

import { TimeFlowCardBeta } from './components/TimeFlowCard';
import { ProgressCircleBeta } from './components/ProgressCircle';
import { ErrorDisplay } from './utils/ErrorDisplay';

// Register Lit custom elements with duplicate protection
if (!customElements.get('error-display')) {
  customElements.define('error-display', ErrorDisplay);
  console.debug('TimeFlow Card: Registered error-display component');
} else {
  console.debug('TimeFlow Card: error-display component already registered');
}

if (!customElements.get('progress-circle-beta')) {
  customElements.define('progress-circle-beta', ProgressCircleBeta);
  console.debug('TimeFlow Card: Registered progress-circle-beta component');
} else {
  console.debug('TimeFlow Card: progress-circle-beta component already registered');
}

if (!customElements.get('timeflow-card-beta')) {
  customElements.define('timeflow-card-beta', TimeFlowCardBeta);
  console.debug('TimeFlow Card: Registered timeflow-card-beta component');
} else {
  console.debug('TimeFlow Card: timeflow-card-beta component already registered');
}

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timeflow-card-beta',
  name: 'TimeFlow Card (Lit Version)',
  description: 'A beautiful countdown timer card with progress circle for Home Assistant, using Lit',
  preview: true,
  documentationURL: 'https://github.com/Rishi8078/TimeFlow-Card' // Update if needed
});

console.info(
  `%c TIMEFLOW-CARD (Lit) \n%c Version 1.2.0 `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

// Export main classes for external use or testing
export { TimeFlowCardBeta, ProgressCircleBeta, ErrorDisplay };