import { HomeAssistant } from '../types/index';

type LanguageRecord = Record<string, any>;

const DEFAULT_LANG = 'en';

// Inline translations for all languages
const languages: Record<string, LanguageRecord> = {
  en: {
    timer: {
      complete: 'Timer complete',
      complete_with_label: '{label} timer complete',
      paused: 'Paused',
      paused_with_time: '{label} timer paused - {time} left',
      paused_without_label: 'Timer paused - {time} left',
      paused_alexa: 'Timer paused on {device} - {time} left',
      ready: 'Ready',
      ready_with_time: 'Ready - {time}',
      no_timers: 'No timers',
      no_timers_device: 'No timers on {device}',
      no_timers_google: 'No Google Home timers',
      remaining: '{time} remaining',
      remaining_with_label: '{time} remaining on {label} timer',
      remaining_with_device: '{time} remaining on {device}',
      paused_time_left: 'Timer paused - {time} left',
      google_paused: 'Google Home timer paused - {time} left',
      timer_ready: 'Timer ready',
    },
  },
  fr: {
    timer: {
      complete: 'Minuteur terminé',
      complete_with_label: 'Minuteur {label} terminé',
      paused: 'En pause',
      paused_with_time: 'Minuteur {label} en pause - {time} restant',
      paused_without_label: 'Minuteur en pause - {time} restant',
      paused_alexa: 'Minuteur en pause sur {device} - {time} restant',
      ready: 'Prêt',
      ready_with_time: 'Prêt - {time}',
      no_timers: 'Aucun minuteur',
      no_timers_device: 'Aucun minuteur sur {device}',
      no_timers_google: 'Aucun minuteur Google Home',
      remaining: '{time} restant',
      remaining_with_label: '{time} restant sur le minuteur {label}',
      remaining_with_device: '{time} restant sur {device}',
      paused_time_left: 'Minuteur en pause - {time} restant',
      google_paused: 'Minuteur Google Home en pause - {time} restant',
      timer_ready: 'Minuteur prêt',
    },
  },
  de: {
    timer: {
      complete: 'Timer abgelaufen',
      complete_with_label: 'Timer {label} abgelaufen',
      paused: 'Pausiert',
      paused_with_time: 'Timer {label} pausiert - {time} verbleibend',
      paused_without_label: 'Timer pausiert - {time} verbleibend',
      paused_alexa: 'Timer pausiert auf {device} - {time} verbleibend',
      ready: 'Bereit',
      ready_with_time: 'Bereit - {time}',
      no_timers: 'Keine Timer',
      no_timers_device: 'Keine Timer auf {device}',
      no_timers_google: 'Keine Google Home Timer',
      remaining: '{time} verbleibend',
      remaining_with_label: '{time} verbleibend bei Timer {label}',
      remaining_with_device: '{time} verbleibend auf {device}',
      paused_time_left: 'Timer pausiert - {time} verbleibend',
      google_paused: 'Google Home Timer pausiert - {time} verbleibend',
      timer_ready: 'Timer bereit',
    },
  },
  es: {
    timer: {
      complete: 'Temporizador finalizado',
      complete_with_label: 'Temporizador {label} finalizado',
      paused: 'Pausado',
      paused_with_time: 'Temporizador {label} pausado - {time} restante',
      paused_without_label: 'Temporizador pausado - {time} restante',
      paused_alexa: 'Temporizador pausado en {device} - {time} restante',
      ready: 'Listo',
      ready_with_time: 'Listo - {time}',
      no_timers: 'Sin temporizadores',
      no_timers_device: 'Sin temporizadores en {device}',
      no_timers_google: 'Sin temporizadores de Google Home',
      remaining: '{time} restante',
      remaining_with_label: '{time} restante en temporizador {label}',
      remaining_with_device: '{time} restante en {device}',
      paused_time_left: 'Temporizador pausado - {time} restante',
      google_paused: 'Temporizador de Google Home pausado - {time} restante',
      timer_ready: 'Temporizador listo',
    },
  },
  it: {
    timer: {
      complete: 'Timer completato',
      complete_with_label: 'Timer {label} completato',
      paused: 'In pausa',
      paused_with_time: 'Timer {label} in pausa - {time} rimanente',
      paused_without_label: 'Timer in pausa - {time} rimanente',
      paused_alexa: 'Timer in pausa su {device} - {time} rimanente',
      ready: 'Pronto',
      ready_with_time: 'Pronto - {time}',
      no_timers: 'Nessun timer',
      no_timers_device: 'Nessun timer su {device}',
      no_timers_google: 'Nessun timer Google Home',
      remaining: '{time} rimanente',
      remaining_with_label: '{time} rimanente sul timer {label}',
      remaining_with_device: '{time} rimanente su {device}',
      paused_time_left: 'Timer in pausa - {time} rimanente',
      google_paused: 'Timer Google Home in pausa - {time} rimanente',
      timer_ready: 'Timer pronto',
    },
  },
  nl: {
    timer: {
      complete: 'Timer klaar',
      complete_with_label: 'Timer {label} klaar',
      paused: 'Gepauzeerd',
      paused_with_time: 'Timer {label} gepauzeerd - {time} resterend',
      paused_without_label: 'Timer gepauzeerd - {time} resterend',
      paused_alexa: 'Timer gepauzeerd op {device} - {time} resterend',
      ready: 'Klaar',
      ready_with_time: 'Klaar - {time}',
      no_timers: 'Geen timers',
      no_timers_device: 'Geen timers op {device}',
      no_timers_google: 'Geen Google Home timers',
      remaining: '{time} resterend',
      remaining_with_label: '{time} resterend op timer {label}',
      remaining_with_device: '{time} resterend op {device}',
      paused_time_left: 'Timer gepauzeerd - {time} resterend',
      google_paused: 'Google Home timer gepauzeerd - {time} resterend',
      timer_ready: 'Timer klaar',
    },
  },
};

/**
 * Get a translated string from the translation files
 * @param key - Dot-separated key (e.g., 'timer.complete')
 * @param lang - Language code (e.g., 'en', 'fr')
 * @returns Translated string or undefined if not found
 */
function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    const keys = key.split('.');
    let obj: any = languages[lang];
    
    if (!obj) return undefined;
    
    for (const k of keys) {
      obj = obj[k];
      if (obj === undefined) return undefined;
    }
    
    return typeof obj === 'string' ? obj : undefined;
  } catch (_) {
    return undefined;
  }
}

/**
 * Format a translated string with placeholders
 * Replaces {key} style placeholders with values from the arguments object
 * @param text - Translated text with {placeholder} style placeholders
 * @param args - Object with placeholder values
 * @returns Formatted string
 */
function formatString(text: string, args: Record<string, any> = {}): string {
  if (!text) return '';
  
  return text.replace(/\{([^}]+)\}/g, (_, key) => {
    return String(args[key] ?? `{${key}}`);
  });
}

/**
 * Setup localization function for the card
 * Returns a function that translates keys based on Home Assistant's language setting
 * @param hass - Home Assistant object
 * @returns Localize function
 */
export function setupLocalize(hass?: HomeAssistant) {
  return function localize(
    key: string,
    argObject: Record<string, any> = {}
  ): string {
    const lang = hass?.locale?.language ?? DEFAULT_LANG;

    // Try to get translation in the user's language
    let translated = getTranslatedString(key, lang);
    
    // Fall back to English if translation not found
    if (!translated) {
      translated = getTranslatedString(key, DEFAULT_LANG);
    }

    // If still not found, return the key itself
    if (!translated) {
      return key;
    }

    // Format the string with placeholders
    return formatString(translated, argObject);
  };
}

export type LocalizeFunction = ReturnType<typeof setupLocalize>;
