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
    pausedSnapshots?: Map<string, { remaining: number; pausedAt: number; wasActive?: boolean }>;
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
          userDefinedLabel: entityCache.lastLabel || undefined,
          googleTimerId: entityCache.finishedTimerId,
          googleTimerStatus: 'ringing' as const,
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

    // Check for finished timers (timers that were active but now missing/expired/ringing)
    const finishedCandidates: Array<{id: string, fireTime: number, timer: any}> = [];
    
    // Check active timers that have passed their fire_time
    for (const [timerId, timer] of activeTimers.entries()) {
      if (timer.fire_time && timer.fire_time <= now && timer.status !== 'ringing') {
        finishedCandidates.push({id: timerId, fireTime: timer.fire_time, timer});
      }
    }
    
    // Check for ringing timers (they are finished/completed)
    for (const timer of allTimers) {
      if (timer.timer_id && timer.status === 'ringing') {
        const timerId = String(timer.timer_id);
        const fireTime = timer.fire_time || now - 1; // Use fire_time or current time if missing
        finishedCandidates.push({id: timerId, fireTime, timer});
      }
    }

    // Sort by fire time and pick the most recently finished
    if (finishedCandidates.length > 0) {
      finishedCandidates.sort((a, b) => b.fireTime - a.fireTime);
      entityCache.finishedTimerId = finishedCandidates[0].id;
      const finishedTimer = finishedCandidates[0].timer;
      if (finishedTimer) {
        entityCache.lastDuration = finishedTimer.duration || 0;
        entityCache.lastLabel = finishedTimer.label || 'Timer';
      }
    }

    // Clean up finished timer cache if no longer in active list
    if (entityCache.finishedTimerId && !activeTimers.has(entityCache.finishedTimerId)) {
      // Keep finished timer display for longer until manually dismissed or new timer starts
      setTimeout(() => {
        const currentCache = this.googleIdCache.get(entityId);
        if (currentCache && currentCache.finishedTimerId === entityCache.finishedTimerId) {
          // Only clear if no new active timers have started
          let hasNewActiveTimers = false;
          const currentEntity = hass.states[entityId];
          if (currentEntity && currentEntity.attributes && currentEntity.attributes.timers) {
            const currentTimers = currentEntity.attributes.timers || [];
            hasNewActiveTimers = currentTimers.some((timer: any) => 
              timer.status === 'set' || timer.status === 'ringing'
            );
          }
          
          // Only clear finished timer if new active timers exist
          if (hasNewActiveTimers) {
            delete currentCache.finishedTimerId;
            delete currentCache.lastDuration;
            delete currentCache.lastLabel;
          }
          // If no new timers, keep displaying finished state for user interaction
        }
      }, 30000); // 30 seconds instead of 5 seconds
    }

    // Find primary timer to display
    let primaryTimer: any = null;
    let primaryTimerId: string | null = null;

    // 1. Check for ringing timers first (immediate finished state)
    for (const timer of allTimers) {
      if (timer.timer_id && timer.status === 'ringing') {
        return {
          isActive: false,
          isPaused: false,
          duration: timer.duration || 0,
          remaining: 0,
          finishesAt: null,
          progress: 100,
          finished: true,
          isGoogleTimer: true,
          userDefinedLabel: timer.label || undefined,
          googleTimerId: String(timer.timer_id),
          googleTimerStatus: 'ringing',
        };
      }
    }

    // 2. Check if we have a finished timer to display
    if (entityCache.finishedTimerId && allTimersMap.has(entityCache.finishedTimerId)) {
      const finishedTimer = allTimersMap.get(entityCache.finishedTimerId);
      if (finishedTimer && finishedTimer.fire_time <= now) {
        return {
          isActive: false,
          isPaused: false,
          duration: finishedTimer.duration || 0,
          remaining: 0,
          finishesAt: null,
          progress: 100,
          finished: true,
          isGoogleTimer: true,
          userDefinedLabel: finishedTimer.label || undefined,
          googleTimerId: String(finishedTimer.timer_id),
          googleTimerStatus: finishedTimer.status || 'ringing',
        };
      }
    }

    // 3. Find active timer with earliest fire time
    let earliestFireTime = Number.POSITIVE_INFINITY;
    for (const [timerId, timer] of activeTimers.entries()) {
      if (timer.fire_time && timer.fire_time < earliestFireTime) {
        earliestFireTime = timer.fire_time;
        primaryTimer = timer;
        primaryTimerId = timerId;
      }
    }

    // 4. If no active timers, check for paused timers and other non-active states
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

    // Initialize paused snapshots cache if needed
    if (!entityCache.pausedSnapshots) {
      entityCache.pausedSnapshots = new Map();
    }

    // Track previous status to detect state transitions
    const cacheKey = `${entityId}_${primaryTimerId}`;
    const previousSnapshot = entityCache.pausedSnapshots.get(primaryTimerId!);
    
    if (isActive) {
      // For active timers, prefer fire_time for live ticking (converted from seconds to ms)
      const fireTimeMs = primaryTimer.fire_time ? primaryTimer.fire_time * 1000 : 0;
      
      if (fireTimeMs && fireTimeMs > now * 1000) {
        remaining = Math.max(0, Math.floor((fireTimeMs - now * 1000) / 1000));
        finishesAt = new Date(fireTimeMs);
        
        // Store active state in case timer gets paused later
        entityCache.pausedSnapshots.set(primaryTimerId!, {
          remaining,
          pausedAt: now,
          wasActive: true
        });
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
      // For paused timers, Google Home sets fire_time to null
      // We need to use the last known remaining time before pause
      
      if (previousSnapshot && previousSnapshot.wasActive) {
        // Use the cached remaining time from when timer was last active
        remaining = previousSnapshot.remaining;
        
        // Update cache to mark as paused (no longer active)
        entityCache.pausedSnapshots.set(primaryTimerId!, {
          remaining,
          pausedAt: now,
          wasActive: false
        });
      } else if (previousSnapshot && !previousSnapshot.wasActive) {
        // Timer was already paused, keep the same remaining time
        remaining = previousSnapshot.remaining;
      } else {
        // First time seeing this timer in paused state - try to determine remaining time
        // Google Home duration attribute is the original duration, not remaining
        // We need to make a reasonable guess based on available information
        
        // Check if timer was recently active in our cache
        const recentActiveTime = 30; // seconds
        if (previousSnapshot && (now - previousSnapshot.pausedAt) < recentActiveTime) {
          remaining = previousSnapshot.remaining;
        } else {
          // No recent data - this might be a fresh restart or first time seeing timer
          // Use the full duration as a conservative estimate
          remaining = duration;
          console.warn(`GoogleTimer: No cached data for paused timer ${primaryTimerId}, using full duration`);
        }
        
        // Store this paused state
        entityCache.pausedSnapshots.set(primaryTimerId!, {
          remaining,
          pausedAt: now,
          wasActive: false
        });
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
      if (isFinished) {
        // Timer finished, clear the paused snapshot
        entityCache.pausedSnapshots.delete(primaryTimerId);
      }
      // Keep paused snapshots for active timers to track state transitions
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
      userDefinedLabel: primaryTimer.label || undefined,
      // Additional Google Home specific data
      googleTimerId: primaryTimerId || undefined,
      googleTimerStatus: primaryTimer.status, // 'none', 'set', 'ringing', 'paused'
    };
  }

  /**
   * AUTO-DISCOVERY: Attempts to find Google Home timer entities with actual timers
   * @param hass - Home Assistant object
   * @param isGoogleTimer - Google timer detection function
   * @param getTimerData - Timer data extraction function
   * @returns string[] - Array of Google timer entity IDs that have actual timers (active, paused, or finished)
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
            const timers = attributes.timers || [];
            // Only include entities that actually have timers (not empty arrays)
            if (Array.isArray(timers) && timers.length > 0) {
              googleTimers.push(entityId);
            }
            continue;
          }
          
          // Fallback: check entity structure to see if it's a valid Google timer entity
          const timers = attributes.timers || [];
          if (Array.isArray(timers) && timers.length > 0) {
            // Only include entities with actual timers
            googleTimers.push(entityId);
            continue;
          }
          
          // Last resort: try getTimerData to confirm it's a working Google timer entity with actual timers
          try {
            const timerData = getTimerData(entityId, hass);
            // Only include if getTimerData returns a timer with actual data (not just "no timers" state)
            if (timerData && (timerData.isActive || timerData.isPaused || timerData.finished || 
                (timerData.duration > 0 || timerData.remaining > 0))) {
              googleTimers.push(entityId);
            }
          } catch {
            // Skip entities that can't be parsed as Google timer entities
          }
        }
      }
    }
    
    return googleTimers;
  }

  /**
   * Manually clear finished timer cache for an entity (for user dismissal)
   * @param entityId - Google Home timer entity ID
   */
  static clearFinishedTimer(entityId: string): void {
    const entityCache = this.googleIdCache.get(entityId);
    if (entityCache && entityCache.finishedTimerId) {
      delete entityCache.finishedTimerId;
      delete entityCache.lastDuration;
      delete entityCache.lastLabel;
    }
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
