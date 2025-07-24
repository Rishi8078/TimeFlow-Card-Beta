/**
 * TimeFlow Card - Entry point for modular architecture
 * Registers components and exposes the card to Home Assistant
 */
import { TimeFlowCard } from './components/TimeFlowCard.js';
import { ProgressCircle } from './components/ProgressCircle.js';

// Register custom elements with duplicate protection
if (!customElements.get('progress-circle-beta')) {
  customElements.define('progress-circle-beta', ProgressCircle);
  console.debug('TimeFlow Card Beta: Registered progress-circle-beta component');
} else {
  console.debug('TimeFlow Card Beta: progress-circle-beta component already registered');
}
if (!customElements.get('timeflow-card-beta')) {
  customElements.define('timeflow-card-beta', TimeFlowCard);
  console.debug('TimeFlow Card Beta: Registered timeflow-card-beta component');
} else {
  console.debug('TimeFlow Card Beta: timeflow-card-beta component already registered');
}

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timeflow-card-beta',
  name: 'TimeFlow Card',
  description: 'A beautiful countdown timer card with progress circle for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/Rishi8078/TimeFlow-Card'
});

console.info(
  `%c  TIMEFLOW-CARD  \n%c  Version ${TimeFlowCard.version}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

// Export main class for external use
export { TimeFlowCard, ProgressCircle };
