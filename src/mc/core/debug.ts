import type {
  MCButtonControl,
  MCController,
  MCDebugSchema,
  MCMotionAPI,
  MCNamespace,
  MCRangeControl,
  MotionMode,
} from './types';

const CSS = `
    #mc-debug-panel{
      position:fixed;top:16px;right:16px;z-index:2147483647;
      width:340px;max-height:calc(100vh - 32px);overflow-y:auto;
      padding:14px;color:#fff;background:#2a2722;
      border:1px solid rgba(255,255,255,.16);border-radius:12px;
      box-shadow:0 20px 60px rgba(0,0,0,.45);
      font:12px/1.4 'Poppins',Arial,Helvetica,sans-serif;
      -webkit-font-smoothing:antialiased
    }
    #mc-debug-panel *{box-sizing:border-box}
    .mc-debug-brand{display:flex;align-items:center;margin:-14px -14px 16px;padding:10px 14px 12px;border-bottom:1px solid rgba(255,255,255,.12)}
    .mc-debug-logo{display:block;width:50px;height:auto}
    .mc-debug-global{margin-bottom:10px;padding:0 0 10px;border-bottom:1px solid rgba(255,255,255,.12)}
    .mc-debug-global-title,.mc-debug-group-title{margin-bottom:9px;color:#00ffff;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
    .mc-debug-motion{display:inline-grid;grid-template-columns:repeat(3,minmax(54px,1fr));gap:2px;padding:2px;background:rgba(255,255,255,.055);border-radius:6px}
    .mc-debug-motion button{appearance:none;border:0;border-radius:4px;padding:5px 6px;background:transparent;color:rgba(255,255,255,.55);font:600 9px/1 'Poppins',Arial,Helvetica,sans-serif;cursor:pointer}
    .mc-debug-motion button:hover{color:#fff;background:rgba(255,255,255,.06)}
    .mc-debug-motion button.is-active{color:#2a2722;background:#00ffff;font-weight:700}
    .mc-debug-group{margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12)}
    .mc-debug-group.is-first-group{margin-top:0;padding-top:0;border-top:0}
    .mc-debug-group-title{margin-bottom:8px}
    .mc-debug-section+.mc-debug-section{margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08)}
    .mc-debug-section-head{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.04)}
    .mc-debug-section-head[data-open="true"]{background:rgba(255,255,255,.06)}
    .mc-debug-disclosure{appearance:none;display:flex;align-items:center;justify-content:space-between;flex:1;min-width:0;padding:0;border:0;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
    .mc-debug-disclosure:hover .mc-debug-title,.mc-debug-disclosure:focus-visible .mc-debug-title{color:#fff}
    .mc-debug-disclosure:focus-visible,.mc-debug-icon-button:focus-visible{outline:2px solid #00ffff;outline-offset:3px;border-radius:6px}
    .mc-debug-disclosure-copy{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
    .mc-debug-disclosure-icon{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:16px;height:16px;color:#00ffff;transition:transform .18s ease}
    .mc-debug-disclosure[aria-expanded="true"] .mc-debug-disclosure-icon{transform:rotate(90deg)}
    .mc-debug-title{min-width:0;flex:1;color:rgba(255,255,255,.9);font-weight:700}
    .mc-debug-section-body[hidden]{display:none}
    .mc-debug-section-body{padding:6px 0 0}
    .mc-debug-icon-button{appearance:none;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:22px;height:22px;padding:0;border:0;border-radius:999px;background:transparent;color:#00ffff;cursor:pointer}
    .mc-debug-icon-button:hover{background:rgba(0,255,255,.14);color:#00ffff}
    .mc-debug-icon-button svg{display:block;width:13px;height:13px}
    .mc-debug-stats{display:grid;grid-template-columns:1fr auto;gap:5px 12px;margin:-3px 0 16px;padding:10px;background:rgba(255,255,255,.055);border-radius:6px;color:rgba(255,255,255,.64);font-size:10px}
    .mc-debug-stats strong{color:#fff;font-weight:600;font-variant-numeric:tabular-nums}
    .mc-debug-control{display:block;margin-bottom:16px}
    .mc-debug-control:last-child{margin-bottom:0}
    .mc-debug-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:7px}
    .mc-debug-label{color:rgba(255,255,255,.82)}
    .mc-debug-value{color:#00ffff;font-variant-numeric:tabular-nums}
    .mc-debug-control input[type=range]{--mc-range-progress:50%;-webkit-appearance:none;appearance:none;display:block;width:100%;height:16px;margin:0;background:transparent;cursor:pointer}
    .mc-debug-control input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:linear-gradient(to right,#00ffff 0%,#00ffff var(--mc-range-progress),rgba(255,255,255,.14) var(--mc-range-progress),rgba(255,255,255,.14) 100%)}
    .mc-debug-control input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;margin-top:-5px;border:2px solid #2a2722;border-radius:50%;background:#00ffff;box-shadow:0 0 0 1px #00ffff}
    .mc-debug-control input[type=range]::-moz-range-track{height:4px;border-radius:999px;background:rgba(255,255,255,.14)}
    .mc-debug-control input[type=range]::-moz-range-progress{height:4px;border-radius:999px;background:#00ffff}
    .mc-debug-control input[type=range]::-moz-range-thumb{width:14px;height:14px;border:2px solid #2a2722;border-radius:50%;background:#00ffff}
    .mc-debug-button{appearance:none;width:100%;margin-top:14px;padding:9px 12px;border:1px solid #00ffff;border-radius:6px;background:transparent;color:#00ffff;font:600 10px/1 'Poppins',Arial,Helvetica,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
    .mc-debug-button:hover{background:#00ffff;color:#2a2722}
    .mc-debug-button:active{transform:translateY(1px)}
    .mc-debug-status{margin-bottom:12px;padding:10px;background:rgba(255,255,255,.06);border-radius:6px;color:rgba(255,255,255,.65);white-space:pre-wrap}
  `;

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

export const initMCDebug = () => {
  const mc = ensureMC();
  const motion = ensureMotionAPI();
  const schemas = new Map<string, MCDebugSchema>();
  const collapsedState = new Map<string, boolean>();

  let panel: HTMLDivElement | null = null;
  let isOpen = false;

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

  const write = (instance: MCController, schema: MCDebugSchema, key: string, value: unknown) => {
    if (typeof schema.set === 'function') {
      schema.set(instance, key, value);
      return;
    }

    if (typeof instance?.set === 'function') {
      instance.set(key, value);
    }
  };

  const createRange = (instance: MCController, schema: MCDebugSchema, control: MCRangeControl) => {
    const current = read(instance, schema, control.key);
    if (current == null || !Number.isFinite(Number(current))) return null;

    const wrap = document.createElement('label');
    wrap.className = 'mc-debug-control';

    const row = document.createElement('div');
    row.className = 'mc-debug-row';

    const label = document.createElement('span');
    label.className = 'mc-debug-label';
    label.textContent = control.label;

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
      } else if (control.type === 'button') {
        element = createButton(instance, control);
      }

      if (element) body.appendChild(element);
    });

    section.appendChild(body);
    return section;
  };

  const motionControl = () => {
    const wrap = document.createElement('div');
    wrap.className = 'mc-debug-global';

    const title = document.createElement('div');
    title.className = 'mc-debug-global-title';
    title.textContent = 'Reduce Motion';

    const control = document.createElement('div');
    control.className = 'mc-debug-motion';

    [
      ['system', 'System'],
      ['reduce', 'On'],
      ['full', 'Off'],
    ].forEach(([mode, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;

      if (motion.mode === mode) button.classList.add('is-active');

      button.addEventListener('click', () => {
        motion.setMode(mode);
        control.querySelectorAll('button').forEach((el) => el.classList.remove('is-active'));
        button.classList.add('is-active');
      });

      control.appendChild(button);
    });

    wrap.append(title, control);
    return wrap;
  };

  const render = () => {
    if (!panel) return;

    const content = panel.querySelector('.mc-debug-content');
    if (!content) return;

    content.innerHTML = '';
    content.appendChild(motionControl());

    let rendered = false;
    let sectionCount = 0;
    schemas.forEach((schema) => {
      const instances =
        typeof schema.instances === 'function' ? (schema.instances() || []).filter(Boolean) : [];

      const hasStats = Array.isArray(schema.stats) && schema.stats.length;
      if (!instances.length && !hasStats) return;

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
          <path d="M75.0347 71L70.1372 66.7991C68.5397 65.4288 66.5009 64.675 64.3919 64.675H3.66905L9.78491 62.544C11.7729 61.8513 13.4453 60.472 14.4984 58.6566L44.7876 6.44199L43.638 12.7097C43.2632 14.7533 43.6304 16.863 44.674 18.662L75.0347 71ZM41.1864 0L0 71H82.3729L41.1864 0Z" fill="#00FFFF"/>
          <path d="M41.1864 50.5709C43.1753 50.5709 44.7876 48.9662 44.7876 46.9868C44.7876 45.0073 43.1753 43.4026 41.1864 43.4026C39.1976 43.4026 37.5853 45.0073 37.5853 46.9868C37.5853 48.9662 39.1976 50.5709 41.1864 50.5709Z" fill="#00FFFF"/>
          <path d="M41.1864 58.2798C30.0578 58.2798 23.6153 48.9754 23.3464 48.5795L24.2635 46.8092L23.3464 45.039C23.6153 44.6431 30.0578 35.3387 41.1864 35.3387C52.3151 35.3387 58.7576 44.6431 59.0264 45.039L58.1094 46.8092L59.0264 48.5795C58.7576 48.9754 52.3151 58.2798 41.1864 58.2798ZM24.2635 46.8097C26.2639 48.8589 36.0107 51.9549 41.1864 51.9549C46.3594 51.9549 56.1057 48.8618 58.1094 46.8092C56.1057 44.7567 46.3594 41.6636 41.1864 41.6636C36.0131 41.6636 26.2669 44.7571 24.2635 46.8097Z" fill="white"/>
        </svg>
      </div>
      <div class="mc-debug-content"></div>
    `;

    panel.style.display = 'none';
    document.body.appendChild(panel);
  };

  const open = () => {
    createPanel();
    isOpen = true;
    if (panel) {
      panel.style.display = 'block';
    }
    render();
  };

  const close = () => {
    if (!panel) return;
    isOpen = false;
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
    if (isOpen) render();
  };

  const unregister = (id: string) => {
    schemas.delete(id);
    if (isOpen) render();
  };

  const refresh = () => {
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

  const queued = Array.isArray(mc.__debugQueue) ? mc.__debugQueue.splice(0) : [];

  mc.debug = {
    register,
    unregister,
    refresh,
    render,
    toggle,
    open,
    close,
  };

  queued.forEach(register);

  // eslint-disable-next-line no-console
  console.log('[MC Debug] Generic debugger ready — press D');
};
