import { getScrollTriggerDebug, setScrollTriggerDebug } from './gsap';
import { createLogger } from './logger';
import type {
  MCButtonControl,
  MCController,
  MCDebugSchema,
  MCMotionAPI,
  MCNamespace,
  MCRangeControl,
  MCTextControl,
  MCToggleControl,
  MotionMode,
} from './types';

const CSS = `
    :root{
      --mc-debug-accent:#00ffff;
      --mc-debug-accent-rgb:0,255,255
    }
    #mc-debug-panel{
      position:fixed;top:16px;right:16px;z-index:2147483647;
      display:flex;flex-direction:column;
      width:340px;max-height:calc(100vh - 32px);
      padding:14px;color:#fff;background:#2a2722;
      border:1px solid rgba(255,255,255,.16);border-radius:12px;
      box-shadow:0 20px 60px rgba(0,0,0,.45);
      font:12px/1.4 'Poppins',Arial,Helvetica,sans-serif;
      -webkit-font-smoothing:antialiased
    }
    #mc-debug-panel *{box-sizing:border-box}
    .mc-debug-brand{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:-14px -14px 16px;padding:10px 14px 12px;border-bottom:1px solid rgba(255,255,255,.12);cursor:grab;touch-action:none;user-select:none}
    .mc-debug-brand:active{cursor:grabbing}
    .mc-debug-logo{display:block;width:50px;height:auto;color:var(--mc-debug-accent)}
    .mc-debug-page{display:block;flex:1;min-width:0;overflow:hidden;color:rgba(255,255,255,.92);font-size:11px;font-weight:700;letter-spacing:.04em;text-overflow:ellipsis;white-space:nowrap}
    .mc-debug-page::before{display:block;margin-bottom:3px;color:var(--mc-debug-accent);content:'PAGE';font-size:8px;font-weight:700;letter-spacing:.12em}
    .mc-debug-content{flex:1 1 auto;min-height:0;overflow-y:auto;padding-right:2px}
    .mc-debug-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:14px -14px -14px;padding:10px 14px;border-top:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.5);font-size:9px;font-weight:600;letter-spacing:.04em}
    .mc-debug-footer-actions{display:flex;align-items:center;gap:5px}
    .mc-debug-export{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:1px solid rgba(var(--mc-debug-accent-rgb),.5);border-radius:5px;background:transparent;color:var(--mc-debug-accent);cursor:pointer}
    .mc-debug-export svg{display:block;width:14px;height:14px}
    .mc-debug-export:hover{border-color:var(--mc-debug-accent);background:rgba(var(--mc-debug-accent-rgb),.12)}
    .mc-debug-export:focus-visible{outline:2px solid var(--mc-debug-accent);outline-offset:2px}
    .mc-debug-reset{border-color:rgba(255,255,255,.25);color:rgba(255,255,255,.7)}
    .mc-debug-reset:hover{border-color:#ff6b5e;background:rgba(255,107,94,.14);color:#ff6b5e}
    .mc-debug-global{margin-bottom:10px;padding:0 0 10px;border-bottom:1px solid rgba(255,255,255,.12)}
    .mc-debug-global-title,.mc-debug-group-title{margin-bottom:9px;color:var(--mc-debug-accent);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
    .mc-debug-global-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:end}
    .mc-debug-global-block{min-width:0}
    .mc-debug-global-block.is-align-right{text-align:right}
    .mc-debug-segmented{display:inline-grid;gap:2px;padding:2px;background:rgba(255,255,255,.055);border-radius:6px}
    .mc-debug-segmented.is-three-up{grid-template-columns:repeat(3,minmax(42px,1fr))}
    .mc-debug-segmented.is-two-up{grid-template-columns:repeat(2,minmax(42px,1fr))}
    .mc-debug-segmented button{appearance:none;border:0;border-radius:4px;padding:5px 6px;background:transparent;color:rgba(255,255,255,.55);font:600 9px/1 'Poppins',Arial,Helvetica,sans-serif;cursor:pointer}
    .mc-debug-segmented button:hover{color:#fff;background:rgba(255,255,255,.06)}
    .mc-debug-segmented button.is-active{color:#2a2722;background:var(--mc-debug-accent);font-weight:700}
    .mc-debug-global-icon{appearance:none;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:22px;height:22px;padding:0;border:1px solid rgba(var(--mc-debug-accent-rgb),.5);border-radius:999px;background:transparent;color:var(--mc-debug-accent);cursor:pointer}
    .mc-debug-global-icon:hover{background:rgba(var(--mc-debug-accent-rgb),.14);border-color:var(--mc-debug-accent);color:var(--mc-debug-accent)}
    .mc-debug-global-icon:focus-visible{outline:2px solid var(--mc-debug-accent);outline-offset:3px}
    .mc-debug-global-icon svg{display:block;width:13px;height:13px}
    .mc-debug-global-icon .mc-debug-disclosure-icon{width:16px;height:16px;transition:transform .18s ease}
    .mc-debug-global-icon[data-expanded="true"] .mc-debug-disclosure-icon{transform:rotate(90deg)}
    .mc-debug-group{margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12)}
    .mc-debug-group.is-first-group{margin-top:0;padding-top:0;border-top:0}
    .mc-debug-group-title{margin-bottom:8px}
    .mc-debug-section+.mc-debug-section{margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08)}
    .mc-debug-section-head{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.04)}
    .mc-debug-section-head[data-open="true"]{background:rgba(255,255,255,.06)}
    .mc-debug-disclosure{appearance:none;display:flex;align-items:center;justify-content:space-between;flex:1;min-width:0;padding:0;border:0;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
    .mc-debug-disclosure:hover .mc-debug-title,.mc-debug-disclosure:focus-visible .mc-debug-title{color:#fff}
    .mc-debug-disclosure:focus-visible,.mc-debug-icon-button:focus-visible{outline:2px solid var(--mc-debug-accent);outline-offset:3px;border-radius:6px}
    .mc-debug-disclosure-copy{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
    .mc-debug-disclosure-icon{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:16px;height:16px;color:var(--mc-debug-accent);transition:transform .18s ease}
    .mc-debug-disclosure-icon svg{display:block;width:100%;height:100%}
    .mc-debug-disclosure[aria-expanded="true"] .mc-debug-disclosure-icon{transform:rotate(90deg)}
    .mc-debug-title{min-width:0;flex:1;overflow:hidden;color:rgba(255,255,255,.9);font-weight:700;text-overflow:ellipsis;white-space:nowrap}
    .mc-debug-section-body[hidden]{display:none}
    .mc-debug-section-body{padding:6px 10px 0}
    .mc-debug-icon-button{appearance:none;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:22px;height:22px;padding:0;border:0;border-radius:999px;background:transparent;color:var(--mc-debug-accent);cursor:pointer}
    .mc-debug-icon-button:hover{background:rgba(var(--mc-debug-accent-rgb),.14);color:var(--mc-debug-accent)}
    .mc-debug-icon-button svg{display:block;width:13px;height:13px}
    .mc-debug-stats{display:grid;grid-template-columns:1fr auto;gap:5px 12px;margin:-3px 0 16px;padding:10px;background:rgba(255,255,255,.055);border-radius:6px;color:rgba(255,255,255,.64);font-size:10px}
    .mc-debug-stats strong{color:#fff;font-weight:600;font-variant-numeric:tabular-nums}
    .mc-debug-control{display:block;margin-bottom:16px}
    .mc-debug-control:last-child{margin-bottom:0}
    .mc-debug-section-body>.mc-debug-control:first-child{margin-top:6px}
    .mc-debug-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:7px}
    .mc-debug-label{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,.82)}
    .mc-debug-info{display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;border:1px solid rgba(var(--mc-debug-accent-rgb),.7);border-radius:50%;color:var(--mc-debug-accent);font-size:8px;font-weight:700;line-height:1;cursor:help}
    .mc-debug-tooltip{position:fixed;z-index:2147483647;max-width:220px;padding:6px 8px;border-radius:5px;background:#171512;color:#fff;box-shadow:0 5px 16px rgba(0,0,0,.3);font:500 9px/1.35 'Poppins',Arial,Helvetica,sans-serif;opacity:0;pointer-events:none;transform:translateY(3px);transition:opacity .15s ease,transform .15s ease}
    .mc-debug-tooltip.is-visible{opacity:1;transform:translateY(0)}
    .mc-debug-info:focus-visible{outline:2px solid var(--mc-debug-accent);outline-offset:2px}
    .mc-debug-value{color:var(--mc-debug-accent);font-variant-numeric:tabular-nums}
    .mc-debug-control input[type=range]{--mc-range-progress:50%;-webkit-appearance:none;appearance:none;display:block;width:100%;height:16px;margin:0;background:transparent;cursor:pointer}
    .mc-debug-control input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:linear-gradient(to right,var(--mc-debug-accent) 0%,var(--mc-debug-accent) var(--mc-range-progress),rgba(255,255,255,.14) var(--mc-range-progress),rgba(255,255,255,.14) 100%)}
    .mc-debug-control input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;margin-top:-5px;border:2px solid #2a2722;border-radius:50%;background:var(--mc-debug-accent);box-shadow:0 0 0 1px var(--mc-debug-accent)}
    .mc-debug-control input[type=range]::-moz-range-track{height:4px;border-radius:999px;background:rgba(255,255,255,.14)}
    .mc-debug-control input[type=range]::-moz-range-progress{height:4px;border-radius:999px;background:var(--mc-debug-accent)}
    .mc-debug-control input[type=range]::-moz-range-thumb{width:14px;height:14px;border:2px solid #2a2722;border-radius:50%;background:var(--mc-debug-accent)}
    .mc-debug-control input[type=checkbox],.mc-debug-effect-toggle input[type=checkbox]{appearance:none;position:relative;display:block;width:30px;height:16px;margin:0;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:rgba(255,255,255,.08);cursor:pointer;transition:background .16s ease,border-color .16s ease}
    .mc-debug-control input[type=checkbox]::after,.mc-debug-effect-toggle input[type=checkbox]::after{position:absolute;top:2px;left:2px;width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.55);content:'';transition:transform .16s ease,background .16s ease}
    .mc-debug-control input[type=checkbox]:checked,.mc-debug-effect-toggle input[type=checkbox]:checked{border-color:var(--mc-debug-accent);background:var(--mc-debug-accent)}
    .mc-debug-control input[type=checkbox]:checked::after,.mc-debug-effect-toggle input[type=checkbox]:checked::after{background:#2a2722;transform:translateX(14px)}
    .mc-debug-control input[type=checkbox]:disabled{cursor:not-allowed;opacity:.45}
    .mc-debug-control input[type=checkbox]:focus-visible,.mc-debug-effect-toggle input[type=checkbox]:focus-visible{outline:2px solid var(--mc-debug-accent);outline-offset:2px}
    .mc-debug-text{appearance:none;display:block;width:100%;padding:8px 10px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(255,255,255,.04);color:#fff;font:500 11px/1.3 'Poppins',Arial,Helvetica,sans-serif}
    .mc-debug-text::placeholder{color:rgba(255,255,255,.35)}
    .mc-debug-text:hover{border-color:rgba(255,255,255,.22)}
    .mc-debug-text:focus-visible{outline:2px solid var(--mc-debug-accent);outline-offset:2px;border-color:var(--mc-debug-accent)}
    .mc-debug-button{appearance:none;width:100%;margin-top:14px;padding:9px 12px;border:1px solid var(--mc-debug-accent);border-radius:6px;background:transparent;color:var(--mc-debug-accent);font:600 10px/1 'Poppins',Arial,Helvetica,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
    .mc-debug-button:hover{background:var(--mc-debug-accent);color:#2a2722}
    .mc-debug-button:active{transform:translateY(1px)}
    .mc-debug-status{margin-bottom:12px;padding:10px;background:rgba(255,255,255,.06);border-radius:6px;color:rgba(255,255,255,.65);white-space:pre-wrap}
  `;

const BRAND_SPOT_COLOURS = ['#00FF00', '#FF00FF', '#FF6600', '#FFFF00', '#00FFFF'] as const;
const ACCORDION_STORAGE_KEY = 'mc-debug-accordion-state';
const PANEL_COLLAPSED_STORAGE_KEY = 'mc-debug-panel-collapsed';
const SETTINGS_STORAGE_PREFIX = 'mc-debug-settings:';
const logger = createLogger('digerati', 'debug');

const ensureMC = (): MCNamespace => {
  window.MC ||= {};

  return window.MC;
};

const ensureMotionAPI = (): MCMotionAPI => {
  const mc = ensureMC();

  if (mc.motion) {
    return mc.motion;
  }

  const mediaQuery = '(prefers-reduced-motion: reduce)';
  const rootAttribute = 'data-mc-reduced-motion';

  const applyState = () => {
    document.documentElement.setAttribute(rootAttribute, mc.motion?.reduced ? 'true' : 'false');
  };

  mc.motion = {
    mode: 'system',

    get systemReduced() {
      return !!window.matchMedia?.(mediaQuery).matches;
    },

    get reduced() {
      if (this.mode === 'reduce') {
        return true;
      }

      if (this.mode === 'full') {
        return false;
      }

      return this.systemReduced;
    },

    setMode(mode) {
      if (!['system', 'reduce', 'full'].includes(mode)) {
        return;
      }

      this.mode = mode as MotionMode;

      applyState();

      window.dispatchEvent(
        new CustomEvent('mcMotionPreferenceChange', {
          detail: {
            mode: this.mode,
            reduced: this.reduced,
            systemReduced: this.systemReduced,
          },
        })
      );
    },

    refresh() {
      applyState();

      window.dispatchEvent(
        new CustomEvent('mcMotionPreferenceChange', {
          detail: {
            mode: this.mode,
            reduced: this.reduced,
            systemReduced: this.systemReduced,
          },
        })
      );
    },
  };

  applyState();

  const media = window.matchMedia?.(mediaQuery);

  if (media) {
    const systemChanged = () => {
      if (ensureMC().motion?.mode === 'system') {
        ensureMC().motion?.refresh();
      }
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', systemChanged);
    } else if (typeof media.addListener === 'function') {
      media.addListener(systemChanged);
    }
  }

  return mc.motion;
};

const currentPageName = () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  return `/${decodeURIComponent(path.split('/').pop() || 'index')}`;
};

export const initMCDebug = () => {
  const mc = ensureMC();
  const motion = ensureMotionAPI();
  const schemas = new Map<string, MCDebugSchema>();
  const collapsedState = new Map<string, boolean>();
  const hydratedSchemas = new Set<string>();
  let globalSettingsHydrated = false;
  const settingsStorageKey = `${SETTINGS_STORAGE_PREFIX}${currentPageName()}`;
  type DebugSettings = {
    page?: string;
    exportedAt?: string;
    motion?: MotionMode;
    scrollTriggerDebug?: boolean;
    effectEnabled?: Record<string, boolean>;
    effects?: Record<string, Array<Record<string, unknown>>>;
  };
  let storedSettings: DebugSettings | null = null;
  let panelContentCollapsed = false;
  const effectEnabled = new Map<string, boolean>();

  try {
    const savedState = JSON.parse(
      window.localStorage.getItem(ACCORDION_STORAGE_KEY) || '{}'
    ) as Record<string, boolean>;

    Object.entries(savedState).forEach(([key, collapsed]) => {
      if (typeof collapsed === 'boolean') {
        collapsedState.set(key, collapsed);
      }
    });

    panelContentCollapsed = window.localStorage.getItem(PANEL_COLLAPSED_STORAGE_KEY) === 'true';
    const savedSettings = JSON.parse(window.localStorage.getItem(settingsStorageKey) || 'null');
    if (savedSettings && typeof savedSettings === 'object') {
      storedSettings = savedSettings as DebugSettings;
    }
  } catch {
    // The debugger remains usable when storage is unavailable.
  }

  let panel: HTMLDivElement | null = null;
  let isOpen = false;
  let activeTooltip: HTMLDivElement | null = null;

  const hideTooltip = () => {
    activeTooltip?.remove();
    activeTooltip = null;
  };

  const showTooltip = (target: HTMLElement, message: string) => {
    hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'mc-debug-tooltip';
    tooltip.id = 'mc-debug-tooltip';
    tooltip.textContent = message;
    tooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltip);

    const targetBounds = target.getBoundingClientRect();
    const tooltipBounds = tooltip.getBoundingClientRect();
    const margin = 8;
    const left = Math.min(
      window.innerWidth - tooltipBounds.width - margin,
      Math.max(margin, targetBounds.right - tooltipBounds.width)
    );
    const topAbove = targetBounds.top - tooltipBounds.height - margin;
    const top = topAbove >= margin ? topAbove : targetBounds.bottom + margin;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.min(window.innerHeight - tooltipBounds.height - margin, top)}px`;
    tooltip.classList.add('is-visible');
    activeTooltip = tooltip;
  };

  const attachTooltip = (target: HTMLElement) => {
    const message = target.dataset.tooltip;
    if (!message) return;

    target.setAttribute('aria-describedby', 'mc-debug-tooltip');
    target.addEventListener('pointerenter', () => showTooltip(target, message));
    target.addEventListener('pointerleave', hideTooltip);
    target.addEventListener('focus', () => showTooltip(target, message));
    target.addEventListener('blur', hideTooltip);
  };

  const orderedSchemas = () =>
    [...schemas.values()].sort((a, b) => {
      const aElement = a.orderElement?.();
      const bElement = b.orderElement?.();

      if (aElement && bElement && aElement !== bElement) {
        const position = aElement.compareDocumentPosition(bElement);

        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }

        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
      }

      return (a.order ?? 0) - (b.order ?? 0);
    });

  const setAccentColour = (hex: string) => {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    const value = normalized.slice(1);

    if (value.length !== 6) {
      return;
    }

    const r = Number.parseInt(value.slice(0, 2), 16);
    const g = Number.parseInt(value.slice(2, 4), 16);
    const b = Number.parseInt(value.slice(4, 6), 16);

    if ([r, g, b].some((channel) => Number.isNaN(channel))) {
      return;
    }

    document.documentElement.style.setProperty('--mc-debug-accent', normalized);
    document.documentElement.style.setProperty('--mc-debug-accent-rgb', `${r}, ${g}, ${b}`);
  };

  const applyRandomAccentColour = () => {
    const colour =
      BRAND_SPOT_COLOURS[Math.floor(Math.random() * BRAND_SPOT_COLOURS.length)] ||
      BRAND_SPOT_COLOURS[0];

    setAccentColour(colour);
  };

  const persistAccordionState = () => {
    try {
      window.localStorage.setItem(
        ACCORDION_STORAGE_KEY,
        JSON.stringify(Object.fromEntries(collapsedState))
      );
    } catch {
      // The debugger remains usable when storage is unavailable.
    }
  };

  const syncPanelCollapseButton = () => {
    if (!panel) {
      return;
    }

    const button = panel.querySelector<HTMLButtonElement>('.mc-debug-brand-actions button');

    if (!button) {
      return;
    }

    const expanded = !panelContentCollapsed;

    button.dataset.expanded = String(expanded);
    button.title = expanded ? 'Collapse panel' : 'Expand panel';
    button.setAttribute('aria-label', expanded ? 'Collapse panel' : 'Expand panel');
  };

  const formatValue = (control: MCRangeControl, value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value ?? '');

    if (typeof control.format === 'function') {
      return control.format(n);
    }

    const decimals = Number.isInteger(control.decimals)
      ? control.decimals
      : Number.isInteger(Number(control.step)) && Number(control.step) >= 1
        ? 0
        : (String(control.step ?? '').split('.')[1]?.length ?? 1);

    return `${n.toFixed(decimals)}${control.suffix || ''}`;
  };

  const read = (instance: MCController, schema: MCDebugSchema, key: string) => {
    if (typeof schema.get === 'function') return schema.get(instance, key);
    if (typeof instance?.get === 'function') return instance.get(key);
    if (instance?.settings && key in instance.settings) return instance.settings[key];
  };

  const write = (
    instance: MCController,
    schema: MCDebugSchema,
    key: string,
    value: unknown,
    persist = true
  ) => {
    if (typeof schema.set === 'function') {
      schema.set(instance, key, value);
    } else if (typeof instance?.set === 'function') {
      instance.set(key, value);
    }

    if (persist) {
      persistSettings();
    }
  };

  const collectSettings = (): DebugSettings => {
    const effects: Record<string, Array<Record<string, unknown>>> = {};

    orderedSchemas().forEach((schema) => {
      const instances =
        typeof schema.instances === 'function' ? (schema.instances() || []).filter(Boolean) : [];
      const controls = (schema.controls || []).filter(
        (control) =>
          control.type === 'range' || control.type === 'text' || control.type === 'toggle'
      );

      effects[schema.id] = instances.map((instance) => {
        const settings: Record<string, unknown> = {};

        controls.forEach((control) => {
          const value = read(instance, schema, control.key);
          if (value !== undefined) {
            settings[control.key] = value;
          }
        });

        return settings;
      });
    });

    return {
      page: currentPageName(),
      exportedAt: new Date().toISOString(),
      motion: motion.mode,
      scrollTriggerDebug: getScrollTriggerDebug(),
      effectEnabled: Object.fromEntries(
        orderedSchemas()
          .filter((schema) => schema.effect)
          .map((schema) => [schema.id, effectEnabled.get(schema.id) ?? schema.effect!.enabled()])
      ),
      effects,
    };
  };

  const isEffectEnabled = (id: string) => effectEnabled.get(id) ?? true;

  const setEffectEnabled = (schema: MCDebugSchema, enabled: boolean) => {
    if (!schema.effect || isEffectEnabled(schema.id) === enabled) {
      return;
    }

    effectEnabled.set(schema.id, enabled);
    void Promise.resolve(schema.effect.setEnabled(enabled)).finally(() => {
      logger.info(`${schema.label || schema.id} ${enabled ? 'enabled' : 'disabled'}`);
      persistSettings();
      if (isOpen) render();
    });
  };

  const saveStoredSettings = () => {
    try {
      window.localStorage.setItem(settingsStorageKey, JSON.stringify(storedSettings));
    } catch {
      // The debugger remains usable when storage is unavailable.
    }
  };

  const persistSettings = () => {
    storedSettings = collectSettings();
    saveStoredSettings();
  };

  const applyGlobalSettings = (settings: DebugSettings) => {
    if (settings.motion && ['system', 'reduce', 'full'].includes(settings.motion)) {
      motion.setMode(settings.motion);
    }

    if (typeof settings.scrollTriggerDebug === 'boolean') {
      setScrollTriggerDebug(settings.scrollTriggerDebug);
    }
  };

  const hydrateSchema = (schema: MCDebugSchema) => {
    if (hydratedSchemas.has(schema.id)) {
      return;
    }

    const savedInstances = storedSettings?.effects?.[schema.id];
    const instances =
      typeof schema.instances === 'function' ? (schema.instances() || []).filter(Boolean) : [];

    if (!savedInstances || !instances.length) {
      return;
    }

    const validKeys = new Set(
      (schema.controls || [])
        .filter(
          (control) =>
            control.type === 'range' || control.type === 'text' || control.type === 'toggle'
        )
        .map((control) => control.key)
    );

    savedInstances.forEach((settings, index) => {
      const instance = instances[index];
      if (!instance) return;

      Object.entries(settings).forEach(([key, value]) => {
        if (validKeys.has(key)) {
          write(instance, schema, key, value, false);
        }
      });
    });

    hydratedSchemas.add(schema.id);
  };

  const hydrateEffect = (schema: MCDebugSchema) => {
    if (!schema.effect || effectEnabled.has(schema.id)) {
      return;
    }

    const enabled = storedSettings?.effectEnabled?.[schema.id];
    effectEnabled.set(schema.id, typeof enabled === 'boolean' ? enabled : schema.effect.enabled());

    if (enabled === false) {
      void schema.effect.setEnabled(false);
    }
  };

  const hydrateAvailableSettings = () => {
    if (!storedSettings) {
      return;
    }

    if (!globalSettingsHydrated) {
      applyGlobalSettings(storedSettings);
      globalSettingsHydrated = true;
    }
    orderedSchemas().forEach((schema) => {
      hydrateEffect(schema);
      hydrateSchema(schema);
    });
  };

  const exportSettings = () => {
    const payload = collectSettings();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const download = document.createElement('a');
    download.href = url;
    download.download = `mc-debug-${currentPageName().slice(1) || 'index'}.json`;
    download.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const importSettings = async (file: File) => {
    try {
      const imported = JSON.parse(await file.text()) as DebugSettings;

      if (!imported || typeof imported !== 'object' || !imported.effects) {
        throw new Error('The file does not contain MC debug settings.');
      }

      storedSettings = imported;
      hydratedSchemas.clear();
      globalSettingsHydrated = false;
      saveStoredSettings();
      hydrateAvailableSettings();
      render();
    } catch (error) {
      logger.warn('Debug settings import failed:', error);
    }
  };

  const resetSettings = () => {
    try {
      window.localStorage.removeItem(settingsStorageKey);
      window.localStorage.removeItem(ACCORDION_STORAGE_KEY);
      window.localStorage.removeItem(PANEL_COLLAPSED_STORAGE_KEY);
    } catch {
      // Reloading still restores page-authored attributes when storage is unavailable.
    }

    window.location.reload();
  };

  const createControlLabel = (labelText: string, description?: string) => {
    const label = document.createElement('span');
    label.className = 'mc-debug-label';
    label.append(document.createTextNode(labelText));

    const info = document.createElement('span');
    info.className = 'mc-debug-info';
    info.tabIndex = 0;
    info.textContent = 'i';
    info.dataset.tooltip = description || `Adjusts ${labelText.toLowerCase()}.`;
    info.setAttribute('role', 'img');
    info.setAttribute('aria-label', info.dataset.tooltip);
    attachTooltip(info);
    label.appendChild(info);

    return label;
  };

  const createRange = (instance: MCController, schema: MCDebugSchema, control: MCRangeControl) => {
    const current = read(instance, schema, control.key);
    if (current == null || !Number.isFinite(Number(current))) return null;

    const wrap = document.createElement('label');
    wrap.className = 'mc-debug-control';

    const row = document.createElement('div');
    row.className = 'mc-debug-row';

    const label = createControlLabel(control.label, control.description);

    const display = document.createElement('span');
    display.className = 'mc-debug-value';
    display.textContent = formatValue(control, current);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(control.min);
    input.max = String(control.max);
    input.step = String(control.step);
    input.value = String(current);

    const updateProgress = () => {
      const min = Number(input.min);
      const max = Number(input.max);
      const val = Number(input.value);
      const pct = max === min ? 0 : ((val - min) / (max - min)) * 100;
      input.style.setProperty('--mc-range-progress', `${Math.max(0, Math.min(100, pct))}%`);
    };

    updateProgress();

    input.addEventListener('input', () => {
      updateProgress();
      display.textContent = formatValue(control, input.value);

      if (control.event !== 'change') {
        write(instance, schema, control.key, Number(input.value));
      }
    });

    if (control.event === 'change') {
      input.addEventListener('change', () => {
        write(instance, schema, control.key, Number(input.value));
      });
    }

    row.append(label, display);
    wrap.append(row, input);
    return wrap;
  };

  const createButton = (instance: MCController, control: MCButtonControl) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mc-debug-button';
    button.textContent = control.label;

    button.addEventListener('click', () => {
      if (typeof control.onClick === 'function') {
        control.onClick(instance);
        return;
      }

      const actionTarget = instance as Record<string, unknown>;

      if (control.action && typeof actionTarget[control.action] === 'function') {
        const action = actionTarget[control.action] as () => void;
        action();
      }
    });

    return button;
  };

  const createToggle = (
    instance: MCController,
    schema: MCDebugSchema,
    control: MCToggleControl
  ) => {
    const current = Boolean(read(instance, schema, control.key));
    const wrap = document.createElement('label');
    wrap.className = 'mc-debug-control';

    const row = document.createElement('div');
    row.className = 'mc-debug-row';
    const label = createControlLabel(control.label, control.description);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = current;
    input.setAttribute('aria-label', control.label);
    input.addEventListener('change', () => {
      write(instance, schema, control.key, input.checked);
    });

    row.append(label, input);
    wrap.appendChild(row);
    return wrap;
  };

  const createText = (instance: MCController, schema: MCDebugSchema, control: MCTextControl) => {
    const current = read(instance, schema, control.key);

    const wrap = document.createElement('label');
    wrap.className = 'mc-debug-control';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mc-debug-text';
    input.value = current == null ? '' : String(current);
    input.setAttribute('aria-label', control.label || control.placeholder || control.key);

    if (control.placeholder) {
      input.placeholder = control.placeholder;
    }

    const commit = () => {
      write(instance, schema, control.key, input.value);
    };

    input.addEventListener('input', () => {
      if (control.event !== 'change') {
        commit();
      }
    });

    if (control.event === 'change') {
      input.addEventListener('change', commit);
    }

    if (control.label) {
      const row = document.createElement('div');
      row.className = 'mc-debug-row';

      const label = createControlLabel(control.label, control.description);

      row.appendChild(label);
      wrap.append(row, input);
    } else {
      wrap.appendChild(input);
    }

    return wrap;
  };

  const isReplayControl = (control: MCButtonControl) =>
    control.action === 'replay' || control.label.trim().toLowerCase() === 'replay';

  const createReplayButton = (instance: MCController, control?: MCButtonControl) => {
    if (!control && typeof instance?.replay !== 'function') {
      return null;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mc-debug-icon-button';
    button.title = 'Replay';
    button.setAttribute('aria-label', 'Replay');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6V11H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.364 15A8 8 0 1 1 20 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (control) {
        if (typeof control.onClick === 'function') {
          control.onClick(instance);
          return;
        }

        if (
          control.action &&
          typeof (instance as Record<string, unknown>)[control.action] === 'function'
        ) {
          ((instance as Record<string, unknown>)[control.action] as () => void)();
          return;
        }
      }

      if (typeof instance.replay === 'function') {
        instance.replay();
      }
    });

    return button;
  };

  const createStats = (schema: MCDebugSchema) => {
    if (!Array.isArray(schema.stats) || !schema.stats.length) return null;

    const block = document.createElement('div');
    block.className = 'mc-debug-stats';

    schema.stats.forEach((stat) => {
      const label = document.createElement('span');
      label.textContent = stat.label;

      const value = document.createElement('strong');
      const raw = typeof stat.value === 'function' ? stat.value() : stat.value;
      value.textContent =
        typeof stat.format === 'function'
          ? stat.format(raw)
          : Number.isFinite(Number(raw))
            ? Math.round(Number(raw)).toLocaleString()
            : String(raw ?? '');

      block.append(label, value);
    });

    return block;
  };

  const createSection = (
    instance: MCController,
    schema: MCDebugSchema,
    index: number,
    total: number,
    defaultOpen: boolean
  ) => {
    const section = document.createElement('div');
    section.className = 'mc-debug-section';

    const sectionKey = `${schema.id}:${index}`;
    const collapsed = collapsedState.has(sectionKey)
      ? collapsedState.get(sectionKey)!
      : !defaultOpen;
    const bodyId = `mc-debug-section-${schema.id}-${index}`;

    let titleText = 'Controls';
    if (schema.instanceLabel !== false) {
      if (typeof schema.instanceLabel === 'function') {
        titleText = schema.instanceLabel(instance, index, total);
      } else {
        const base = schema.instanceLabel || 'Instance';
        titleText = total > 1 ? `${base} ${index + 1}` : base;
      }
    }

    const header = document.createElement('div');
    header.className = 'mc-debug-section-head';
    header.dataset.open = String(!collapsed);

    const disclosure = document.createElement('button');
    disclosure.type = 'button';
    disclosure.className = 'mc-debug-disclosure';
    disclosure.setAttribute('aria-expanded', String(!collapsed));
    disclosure.setAttribute('aria-controls', bodyId);
    const disclosureCopy = document.createElement('span');
    disclosureCopy.className = 'mc-debug-disclosure-copy';

    const title = document.createElement('span');
    title.className = 'mc-debug-title';
    title.textContent = titleText;

    disclosureCopy.appendChild(title);

    const body = document.createElement('div');
    body.className = 'mc-debug-section-body';
    body.id = bodyId;
    body.hidden = collapsed;

    disclosure.addEventListener('click', () => {
      const nextCollapsed = !body.hidden;
      body.hidden = nextCollapsed;
      disclosure.setAttribute('aria-expanded', String(!nextCollapsed));
      header.dataset.open = String(!nextCollapsed);
      collapsedState.set(sectionKey, nextCollapsed);
      persistAccordionState();
    });

    const replayControl = (schema.controls || []).find(
      (control): control is MCButtonControl => control.type === 'button' && isReplayControl(control)
    );
    const replayButton = createReplayButton(instance, replayControl);

    const chevron = document.createElement('span');
    chevron.className = 'mc-debug-disclosure-icon';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    disclosure.append(disclosureCopy, chevron);
    header.appendChild(disclosure);

    if (replayButton) {
      header.appendChild(replayButton);
    }

    section.appendChild(header);

    (schema.controls || []).forEach((control) => {
      if (control.type === 'button' && isReplayControl(control)) {
        return;
      }

      let element: HTMLElement | null = null;

      if (control.type === 'range') {
        element = createRange(instance, schema, control);
      } else if (control.type === 'text') {
        element = createText(instance, schema, control);
      } else if (control.type === 'toggle') {
        element = createToggle(instance, schema, control);
      } else if (control.type === 'button') {
        element = createButton(instance, control);
      }

      if (element) body.appendChild(element);
    });

    section.appendChild(body);
    return section;
  };

  const createSegmentedButtons = (
    options: Array<{ value: string; label: string }>,
    activeValue: string,
    onSelect: (value: string, button: HTMLButtonElement, control: HTMLDivElement) => void
  ) => {
    const control = document.createElement('div');
    control.className = `mc-debug-segmented ${options.length === 2 ? 'is-two-up' : 'is-three-up'}`;

    options.forEach(({ value, label }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;

      if (activeValue === value) button.classList.add('is-active');

      button.addEventListener('click', () => {
        onSelect(value, button, control);
      });

      control.appendChild(button);
    });

    return control;
  };

  const motionControl = () => {
    const wrap = document.createElement('div');
    wrap.className = 'mc-debug-global';

    const grid = document.createElement('div');
    grid.className = 'mc-debug-global-grid';

    const motionBlock = document.createElement('div');
    motionBlock.className = 'mc-debug-global-block';

    const motionTitle = document.createElement('div');
    motionTitle.className = 'mc-debug-global-title';
    motionTitle.textContent = 'Reduce Motion';

    motionBlock.append(
      motionTitle,
      createSegmentedButtons(
        [
          { value: 'system', label: 'System' },
          { value: 'reduce', label: 'On' },
          { value: 'full', label: 'Off' },
        ],
        motion.mode,
        (mode, button, control) => {
          motion.setMode(mode);
          persistSettings();
          render();
        }
      )
    );

    const debugBlock = document.createElement('div');
    debugBlock.className = 'mc-debug-global-block is-align-right';

    const debugTitle = document.createElement('div');
    debugTitle.className = 'mc-debug-global-title';
    debugTitle.textContent = 'GSAP Debug';

    debugBlock.append(
      debugTitle,
      createSegmentedButtons(
        [
          { value: 'on', label: 'On' },
          { value: 'off', label: 'Off' },
        ],
        getScrollTriggerDebug() ? 'on' : 'off',
        (value, button, control) => {
          setScrollTriggerDebug(value === 'on');
          persistSettings();
          control.querySelectorAll('button').forEach((el) => el.classList.remove('is-active'));
          button.classList.add('is-active');
        }
      )
    );

    grid.append(motionBlock, debugBlock);
    wrap.appendChild(grid);
    return wrap;
  };

  const effectsControl = () => {
    const effectSchemas = orderedSchemas().filter((schema) => {
      if (!schema.effect) return false;
      return (schema.instances?.() || []).filter(Boolean).length > 0;
    });
    if (!effectSchemas.length) return null;

    const wrap = document.createElement('div');
    wrap.className = 'mc-debug-global';

    const title = document.createElement('div');
    title.className = 'mc-debug-global-title';
    title.textContent = 'Effects';
    wrap.appendChild(title);

    effectSchemas.forEach((schema) => {
      const control = document.createElement('label');
      control.className = 'mc-debug-control';
      const row = document.createElement('div');
      row.className = 'mc-debug-row';
      const label = document.createElement('span');
      label.className = 'mc-debug-label';
      label.textContent = schema.label || schema.id;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = isEffectEnabled(schema.id);
      input.disabled = motion.reduced;
      input.setAttribute('aria-label', `${schema.label || schema.id} enabled`);
      if (motion.reduced) {
        input.title = 'Effect controls are unavailable while Reduce Motion is on.';
      }
      input.addEventListener('change', () => setEffectEnabled(schema, input.checked));
      row.append(label, input);
      control.appendChild(row);
      wrap.appendChild(control);
    });

    return wrap;
  };

  const panelCollapseControl = () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mc-debug-global-icon';
    button.dataset.expanded = String(!panelContentCollapsed);
    button.title = panelContentCollapsed ? 'Expand panel' : 'Collapse panel';
    button.setAttribute('aria-label', panelContentCollapsed ? 'Expand panel' : 'Collapse panel');
    button.innerHTML = `
      <span class="mc-debug-disclosure-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    `;

    button.addEventListener('click', () => {
      panelContentCollapsed = !panelContentCollapsed;

      try {
        window.localStorage.setItem(PANEL_COLLAPSED_STORAGE_KEY, String(panelContentCollapsed));
      } catch {
        // The debugger remains usable when storage is unavailable.
      }

      const content = panel?.querySelector<HTMLElement>('.mc-debug-content');
      if (content) {
        content.hidden = panelContentCollapsed;
      }

      syncPanelCollapseButton();
    });

    return button;
  };

  const render = () => {
    if (!panel) return;

    hideTooltip();
    syncPanelCollapseButton();

    const content = panel.querySelector<HTMLElement>('.mc-debug-content');
    if (!content) return;

    content.hidden = panelContentCollapsed;
    content.innerHTML = '';
    content.appendChild(motionControl());
    const effects = effectsControl();
    if (effects) content.appendChild(effects);
    let rendered = false;
    let sectionCount = 0;
    orderedSchemas().forEach((schema) => {
      if (schema.showInPanel === false) return;

      const instances =
        typeof schema.instances === 'function' ? (schema.instances() || []).filter(Boolean) : [];

      if (!instances.length) return;

      const group = document.createElement('div');
      group.className = 'mc-debug-group';
      if (!rendered) {
        group.classList.add('is-first-group');
      }

      const title = document.createElement('div');
      title.className = 'mc-debug-group-title';
      title.textContent = schema.label || schema.id;
      group.appendChild(title);

      const stats = createStats(schema);
      if (stats) group.appendChild(stats);

      instances.forEach((instance, index) => {
        group.appendChild(
          createSection(instance, schema, index, instances.length, sectionCount === 0)
        );
        sectionCount += 1;
      });

      content.appendChild(group);
      rendered = true;
    });

    if (!rendered) {
      const status = document.createElement('div');
      status.className = 'mc-debug-status';
      status.textContent = 'No MC effects registered.';
      content.appendChild(status);
    }
  };

  const createPanel = () => {
    if (panel) return;

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    panel = document.createElement('div');
    panel.id = 'mc-debug-panel';
    panel.innerHTML = `
      <div class="mc-debug-brand">
        <svg class="mc-debug-logo" viewBox="0 0 83 71" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Digerati eye">
          <path d="M75.0347 71L70.1372 66.7991C68.5397 65.4288 66.5009 64.675 64.3919 64.675H3.66905L9.78491 62.544C11.7729 61.8513 13.4453 60.472 14.4984 58.6566L44.7876 6.44199L43.638 12.7097C43.2632 14.7533 43.6304 16.863 44.674 18.662L75.0347 71ZM41.1864 0L0 71H82.3729L41.1864 0Z" fill="currentColor"/>
          <path d="M41.1864 50.5709C43.1753 50.5709 44.7876 48.9662 44.7876 46.9868C44.7876 45.0073 43.1753 43.4026 41.1864 43.4026C39.1976 43.4026 37.5853 45.0073 37.5853 46.9868C37.5853 48.9662 39.1976 50.5709 41.1864 50.5709Z" fill="currentColor"/>
          <path d="M41.1864 58.2798C30.0578 58.2798 23.6153 48.9754 23.3464 48.5795L24.2635 46.8092L23.3464 45.039C23.6153 44.6431 30.0578 35.3387 41.1864 35.3387C52.3151 35.3387 58.7576 44.6431 59.0264 45.039L58.1094 46.8092L59.0264 48.5795C58.7576 48.9754 52.3151 58.2798 41.1864 58.2798ZM24.2635 46.8097C26.2639 48.8589 36.0107 51.9549 41.1864 51.9549C46.3594 51.9549 56.1057 48.8618 58.1094 46.8092C56.1057 44.7567 46.3594 41.6636 41.1864 41.6636C36.0131 41.6636 26.2669 44.7571 24.2635 46.8097Z" fill="white"/>
        </svg>
        <span class="mc-debug-page"></span>
        <div class="mc-debug-brand-actions"></div>
      </div>
      <div class="mc-debug-content"></div>
      <div class="mc-debug-footer">
        <span>It's not a conspiracy.</span>
        <div class="mc-debug-footer-actions">
          <button class="mc-debug-export mc-debug-import" type="button" aria-label="Import JSON" data-tooltip="Import JSON settings">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 3V15M12 15L7.5 10.5M12 15L16.5 10.5M4 16V20H20V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="mc-debug-export mc-debug-export-file" type="button" aria-label="Export JSON" data-tooltip="Export JSON settings">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 15V3M12 3L7.5 7.5M12 3L16.5 7.5M4 16V20H20V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="mc-debug-export mc-debug-reset" type="button" aria-label="Reset settings" data-tooltip="Reset saved settings">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M20 6V11H15M18.364 15A8 8 0 1 1 20 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <input class="mc-debug-import-file" type="file" accept="application/json,.json" hidden>
        </div>
      </div>
    `;

    panel.style.display = 'none';
    document.body.appendChild(panel);
    const pageName = currentPageName();
    const pageLabel = panel.querySelector<HTMLElement>('.mc-debug-page');
    if (pageLabel) {
      pageLabel.textContent = pageName;
      pageLabel.title = pageName;
    }
    panel.querySelectorAll<HTMLElement>('[data-tooltip]').forEach(attachTooltip);
    panel.querySelector('.mc-debug-brand-actions')?.appendChild(panelCollapseControl());
    panel
      .querySelector<HTMLButtonElement>('.mc-debug-export-file')
      ?.addEventListener('click', exportSettings);
    const importButton = panel.querySelector<HTMLButtonElement>('.mc-debug-import');
    const importFile = panel.querySelector<HTMLInputElement>('.mc-debug-import-file');
    importButton?.addEventListener('click', () => importFile?.click());
    importFile?.addEventListener('change', () => {
      const [file] = [...(importFile.files || [])];
      if (file) {
        void importSettings(file);
      }
      importFile.value = '';
    });
    panel
      .querySelector<HTMLButtonElement>('.mc-debug-reset')
      ?.addEventListener('click', resetSettings);

    const dragHandle = panel.querySelector<HTMLElement>('.mc-debug-brand');

    dragHandle?.addEventListener('pointerdown', (event) => {
      if (event.target instanceof Element && event.target.closest('button')) {
        return;
      }

      const currentPanel = panel;
      if (!currentPanel) {
        return;
      }

      const bounds = currentPanel.getBoundingClientRect();
      const offsetX = event.clientX - bounds.left;
      const offsetY = event.clientY - bounds.top;

      currentPanel.style.left = `${bounds.left}px`;
      currentPanel.style.top = `${bounds.top}px`;
      currentPanel.style.right = 'auto';

      dragHandle.setPointerCapture(event.pointerId);

      const move = (moveEvent: PointerEvent) => {
        const maxLeft = Math.max(0, window.innerWidth - bounds.width);
        const maxTop = Math.max(0, window.innerHeight - bounds.height);
        const left = Math.min(maxLeft, Math.max(0, moveEvent.clientX - offsetX));
        const top = Math.min(maxTop, Math.max(0, moveEvent.clientY - offsetY));

        currentPanel.style.left = `${left}px`;
        currentPanel.style.top = `${top}px`;
      };

      const stop = () => {
        dragHandle.removeEventListener('pointermove', move);
        dragHandle.removeEventListener('pointerup', stop);
        dragHandle.removeEventListener('pointercancel', stop);
      };

      dragHandle.addEventListener('pointermove', move);
      dragHandle.addEventListener('pointerup', stop);
      dragHandle.addEventListener('pointercancel', stop);
    });
  };

  const open = () => {
    createPanel();
    isOpen = true;
    applyRandomAccentColour();
    if (panel) {
      panel.style.display = 'flex';
    }
    render();
  };

  const close = () => {
    if (!panel) return;
    isOpen = false;
    hideTooltip();
    panel.style.display = 'none';
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  const register = (schema: MCDebugSchema) => {
    if (!schema?.id) return;
    schemas.set(schema.id, schema);
    hydrateAvailableSettings();
    if (isOpen) render();
  };

  const unregister = (id: string) => {
    schemas.delete(id);
    if (isOpen) render();
  };

  const refresh = () => {
    hydrateAvailableSettings();
    if (isOpen) render();
  };

  document.addEventListener('keydown', (event) => {
    const { key, target } = event;
    if (key.toLowerCase() !== 'd') return;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    ) {
      return;
    }

    event.preventDefault();
    toggle();
  });

  window.addEventListener('mcMotionPreferenceChange', () => {
    if (isOpen) render();
  });

  const queued = Array.isArray(mc.__debugQueue) ? mc.__debugQueue.splice(0) : [];

  mc.debug = {
    register,
    unregister,
    refresh,
    render,
    toggle,
    open,
    close,
    isEffectEnabled,
  };

  queued.forEach(register);

  logger.info('Generic debugger ready — press D');
};
