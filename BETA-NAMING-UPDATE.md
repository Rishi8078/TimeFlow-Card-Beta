# Beta Component Naming Update

## Overview
Updated all component registrations to use beta naming convention to distinguish this repository as the beta version.

## Changes Made

### Component Registration
- Changed `timeflow-card` → `timeflow-card-beta`
- Changed `progress-circle` → `progress-circle-beta`

### Updated Files
1. **Source Code**
   - `src/index.js` - Component registration and card type
   - `src/components/TimeFlowCard.js` - Stub configuration

2. **Documentation**  
   - `README.md` - All configuration examples updated to use `custom:timeflow-card-beta`

3. **Test Files**
   - `test-suite/test-integration.js` - Component availability and instantiation tests
   - `test-suite/test-modular-build.html` - All test configurations and element creation

4. **Distribution**
   - `timeflow-card-modular.js` - Rebuilt with beta component names

## Usage
Users should now configure the card in Home Assistant using:

```yaml
type: custom:timeflow-card-beta
# ... other configuration
```

## Verification
- ✅ All 16 integration tests passing at 100% success rate
- ✅ Bundle size: 82.73 KB (unchanged)
- ✅ Component registration working correctly
- ✅ Configuration and stub config updated
- ✅ Documentation examples updated

## Impact
This change ensures clear distinction between the beta repository and any production version, preventing user confusion and providing appropriate versioning semantics.
