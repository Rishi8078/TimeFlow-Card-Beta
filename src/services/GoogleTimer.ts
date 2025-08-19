import { HomeAssistant } from '../types/index';
import { TimerData } from './Timer';

/**
 * GoogleTimerService - Handles Google Home custom component timer entities
 * Implements timer ID level tracking similar to Alexa for Google Home timers
 * Based on ha-google-home integration: https://github.com/leikoilja/ha-google-home
 */
export class GoogleTimerService {
  
  // Cache for Google timer ID-based finished state persistence and paused snapshots
  private static googleIdCache = new Map<string, {
    finishedTimerId?: string;
    lastDuration?: number;
    lastLabel?: string;
    pausedSnapshots?: Map<string, { remaining: number; pausedAt: number }>;
  }>();

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
      
      // Return "no timers" state instead of null for auto-discovery compatibility
      return {
        isActive: false,
        isPaused: false,
        duration: 0,
        remaining: 0,
        finishesAt: null,
        progress: 0,
        finished: false,
        isGoogleTimer: true,
        userDefinedLabel: undefined,
        googleTimerId: undefined,
        googleTimerStatus: 'none',
      };
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
        const currentCache = this.googleIdCache.get(entityId);
        if (currentCache && currentCache.finishedTimerId === entityCache.finishedTimerId) {
          delete currentCache.finishedTimerId;
          delete currentCache.lastDuration;
          delete currentCache.lastLabel;
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

    // 3. If no active timers, check for paused timers and other non-active states
    if (!primaryTimer) {
      for (const timer of allTimers) {
        if (timer.timer_id) {
          // Check for paused status (might be 'paused', 'PAUSED', or other variants)
          const status = timer.status?.toLowerCase();
          if (status === 'paused' || timer.status === 'PAUSED') {
            primaryTimer = timer;
            primaryTimerId = String(timer.timer_id);
            break;
          }
          // Fallback: if timer has remaining time but isn't active, treat as paused
          if (!primaryTimer && timer.status !== 'set' && timer.status !== 'ringing' && timer.status !== 'none') {
            if (timer.duration > 0 || timer.remaining_time > 0 || timer.remainingTime > 0) {
              primaryTimer = timer;
              primaryTimerId = String(timer.timer_id);
              // Don't break here - keep looking for an explicitly paused timer
            }
          }
        }
      }
    }

    if (!primaryTimer) {
      // If we have timers but none were selected, this might indicate an unknown status
      // Return information about the first timer to help with debugging
      if (allTimers.length > 0) {
        console.warn('GoogleTimer: Found timers but none selected as primary. First timer:', allTimers[0]);
        // Try to use the first timer as a fallback
        primaryTimer = allTimers[0];
        primaryTimerId = String(allTimers[0].timer_id || 'unknown');
      } else {
        return null;
      }
    }

    // --- Calculate timer properties using real-time logic like Alexa ---
    const isActive = primaryTimer.status === 'set' || primaryTimer.status === 'ringing';
    const isPaused = primaryTimer.status === 'paused' || primaryTimer.status === 'PAUSED' || 
                     (primaryTimer.status !== 'set' && primaryTimer.status !== 'ringing' && 
                      primaryTimer.status !== 'none' && (primaryTimer.duration > 0 || primaryTimer.remaining_time > 0 || primaryTimer.remainingTime > 0));
    const isRinging = primaryTimer.status === 'ringing';

    // Duration is in seconds according to the documentation
    const duration = typeof primaryTimer.duration === 'number' 
      ? primaryTimer.duration 
      : parseDuration(primaryTimer.duration || '0');
    
    // Real-time calculation logic (similar to Alexa timer)
    let remaining = 0;
    let finishesAt: Date | null = null;
    let isFinished = false;

    // Store paused snapshots in cache for accurate resumption
    const cacheKey = `${entityId}_${primaryTimerId}`;
    
    if (isActive) {
      // For active timers, prefer fire_time for live ticking (converted from seconds to ms)
      const fireTimeMs = primaryTimer.fire_time ? primaryTimer.fire_time * 1000 : 0;
      
      if (fireTimeMs && fireTimeMs > now * 1000) {
        remaining = Math.max(0, Math.floor((fireTimeMs - now * 1000) / 1000));
        finishesAt = new Date(fireTimeMs);
      } else {
        // Fallback: if fire_time has passed or is invalid, timer is finished
        remaining = 0;
        finishesAt = null;
        isFinished = true;
      }

      // If we've passed fire_time or remaining is zero, mark as finished
      if ((fireTimeMs && fireTimeMs <= now * 1000) || remaining <= 0) {
        remaining = 0;
        finishesAt = null;
        isFinished = true;
      }
    } else if (isPaused) {
      // For paused timers, we need to store/retrieve the remaining snapshot
      // Initialize paused snapshots cache if needed
      if (!entityCache.pausedSnapshots) {
        entityCache.pausedSnapshots = new Map();
      }

      const pausedSnapshot = entityCache.pausedSnapshots.get(primaryTimerId!);
      
      // Try to get remaining time from timer attributes (if Google Home provides it)
      if (typeof primaryTimer.remaining_time === 'number') {
        remaining = Math.max(0, primaryTimer.remaining_time);
        // Store this snapshot for consistency
        entityCache.pausedSnapshots.set(primaryTimerId!, {
          remaining,
          pausedAt: now
        });
      } else if (typeof primaryTimer.remainingTime === 'number') {
        remaining = Math.max(0, Math.floor(primaryTimer.remainingTime / 1000)); // Convert ms to seconds
        // Store this snapshot for consistency
        entityCache.pausedSnapshots.set(primaryTimerId!, {
          remaining,
          pausedAt: now
        });
      } else if (pausedSnapshot) {
        // Use cached snapshot from when timer was paused
        remaining = pausedSnapshot.remaining;
      } else {
        // Fallback: calculate from duration and elapsed time if available
        const originalDuration = duration;
        const fireTimeMs = primaryTimer.fire_time ? primaryTimer.fire_time * 1000 : 0;
        
        if (fireTimeMs && originalDuration > 0) {
          // Calculate what the remaining time should have been when paused
          const scheduledEndTime = fireTimeMs;
          const pauseTime = now * 1000; // Current time as pause reference
          const calculatedRemaining = Math.max(0, Math.floor((scheduledEndTime - pauseTime) / 1000));
          remaining = Math.min(originalDuration, calculatedRemaining);
          
          // Store this calculated snapshot
          entityCache.pausedSnapshots.set(primaryTimerId!, {
            remaining,
            pausedAt: now
          });
        } else {
          // Last resort: assume full duration remaining (not ideal)
          remaining = duration;
          entityCache.pausedSnapshots.set(primaryTimerId!, {
            remaining,
            pausedAt: now
          });
        }
      }
      
      // No finishesAt for paused timers
      finishesAt = null;
    } else {
      // Timer is off/finished
      remaining = 0;
      finishesAt = null;
      isFinished = true;
    }

    // Parse local_time_iso as additional finishesAt source for active timers
    if (isActive && !finishesAt && primaryTimer.local_time_iso) {
      try {
        const localFinish = new Date(primaryTimer.local_time_iso);
        if (!isNaN(localFinish.getTime())) {
          finishesAt = localFinish;
          // Recalculate remaining based on local_time_iso if more accurate
          const localRemaining = Math.max(0, Math.floor((localFinish.getTime() - now * 1000) / 1000));
          if (Math.abs(localRemaining - remaining) < 5) { // Within 5 seconds tolerance
            remaining = localRemaining;
          }
        }
      } catch {
        // Keep existing finishesAt calculation
      }
    }

    // Calculate progress
    let progress = 0;
    if (duration > 0) {
      if (isRinging || isFinished || (remaining === 0 && isActive)) {
        progress = 100;
      } else {
        const elapsed = Math.max(0, duration - remaining);
        progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      }
    }
    
    // Final finished state determination
    if (!isFinished) {
      isFinished = isRinging || (remaining === 0 && primaryTimer.status !== 'paused');
    }

    // Cache cleanup: remove paused snapshots when timer resumes or finishes
    if (entityCache.pausedSnapshots && primaryTimerId) {
      if (isActive || isFinished) {
        // Timer resumed or finished, clear the paused snapshot
        entityCache.pausedSnapshots.delete(primaryTimerId);
      }
    }

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
        
        // Include all Google Home timer entities that exist and are not unavailable
        // This allows showing "No timers" state instead of showing nothing
        if (entity.state !== 'unavailable' && entity.state !== 'unknown') {
          // Check if entity has timers attributes structure (even if empty)
          const attributes = entity.attributes || {};
          
          // Include if it has the timers attribute (Google Home integration marker)
          if ('timers' in attributes) {
            googleTimers.push(entityId);
            continue;
          }
          
          // Fallback: check entity structure to see if it's a valid Google timer entity
          const timers = attributes.timers || [];
          if (Array.isArray(timers)) {
            // Include entities with timers array (even if empty)
            googleTimers.push(entityId);
            continue;
          }
          
          // Last resort: try getTimerData to confirm it's a working Google timer entity
          try {
            const timerData = getTimerData(entityId, hass);
            // Include if getTimerData doesn't throw and returns something (even null for "no timers")
            googleTimers.push(entityId);
          } catch {
            // Skip entities that can't be parsed as Google timer entities
          }
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
