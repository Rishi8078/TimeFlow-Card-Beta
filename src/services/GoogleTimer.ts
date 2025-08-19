import { HomeAssistant } from '../types/index';
import { TimerData } from './Timer';

/**
 * GoogleTimerService - Handles Google Home custom component timer entities
 * Implements timer ID level tracking similar to Alexa for Google Home timers
 * Based on ha-google-home integration: https://github.com/leikoilja/ha-google-home
 */
export class GoogleTimerService {
  
  // Cache for Google timer ID-based finished state persistence
  private static googleIdCache = new Map<string, any>();

  /**
   * Handles Google Home timer data extraction with timer ID tracking.
   * @param entityId - Google Home timer entity ID
   * @param entity - Entity state object
   * @param hass - Home Assistant object
   * @param parseDuration - Duration parsing utility function
   * @returns TimerData for the primary Google Home timer
   */
  static getGoogleTimerData(
    entityId: string,
    entity: any,
    hass: HomeAssistant,
    parseDuration: (duration: any) => number
  ): TimerData | null {
    const { state, attributes } = entity;

    // The ha-google-home integration stores timers in a list attribute
    const allTimers = attributes.timers || [];

    if (!Array.isArray(allTimers) || allTimers.length === 0) {
      // Check if we have a cached finished timer to display
      const entityCache = this.googleIdCache.get(entityId);
      if (entityCache?.finishedTimerId) {
        // Return finished state for the cached timer
        return {
          isActive: false,
          isPaused: false,
          duration: entityCache.lastDuration || 0,
          remaining: 0,
          finishesAt: null,
          progress: 100,
          finished: true,
          isGoogleTimer: true,
          userDefinedLabel: entityCache.lastLabel || 'Timer',
        };
      }
      return null; // No timers active or cached
    }

    // Create maps for active and all timers with timer_id as key
    const activeTimers = new Map<string, any>();
    const allTimersMap = new Map<string, any>();

    for (const timer of allTimers) {
      if (timer.timer_id) {
        allTimersMap.set(String(timer.timer_id), timer);
        if (timer.status === 'set' || timer.status === 'ringing') {
          activeTimers.set(String(timer.timer_id), timer);
        }
      }
    }

    // Timer ID level tracking - detect finished timers
    const now = Date.now() / 1000; // Convert to seconds to match fire_time
    let entityCache = this.googleIdCache.get(entityId);
    if (!entityCache) {
      entityCache = {};
      this.googleIdCache.set(entityId, entityCache);
    }

    // Check for finished timers (timers that were active but now missing/expired)
    const finishedCandidates: Array<{id: string, fireTime: number}> = [];
    for (const [timerId, timer] of activeTimers.entries()) {
      if (timer.fire_time && timer.fire_time <= now && timer.status !== 'ringing') {
        finishedCandidates.push({id: timerId, fireTime: timer.fire_time});
      }
    }

    // Sort by fire time and pick the most recently finished
    if (finishedCandidates.length > 0) {
      finishedCandidates.sort((a, b) => b.fireTime - a.fireTime);
      entityCache.finishedTimerId = finishedCandidates[0].id;
      const finishedTimer = allTimersMap.get(finishedCandidates[0].id);
      if (finishedTimer) {
        entityCache.lastDuration = finishedTimer.duration || 0;
        entityCache.lastLabel = finishedTimer.label || 'Timer';
      }
    }

    // Clean up finished timer cache if no longer in active list
    if (entityCache.finishedTimerId && !activeTimers.has(entityCache.finishedTimerId)) {
      // Keep it for a short time, then clean up
      setTimeout(() => {
        const cache = this.googleIdCache.get(entityId);
        if (cache?.finishedTimerId === entityCache.finishedTimerId) {
          delete cache.finishedTimerId;
          delete cache.lastDuration;
          delete cache.lastLabel;
        }
      }, 5000); // 5 second display
    }

    // Find primary timer to display
    let primaryTimer: any = null;
    let primaryTimerId: string | null = null;

    // 1. Check if we have a finished timer to display
    if (entityCache.finishedTimerId && allTimersMap.has(entityCache.finishedTimerId)) {
      const finishedTimer = allTimersMap.get(entityCache.finishedTimerId);
      if (finishedTimer.fire_time <= now) {
        return {
          isActive: false,
          isPaused: false,
          duration: finishedTimer.duration || 0,
          remaining: 0,
          finishesAt: null,
          progress: 100,
          finished: true,
          isGoogleTimer: true,
          userDefinedLabel: finishedTimer.label || 'Timer',
        };
      }
    }

    // 2. Find active timer with earliest fire time
    let earliestFireTime = Number.POSITIVE_INFINITY;
    for (const [timerId, timer] of activeTimers.entries()) {
      if (timer.fire_time && timer.fire_time < earliestFireTime) {
        earliestFireTime = timer.fire_time;
        primaryTimer = timer;
        primaryTimerId = timerId;
      }
    }

    // 3. If no active timers, check for paused timers
    if (!primaryTimer) {
      for (const timer of allTimers) {
        if (timer.status === 'paused' && timer.timer_id) {
          primaryTimer = timer;
          primaryTimerId = String(timer.timer_id);
          break;
        }
      }
    }

    if (!primaryTimer) {
      return null;
    }

    // --- Calculate timer properties ---
    const isActive = primaryTimer.status === 'set' || primaryTimer.status === 'ringing';
    const isPaused = primaryTimer.status === 'paused';
    const isRinging = primaryTimer.status === 'ringing';

    // Duration is in seconds according to the documentation
    const duration = typeof primaryTimer.duration === 'number' 
      ? primaryTimer.duration 
      : parseDuration(primaryTimer.duration || '0');
    
    // Remaining time calculation
    let remaining = 0;
    if (isActive && primaryTimer.fire_time) {
      remaining = Math.max(0, Math.floor(primaryTimer.fire_time - now));
    } else if (isPaused) {
      // For paused timers, we need to calculate remaining based on duration and elapsed time
      // This might need adjustment based on actual Google Home behavior
      remaining = duration; // Simplified - may need more complex logic
    }

    // Parse local_time_iso for finishesAt
    let finishesAt: Date | null = null;
    if (primaryTimer.local_time_iso) {
      try {
        finishesAt = new Date(primaryTimer.local_time_iso);
        if (isNaN(finishesAt.getTime())) {
          finishesAt = null;
        }
      } catch {
        finishesAt = null;
      }
    }

    // Calculate progress
    let progress = 0;
    if (duration > 0) {
      if (isRinging || (remaining === 0 && isActive)) {
        progress = 100;
      } else {
        const elapsed = duration - remaining;
        progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      }
    }
    
    const isFinished = isRinging || (remaining === 0 && primaryTimer.status !== 'paused');

    return {
      isActive: isActive && !isRinging,
      isPaused,
      duration,
      remaining,
      finishesAt,
      progress,
      finished: isFinished,
      isGoogleTimer: true,
      userDefinedLabel: primaryTimer.label || null,
      // Additional Google Home specific data
      googleTimerId: primaryTimerId || undefined,
      googleTimerStatus: primaryTimer.status, // 'none', 'set', 'ringing', 'paused'
    };
  }

  /**
   * AUTO-DISCOVERY: Attempts to find Google Home timer entities
   * @param hass - Home Assistant object
   * @param isGoogleTimer - Google timer detection function
   * @param getTimerData - Timer data extraction function
   * @returns string[] - Array of potential Google timer entity IDs
   */
  static discoverGoogleTimers(
    hass: HomeAssistant,
    isGoogleTimer: (entityId: string) => boolean,
    getTimerData: (entityId: string, hass: HomeAssistant) => TimerData | null
  ): string[] {
    if (!hass || !hass.states) return [];
    
    const googleTimers: string[] = [];
    
    for (const entityId in hass.states) {
      if (isGoogleTimer(entityId)) {
        const entity = hass.states[entityId];
        // Check if entity has timers attributes with valid data
        const attributes = entity.attributes || {};
        const timers = attributes.timers || [];

        if (Array.isArray(timers) && timers.length > 0) {
          // Check if any timer has valid status
          const hasValidTimer = timers.some((timer: any) => 
            timer.timer_id && 
            timer.status && 
            ['set', 'ringing', 'paused'].includes(timer.status)
          );

          if (hasValidTimer) {
            googleTimers.push(entityId);
            continue;
          }
        }

        // Fallback: use getTimerData to check for active/paused timers
        const timerData = getTimerData(entityId, hass);
        if (timerData && (timerData.isActive || timerData.isPaused || timerData.finished)) {
          googleTimers.push(entityId);
        }
      }
    }
    
    return googleTimers;
  }

  /**
   * Checks if Google Home entity has any timers
   * @param entityId - Entity ID
   * @param entity - Entity state object
   * @returns boolean - Whether entity has timers
   */
  static hasAnyTimers(entityId: string, entity: any): boolean {
    try {
      const attributes = entity.attributes;
      const timers = attributes?.timers || [];
      return Array.isArray(timers) && timers.length > 0;
    } catch {
      return false;
    }
  }
}
