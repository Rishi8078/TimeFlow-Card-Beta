/**
 * TimeUtils - Shared time constants and utilities
 * Provides centralized time conversion constants and helper functions
 * to eliminate magic numbers and duplicate logic across the codebase.
 */

// ============================================================================
// Time Conversion Constants (in milliseconds)
// ============================================================================

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;      // 60,000
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;        // 3,600,000
export const MS_PER_DAY = 24 * MS_PER_HOUR;           // 86,400,000

// Seconds-based constants (for timer calculations)
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;   // 3,600
export const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;      // 86,400

// ============================================================================
// CSS/Style Constants
// ============================================================================

/** Default background color with HA theme fallbacks */
export const DEFAULT_BACKGROUND = 'var(--ha-card-background, var(--ha-card-background-color, #1a1a1a))';

/** Default text color with HA theme fallback */
export const DEFAULT_TEXT_COLOR = 'var(--primary-text-color, #fff)';

// ============================================================================
// Time Units Interface
// ============================================================================

export interface TimeUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parses milliseconds into time units (days, hours, minutes, seconds)
 * @param ms - Total milliseconds
 * @returns TimeUnits object with days, hours, minutes, seconds
 */
export function parseMillisecondsToUnits(ms: number): TimeUnits {
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const days = Math.floor(ms / MS_PER_DAY);
  const hours = Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND);
  
  return { days, hours, minutes, seconds };
}

/**
 * Parses seconds into time units (for timer entity remaining time)
 * @param totalSeconds - Total seconds
 * @returns TimeUnits object with days, hours, minutes, seconds
 */
export function parseSecondsToUnits(totalSeconds: number): TimeUnits {
  if (totalSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = Math.floor(totalSeconds % SECONDS_PER_MINUTE);
  
  return { days, hours, minutes, seconds };
}
