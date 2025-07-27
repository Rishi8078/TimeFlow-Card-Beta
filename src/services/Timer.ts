import { HomeAssistant } from '../types/index';

export interface TimerData {
  isActive: boolean;
  isPaused: boolean;
  duration: number; // in seconds
  remaining: number; // in seconds
  finishesAt: Date | null;
  progress: number; // 0-100
}

/**
 * TimerEntityService - Handles Home Assistant timer entity integration
 * Provides timer state parsing and progress calculation
 */
export class TimerEntityService {
  
  /**
   * Checks if an entity ID is a timer entity
   * @param entityId - Entity ID to check
   * @returns boolean - Whether the entity is a timer
   */
  static isTimerEntity(entityId: string): boolean {
    return !!entityId && entityId.startsWith('timer.');
  }

  /**
   * Gets timer data from a Home Assistant timer entity
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
      console.warn(`Timer entity ${entityId} not found`);
      return null;
    }

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
      progress
    };
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
   * Gets appropriate title text for timer entity
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

    // Use friendly name or fall back to entity ID
    return entity.attributes.friendly_name || entityId.replace('timer.', '').replace(/_/g, ' ');
  }

  /**
   * Gets appropriate subtitle text for timer entity
   * @param timerData - Timer data object
   * @param showSeconds - Whether to show seconds in remaining time
   * @returns string - Subtitle text
   */
  static getTimerSubtitle(timerData: TimerData, showSeconds: boolean = true): string {
    if (!timerData) {
      return 'Timer not found';
    }

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
   * Checks if timer is expired/finished
   * @param timerData - Timer data object
   * @returns boolean - Whether timer is expired
   */
  static isTimerExpired(timerData: TimerData): boolean {
    return timerData && !timerData.isActive && !timerData.isPaused && timerData.progress >= 100;
  }

  /**
   * Gets timer state color based on current state
   * @param timerData - Timer data object
   * @param defaultColor - Default color to use
   * @returns string - Color value
   */
  static getTimerStateColor(timerData: TimerData, defaultColor: string = '#4caf50'): string {
    if (!timerData) {
      return defaultColor;
    }

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
}