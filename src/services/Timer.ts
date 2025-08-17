import { HomeAssistant } from '../types/index';

export interface TimerData {
  isActive: boolean;
  isPaused: boolean;
  duration: number; // in seconds
  remaining: number; // in seconds
  finishesAt: Date | null;
  progress: number; // 0-100
  // NEW: Alexa-specific properties
  isAlexaTimer?: boolean;
  alexaDevice?: string;
  timerLabel?: string;
  // Enhanced Alexa properties
  timerStatus?: "ON" | "OFF" | "PAUSED"; // Precise status from attributes
  userDefinedLabel?: string; // User-defined timer label (e.g., "Pizza")
}

/**
 * TimerEntityService - Enhanced with Amazon Alexa Timer support
 * Handles Home Assistant timer entity integration including Alexa Media Player timers
 */
export class TimerEntityService {
  
  /**
   * Checks if an entity ID is a timer entity (including Alexa timers)
   * @param entityId - Entity ID to check
   * @returns boolean - Whether the entity is a timer
   */
  static isTimerEntity(entityId: string): boolean {
    if (!entityId) return false;
    
    // Standard HA timers
    if (entityId.startsWith('timer.')) return true;
    
    // Alexa Media Player timer sensors
    if (entityId.includes('_next_timer') || 
        entityId.includes('alexa_timer') || 
        (entityId.startsWith('sensor.') && entityId.includes('timer'))) {
      return true;
    }
    
    return false;
  }

  /**
   * Checks if entity is an Alexa timer specifically
   * @param entityId - Entity ID to check
   * @returns boolean - Whether this is an Alexa timer
   */
  static isAlexaTimer(entityId: string): boolean {
    return entityId.includes('_next_timer') || 
           entityId.includes('alexa_timer') || 
           (entityId.startsWith('sensor.') && entityId.includes('alexa') && entityId.includes('timer'));
  }

  /**
   * Gets timer data from a Home Assistant timer entity (including Alexa timers)
   * @param entityId - Timer entity ID
   * @param hass - Home Assistant object
   * @returns TimerData object with timer information
   */
  static getTimerData(entityId: string, hass: HomeAssistant): TimerData | null {
    if (!hass || !entityId || !this.isTimerEntity(entityId)) {
      return null;
    }

    const entity = hass.states[entityId];
    if (!entity) {
      return null;
    }

    // Handle Alexa timers differently
    if (this.isAlexaTimer(entityId)) {
      return this.getAlexaTimerData(entityId, entity, hass);
    }

    // Handle standard HA timers (existing logic)
    return this.getStandardTimerData(entityId, entity);
  }
/**
 * Handles Alexa timer data extraction
 * @param entityId - Alexa timer entity ID
 * @param entity - Entity state object
 * @param hass - Home Assistant object
 * @returns TimerData for Alexa timer
 */
private static getAlexaTimerData(entityId: string, entity: any, hass: HomeAssistant): TimerData | null {
  const { state, attributes } = entity;

  // 1) Parse rich JSON first (status authority comes from attributes, not entity.state)
  const activeTimers = this.parseJson(attributes.sorted_active) ?? [];
  const allTimers    = this.parseJson(attributes.sorted_all)    ?? [];
  const totalActive: number = (attributes.total_active as number) ?? activeTimers.length ?? 0;
  const totalAll: number    = (attributes.total_all as number)    ?? allTimers.length    ?? 0;

  // Determine state: Active > Paused > None, using your rule about the last item in sorted_all
  let isActive = false;
  let isPaused = false;
  let primaryTimer: any | null = null;

  if (totalActive > 0 && activeTimers.length > 0) {
    // Choose the active timer (prefer the one with shortest remainingTime)
    if (activeTimers.length === 1) {
      primaryTimer = activeTimers[0]?.[1] ?? null;
    } else {
      let best: any = null;
      let shortest = Number.POSITIVE_INFINITY;
      for (const t of activeTimers) {
        const data = t?.[1];
        if (data && typeof data.remainingTime === 'number' && data.remainingTime < shortest) {
          shortest = data.remainingTime;
          best = data;
        }
      }
      primaryTimer = best;
    }
    isActive = !!primaryTimer;
  } else if (totalAll > 0 && allTimers.length > 0) {
    // Check the last timer in sorted_all for paused state as per requirement
    const lastTimer = allTimers[allTimers.length - 1]?.[1];
    if (lastTimer?.status === 'PAUSED') {
      primaryTimer = lastTimer;
      isPaused = true;
    } else {
      // Optionally pick a paused timer anywhere in the list as a fallback
      const anyPaused = allTimers.find((t: any) => t?.[1]?.status === 'PAUSED')?.[1];
      if (anyPaused) {
        primaryTimer = anyPaused;
        isPaused = true;
      }
    }
  }

  // 2) Compute duration/remaining/progress, preferring rich data; fallback to legacy entity.state
  let remaining = 0;
  let duration = 0;
  let finishesAt: Date | null = null;
  let progress = 0;

  if (primaryTimer) {
    const rt = typeof primaryTimer.remainingTime === 'number' ? primaryTimer.remainingTime : 0; // ms
    const od = typeof primaryTimer.originalDurationInMillis === 'number' ? primaryTimer.originalDurationInMillis : 0; // ms
    remaining = Math.max(0, Math.floor(rt / 1000));
    duration  = Math.max(0, Math.floor(od / 1000));

    if (isActive && remaining > 0) {
      finishesAt = new Date(Date.now() + remaining * 1000);
    }

    if (duration > 0) {
      const elapsed = duration - remaining;
      progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
    }
  } else {
    // Legacy fallback for remaining/duration when no rich item is available
    if (state && state !== 'unavailable' && state !== 'unknown') {
      if (this.isISOTimestamp(state)) {
        finishesAt = new Date(state);
        if (!isNaN(finishesAt.getTime())) {
          remaining = Math.max(0, Math.floor((finishesAt.getTime() - Date.now()) / 1000));
        }
      } else if (!isNaN(parseFloat(state))) {
        remaining = Math.max(0, parseFloat(state));
      } else if (typeof state === 'string' && state.includes(':')) {
        remaining = this.parseDuration(state);
      }
    }

    if (attributes.original_duration) {
      duration = this.parseDuration(attributes.original_duration);
    } else if (attributes.duration) {
      duration = this.parseDuration(attributes.duration);
    } else if (finishesAt && entity.last_changed) {
      const start = new Date(entity.last_changed).getTime();
      const end   = finishesAt.getTime();
      if (!isNaN(start) && end > start) duration = Math.floor((end - start) / 1000);
    }

    if (duration > 0) {
      const elapsed = duration - remaining;
      progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
    }
  }

  // 3) Label selection (prefer label from primary timer)
  let label: string | undefined = primaryTimer?.timerLabel;
  if (!label && activeTimers.length > 0) label = activeTimers[0]?.[1]?.timerLabel;
  if (!label && allTimers.length > 0)    label = allTimers[0]?.[1]?.timerLabel;

  return {
    isActive,
    isPaused,
    duration,
    remaining,
    finishesAt,
    progress,
    isAlexaTimer: true,
    alexaDevice: this.extractAlexaDevice(entityId, attributes),
    timerLabel: label ?? this.extractAlexaDevice(entityId, attributes),
    timerStatus: isPaused ? 'PAUSED' : (isActive ? 'ON' : 'OFF'),
    userDefinedLabel: label,
  };
}

/* helper unchanged */
private static parseJson(src: any): any[] | null {
  if (Array.isArray(src)) return src;
  if (typeof src === 'string') { try { return JSON.parse(src); } catch {} }
  return null;
}


// Helper method to parse JSON strings
private static parseJsonArray(jsonData: any): any[] | null {
  if (!jsonData) return null;
  
  if (Array.isArray(jsonData)) {
    return jsonData;
  }
  
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData);
    } catch (error) {
      return null;
    }
  }
  
  return null;
}

/**
 * Extracts clean device name from entity attributes
 * @param entityAttributes - Entity attributes
 * @returns Clean device name
 */
private static extractAlexaDeviceFromEntity(entityAttributes: any): string {
  if (entityAttributes.friendly_name) {
    return entityAttributes.friendly_name
      .replace(/\s*next\s*timer$/i, '')
      .replace(/\s*timer$/i, '')
      .trim();
  }
  return 'Alexa Device';
}

/**
 * Legacy fallback for Alexa timer parsing (when rich attributes unavailable)
 * @param entityId - Entity ID
 * @param entity - Entity object
 * @param state - Entity state
 * @param attributes - Entity attributes
/**
 * Legacy fallback for Alexa timer parsing (when rich attributes unavailable)
 * @param entityId - Entity ID
 * @param entity - Entity object
 * @param state - Entity state
 * @param attributes - Entity attributes
 * @returns TimerData object
 */
private static parseLegacyAlexaTimer(entityId: string, entity: any, state: any, attributes: any): TimerData | null {
  // Alexa timers might be stored as timestamps or duration strings
  let remaining = 0;
  let duration = 0;
  let finishesAt: Date | null = null;
  let isActive = false;
  
  // Handle different Alexa timer formats
  if (state && state !== 'unavailable' && state !== 'unknown') {
    // Case 1: State is a timestamp (end time)
    if (this.isISOTimestamp(state)) {
      finishesAt = new Date(state);
      if (!isNaN(finishesAt.getTime())) {
        const now = Date.now();
        remaining = Math.max(0, Math.floor((finishesAt.getTime() - now) / 1000));
        isActive = remaining > 0;
      }
    }
    // Case 2: State is duration in seconds
    else if (!isNaN(parseFloat(state))) {
      remaining = Math.max(0, parseFloat(state));
      isActive = remaining > 0;
    }
    // Case 3: State is duration string (HH:MM:SS)
    else if (typeof state === 'string' && state.includes(':')) {
      remaining = this.parseDuration(state);
      isActive = remaining > 0;
    }
  }

  // Try to get duration from attributes
  let hasOriginalDuration = false;
  if (attributes.original_duration) {
    duration = this.parseDuration(attributes.original_duration);
    hasOriginalDuration = true;
  } else if (attributes.duration) {
    duration = this.parseDuration(attributes.duration);
    hasOriginalDuration = true;
  } else if (finishesAt && entity.last_changed) {
    // Try to calculate duration from finishesAt and last_changed (when timer was set)
    const startTime = new Date(entity.last_changed).getTime();
    const endTime = finishesAt.getTime();
    if (!isNaN(startTime) && endTime > startTime) {
      duration = Math.floor((endTime - startTime) / 1000);
      hasOriginalDuration = true;
    }
  }
  
  if (!hasOriginalDuration) {
    // If no original duration, we can't calculate meaningful progress
    // For display purposes, we'll use remaining as duration, but handle progress specially
    duration = remaining > 0 ? remaining : 0;
    hasOriginalDuration = false;
  }

  // Calculate progress - IMPROVED LOGIC based on timer-bar-card approach
  let progress = 0;
  if (hasOriginalDuration && duration > 0) {
    // We have a real original duration, calculate normal progress
    if (isActive && remaining >= 0) {
      const elapsed = duration - remaining;
      progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
    } else if (remaining === 0 && duration > 0) {
      progress = 100; // Timer finished (only if we had a real duration)
    }
  } else {
    // No original duration available - handle differently for better accuracy
    if (isActive && remaining > 0) {
      // For Alexa timers without original duration, we need to be smarter
      // Option 1: Use entity's last_changed to estimate start time
      const lastChanged = entity.last_changed ? new Date(entity.last_changed).getTime() : Date.now();
      const now = Date.now();
      const timeSinceChanged = (now - lastChanged) / 1000; // seconds
      
      // If the timer was recently updated, we can estimate duration
      if (timeSinceChanged < remaining) {
        const estimatedDuration = remaining + timeSinceChanged;
        const elapsed = timeSinceChanged;
        progress = Math.min(100, Math.max(0, (elapsed / estimatedDuration) * 100));
      } else {
        // Fallback: start progress from 0% for active timers without duration
        // This prevents the "75%" issue you're experiencing
        progress = 0;
      }
    } else {
      // No active timer OR no remaining time
      // Check if this is actually a "no timer" state vs "timer finished" state
      if (state === 'unavailable' || state === 'unknown' || state === 'none' || state === null || state === '') {
        progress = 0; // No timer present - show empty progress
      } else if (remaining === 0 && (isActive === false)) {
        // This could be a finished timer, but without original duration we can't be sure
        // Default to empty progress to avoid showing full progress incorrectly
        progress = 0;
      } else {
        progress = 0; // Default case
      }
    }
  }

  // Extract Alexa-specific info using legacy methods
  const alexaDevice = this.extractAlexaDevice(entityId, attributes);
  const timerLabel = attributes.friendly_name || attributes.timer_label || this.formatAlexaTimerName(entityId);

  return {
    isActive,
    isPaused: false, // Alexa timers don't typically pause in legacy mode
    duration,
    remaining,
    finishesAt,
    progress,
    isAlexaTimer: true,
    alexaDevice,
    timerLabel,
    timerStatus: isActive ? "ON" : "OFF",
    userDefinedLabel: undefined // Not available in legacy mode
  };
}

  /**
   * Handles standard HA timer data extraction (existing logic)
   * @param entityId - Timer entity ID
   * @param entity - Entity state object
   * @returns TimerData for standard timer
   */
  private static getStandardTimerData(entityId: string, entity: any): TimerData | null {
    const state = entity.state;
    const attributes = entity.attributes;

    // Timer states: idle, active, paused
    const isActive = state === 'active';
    const isPaused = state === 'paused';
    const isIdle = state === 'idle';

    // Get duration from attributes (in seconds or HH:MM:SS format)
    let duration = 0;
    if (attributes.duration) {
      duration = this.parseDuration(attributes.duration);
    }

    // Calculate remaining time
    let remaining = 0;
    let finishesAt: Date | null = null;

    if (isActive || isPaused) {
      if (attributes.finishes_at) {
        // Parse finishes_at timestamp
        finishesAt = new Date(attributes.finishes_at);
        if (!isNaN(finishesAt.getTime())) {
          remaining = Math.max(0, Math.floor((finishesAt.getTime() - Date.now()) / 1000));
        }
      } else if (attributes.remaining) {
        // Fallback to remaining attribute if available
        remaining = this.parseDuration(attributes.remaining);
      }
    }

    // Calculate progress (0-100)
    let progress = 0;
    if (duration > 0) {
      if (isIdle) {
        progress = 0;
      } else {
        const elapsed = duration - remaining;
        progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      }
    }

    return {
      isActive,
      isPaused,
      duration,
      remaining,
      finishesAt,
      progress,
      isAlexaTimer: false
    };
  }

  /**
   * Checks if a string is an ISO timestamp
   * @param str - String to check
   * @returns boolean - Whether string is ISO timestamp
   */
  private static isISOTimestamp(str: string): boolean {
    // Check for ISO 8601 format
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)?$/;
    return isoRegex.test(str);
  }

  /**
   * Extracts Alexa device name from entity ID or attributes
   * @param entityId - Entity ID
   * @param attributes - Entity attributes
   * @returns string - Device name
   */
  private static extractAlexaDevice(entityId: string, attributes: any): string {
    // First try to clean up friendly_name if it exists
    if (attributes.friendly_name) {
      let deviceName = attributes.friendly_name;
      
      // Remove common timer-related suffixes that clutter the display
      deviceName = deviceName
        .replace(/\s*next\s*timer$/i, '')
        .replace(/\s*timer$/i, '')
        .replace(/\s*echo\s*timer$/i, '')
        .replace(/\s*alexa\s*timer$/i, '')
        .trim();
      
      if (deviceName) return deviceName;
    }

    // Try to extract from entity ID pattern: sensor.device_name_next_timer
    if (entityId.includes('_next_timer')) {
      const devicePart = entityId
        .replace(/^sensor\./, '')
        .replace(/_next_timer$/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      if (devicePart) return devicePart;
    }
    
    // Try from other attributes
    if (attributes.device_name) return attributes.device_name;
    if (attributes.device) return attributes.device;
    
    // Fallback
    return 'Alexa Device';
  }

  /**
   * Formats Alexa timer name from entity ID
   * @param entityId - Entity ID
   * @returns string - Formatted name
   */
  private static formatAlexaTimerName(entityId: string): string {
    return entityId
      .replace(/^sensor\./, '')
      .replace(/_next_timer$/, '')
      .replace(/_timer$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Parses duration from various formats (seconds, HH:MM:SS, etc.)
   * @param duration - Duration value to parse
   * @returns number - Duration in seconds
   */
  private static parseDuration(duration: any): number {
    if (typeof duration === 'number') {
      return duration;
    }

    if (typeof duration !== 'string') {
      return 0;
    }

    // Handle HH:MM:SS format
    if (duration.includes(':')) {
      const parts = duration.split(':').map(Number);
      if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
      }
    }

    // Try to parse as number (seconds)
    const seconds = parseFloat(duration);
    return isNaN(seconds) ? 0 : seconds;
  }

  /**
   * Formats remaining time as human-readable string
   * @param remaining - Remaining time in seconds
   * @param showSeconds - Whether to include seconds in output
   * @returns string - Formatted time string
   */
  static formatRemainingTime(remaining: number, showSeconds: boolean = true): string {
    if (remaining <= 0) {
      return '0:00';
    }

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = Math.floor(remaining % 60);

    if (hours > 0) {
      if (showSeconds) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
      }
    } else {
      if (showSeconds) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}m`;
      }
    }
  }

  /**
   * Gets appropriate title text for timer entity (enhanced for Alexa)
   * @param entityId - Timer entity ID
   * @param hass - Home Assistant object
   * @param customTitle - Custom title override
   * @returns string - Title text
   */
  static getTimerTitle(entityId: string, hass: HomeAssistant, customTitle?: string): string {
    if (customTitle) {
      return customTitle;
    }

    if (!hass || !entityId) {
      return 'Timer';
    }

    const entity = hass.states[entityId];
    if (!entity) {
      return 'Timer';
    }

    // Handle Alexa timers
    if (this.isAlexaTimer(entityId)) {
      const timerData = this.getAlexaTimerData(entityId, entity, hass);
      if (timerData?.timerLabel) {
        return timerData.timerLabel;
      }
      return this.formatAlexaTimerName(entityId);
    }

    // Use friendly name or fall back to entity ID
    return entity.attributes.friendly_name || entityId.replace('timer.', '').replace(/_/g, ' ');
  }

  /**
   * Gets appropriate subtitle text for timer entity (enhanced for Alexa)
   * @param timerData - Timer data object
   * @param showSeconds - Whether to show seconds in remaining time
   * @returns string - Subtitle text
   */
  static getTimerSubtitle(timerData: TimerData, showSeconds: boolean = true): string {
    if (!timerData) {
      return 'Timer not found';
    }

    // Handle Alexa timers
    if (timerData.isAlexaTimer) {
      if (timerData.isActive && timerData.remaining > 0) {
        const remainingText = this.formatRemainingTime(timerData.remaining, showSeconds);
        
        // Enhanced labeling: prefer user-defined label, then device name
        if (timerData.userDefinedLabel) {
          return `${remainingText} remaining on ${timerData.userDefinedLabel} timer`;
        } else if (timerData.alexaDevice) {
          return `${remainingText} remaining on ${timerData.alexaDevice}`;
        } else {
          return `${remainingText} remaining`;
        }
      } else if (timerData.isPaused && timerData.remaining > 0) {
        const remainingText = this.formatRemainingTime(timerData.remaining, showSeconds);
        
        if (timerData.userDefinedLabel) {
          return `${timerData.userDefinedLabel} timer paused - ${remainingText} left`;
        } else if (timerData.alexaDevice) {
          return `Timer paused on ${timerData.alexaDevice} - ${remainingText} left`;
        } else {
          return `Timer paused - ${remainingText} left`;
        }
      } else if (timerData.remaining === 0 && timerData.progress >= 100) {
        if (timerData.userDefinedLabel) {
          return `${timerData.userDefinedLabel} timer finished`;
        } else if (timerData.alexaDevice) {
          return `Timer finished on ${timerData.alexaDevice}`;
        } else {
          return 'Timer finished';
        }
      } else {
        if (timerData.alexaDevice) {
          return `No timers on ${timerData.alexaDevice}`;
        } else {
          return 'No timers';
        }
      }
    }

    // Handle standard HA timers
    if (timerData.isActive) {
      const remainingText = this.formatRemainingTime(timerData.remaining, showSeconds);
      return `${remainingText} remaining`;
    } else if (timerData.isPaused) {
      const remainingText = this.formatRemainingTime(timerData.remaining, showSeconds);
      return `Paused - ${remainingText} left`;
    } else {
      // Idle state
      if (timerData.duration > 0) {
        const durationText = this.formatRemainingTime(timerData.duration, showSeconds);
        return `Ready - ${durationText}`;
      } else {
        return 'Timer ready';
      }
    }
  }

  /**
   * Checks if timer is expired/finished (enhanced for Alexa)
   * @param timerData - Timer data object
   * @returns boolean - Whether timer is expired
   */
  static isTimerExpired(timerData: TimerData): boolean {
    if (!timerData) return false;
    
    // For Alexa timers, check if remaining time is 0 and progress is 100%
    if (timerData.isAlexaTimer) {
      return timerData.remaining === 0 && timerData.progress >= 100;
    }
    
    // For standard timers
    return !timerData.isActive && !timerData.isPaused && timerData.progress >= 100;
  }

  /**
   * Gets timer state color based on current state (enhanced for Alexa)
   * @param timerData - Timer data object
   * @param defaultColor - Default color to use
   * @returns string - Color value
   */
  static getTimerStateColor(timerData: TimerData, defaultColor: string = '#4caf50'): string {
    if (!timerData) {
      return defaultColor;
    }

    // Alexa-specific coloring
    if (timerData.isAlexaTimer) {
      if (timerData.isActive && timerData.remaining > 0) {
        return '#00d4ff'; // Alexa blue for active
      } else if (this.isTimerExpired(timerData)) {
        return '#ff4444'; // Red for expired
      } else {
        return '#888888'; // Gray for inactive
      }
    }

    // Standard timer coloring
    if (timerData.isActive) {
      return '#4caf50'; // Green for active
    } else if (timerData.isPaused) {
      return '#ff9800'; // Orange for paused
    } else if (this.isTimerExpired(timerData)) {
      return '#f44336'; // Red for expired
    } else {
      return '#9e9e9e'; // Gray for idle
    }
  }

  /**
   * AUTO-DISCOVERY: Attempts to find Alexa timer entities in Home Assistant
   * @param hass - Home Assistant object
   * @returns string[] - Array of potential Alexa timer entity IDs
   */
  static discoverAlexaTimers(hass: HomeAssistant): string[] {
    if (!hass || !hass.states) return [];
    
    const alexaTimers: string[] = [];
    
    for (const entityId in hass.states) {
      if (this.isAlexaTimer(entityId)) {
        const entity = hass.states[entityId];
        // Include if rich attributes indicate any timers, regardless of entity.state
        const attributes = entity.attributes || {};
        const activeTimers = this.parseJson(attributes.sorted_active) ?? [];
        const allTimers    = this.parseJson(attributes.sorted_all)    ?? [];
        const totalActive: number = (attributes.total_active as number) ?? activeTimers.length ?? 0;
        const totalAll: number    = (attributes.total_all as number)    ?? allTimers.length    ?? 0;

        if (totalActive > 0 || totalAll > 0) {
          alexaTimers.push(entityId);
          continue;
        }
        // Fallback: try building timer data
        const timerData = this.getTimerData(entityId, hass);
        if (timerData) alexaTimers.push(entityId);
      }
    }
    
    return alexaTimers;
  }

  /**
   * Helper method to check for any timers (including paused)
   * @param entityId - Entity ID
   * @param entity - Entity object
   * @returns boolean - Whether entity has any timers
   */
  private static hasAnyTimers(entityId: string, entity: any): boolean {
    try {
      const attributes = entity.attributes;
      
      // Parse JSON arrays
      const sortedActive = this.parseJsonArray(attributes.sorted_active) || [];
      const sortedAll = this.parseJsonArray(attributes.sorted_all) || [];
      
      // Check for any timers (active, paused, or inactive)
      return sortedActive.length > 0 || sortedAll.length > 0;
      
    } catch (error) {
      return false;
    }
  }
}