/**
 * Manual verification script to test icon size and stroke width fixes
 * Run in browser console on test-icon-stroke.html
 */

console.log("🔍 TimeFlow Card Fix Verification");
console.log("=================================");

// Get all cards
const cards = document.querySelectorAll('timeflow-card-beta');
console.log(`Found ${cards.length} test cards`);

cards.forEach((card, index) => {
  console.log(`\n📊 Card ${index + 1}:`);
  
  // Get config from card
  const config = card.config || {};
  console.log(`  Config icon_size: ${config.icon_size}`);
  console.log(`  Config stroke_width: ${config.stroke_width}`);
  
  // Get progress circle element
  const circle = card.shadowRoot?.querySelector('progress-circle-beta');
  if (circle) {
    // Check actual rendered styles
    const circleElement = circle.shadowRoot?.querySelector('.circle');
    if (circleElement) {
      const styles = window.getComputedStyle(circleElement);
      console.log(`  Rendered width: ${styles.width}`);
      console.log(`  Rendered height: ${styles.height}`);
    }
    
    const pathElement = circle.shadowRoot?.querySelector('path');
    if (pathElement) {
      const strokeWidth = pathElement.getAttribute('stroke-width');
      console.log(`  Rendered stroke-width: ${strokeWidth}`);
    }
  }
});

console.log("\n✅ Manual verification complete - check values above");
console.log("Expected: icon_size values of 250px+ should work, stroke_width should be respected");
