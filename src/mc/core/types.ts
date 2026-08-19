export type MotionMode = 'system' | 'reduce' | 'full';

export type MCMotionAPI = {
  mode: MotionMode;
  readonly systemReduced: boolean;
  readonly reduced: boolean;
  setMode: (mode: string) => void;
  refresh: () => void;
};

export type MCStat = {
  label: string;
  value: unknown | (() => unknown);
  format?: (value: unknown) => string;
};

export type MCController = {
  get?: (key: string) => unknown;
  set?: (key: string, value: unknown) => void;
  settings?: Record<string, unknown>;
};

export type MCRangeControl = {
  type: 'range';
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  decimals?: number;
  event?: 'change';
  format?: (value: number) => string;
};

export type MCButtonControl = {
  type: 'button';
  label: string;
  action?: string;
  onClick?: (instance: MCController) => void;
};

export type MCDebugSchema = {
  id: string;
  label?: string;
  instances?: () => MCController[];
  stats?: MCStat[];
  controls?: Array<MCRangeControl | MCButtonControl>;
  instanceLabel?:
    | string
    | false
    | ((instance: MCController, index: number, total: number) => string);
  get?: (instance: MCController, key: string) => unknown;
  set?: (instance: MCController, key: string, value: unknown) => void;
};

export type MCDebugAPI = {
  register: (schema: MCDebugSchema) => void;
  unregister: (id: string) => void;
  refresh: () => void;
  render: () => void;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

export type ColorThemeValues = Record<string, string>;

export type ColorThemesAPI = {
  themes: Record<string, ColorThemeValues>;
  ctaThemes: Record<string, ColorThemeValues>;
  iconThemes: Record<string, ColorThemeValues>;
  getTheme: (featureName?: string, ctaName?: string, iconName?: string) => ColorThemeValues;
};

export type MCNamespace = {
  motion?: MCMotionAPI;
  debug?: MCDebugAPI;
  __debugQueue?: MCDebugSchema[];
};

declare global {
  interface Window {
    MC: MCNamespace;
    colorThemes: ColorThemesAPI;
  }
}
