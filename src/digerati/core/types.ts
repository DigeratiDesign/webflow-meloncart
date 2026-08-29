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
  replay?: () => void;
  settings?: Record<string, unknown>;
};

export type MCEffectLifecycle = {
  enabled: () => boolean;
  setEnabled: (enabled: boolean) => void | Promise<void>;
};

export type MCRangeControl = {
  type: 'range';
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  description?: string;
  decimals?: number;
  event?: 'change';
  format?: (value: number) => string;
};

export type MCTextControl = {
  type: 'text';
  key: string;
  label?: string;
  description?: string;
  placeholder?: string;
  event?: 'change';
};

export type MCToggleControl = {
  type: 'toggle';
  key: string;
  label: string;
  description?: string;
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
  showInPanel?: boolean;
  order?: number;
  instances?: () => MCController[];
  orderElement?: () => Element | null;
  stats?: MCStat[];
  controls?: Array<MCRangeControl | MCTextControl | MCToggleControl | MCButtonControl>;
  instanceLabel?:
    | string
    | false
    | ((instance: MCController, index: number, total: number) => string);
  get?: (instance: MCController, key: string) => unknown;
  set?: (instance: MCController, key: string, value: unknown) => void;
  effect?: MCEffectLifecycle;
};

export type MCDebugAPI = {
  register: (schema: MCDebugSchema) => void;
  unregister: (id: string) => void;
  refresh: () => void;
  render: () => void;
  toggle: () => void;
  open: () => void;
  close: () => void;
  isEffectEnabled: (id: string) => boolean;
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
