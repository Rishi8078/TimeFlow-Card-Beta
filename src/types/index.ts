// Shared type definitions for TimeFlow Card
export interface HomeAssistant {
  states: { [key: string]: any };
  callService: (domain: string, service: string, data?: any) => Promise<any>;
  callApi?: (method: string, path: string, data?: any) => Promise<any>;
  connection?: any;
  config?: {
    time_zone?: string;
  };
  user?: {
    name?: string;
  };
  [key: string]: any;
}

export interface CountdownState {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export interface CardConfig {
  type?: string;
  target_date?: string;
  creation_date?: string;
  title?: string;
  subtitle?: string;
  color?: string;
  background_color?: string;
  progress_color?: string;
  primary_color?: string;
  secondary_color?: string;
  stroke_width?: number;
  icon_size?: number;
  expired_animation?: boolean;
  expired_text?: string;
  show_days?: boolean;
  show_hours?: boolean;
  show_minutes?: boolean;
  show_seconds?: boolean;
  show_months?: boolean;
  width?: string | number;
  height?: string | number;
  aspect_ratio?: string;
  [key: string]: any; // Allow additional properties
}

export interface TimeFlowCard {
  hass?: HomeAssistant | null;
}
