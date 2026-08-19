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
      padding:16px;color:#fff;background:#2a2722;
      border:1px solid rgba(255,255,255,.16);border-radius:12px;
      box-shadow:0 20px 60px rgba(0,0,0,.45);
      font:12px/1.4 'Poppins',Arial,Helvetica,sans-serif;
      -webkit-font-smoothing:antialiased
    }
    #mc-debug-panel *{box-sizing:border-box}
    .mc-debug-brand{display:flex;align-items:center;margin:-16px -16px 20px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.12)}
    .mc-debug-logo{display:block;width:172px;max-width:100%;height:auto}
    .mc-debug-global{margin-bottom:20px;padding:0 0 20px;border-bottom:1px solid rgba(255,255,255,.12)}
    .mc-debug-global-title,.mc-debug-group-title{margin-bottom:9px;color:#00ffff;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
    .mc-debug-motion{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;background:rgba(255,255,255,.055);border-radius:7px}
    .mc-debug-motion button{appearance:none;border:0;border-radius:5px;padding:7px 6px;background:transparent;color:rgba(255,255,255,.55);font:10px/1 'Poppins',Arial,Helvetica,sans-serif;cursor:pointer}
    .mc-debug-motion button:hover{color:#fff;background:rgba(255,255,255,.06)}
    .mc-debug-motion button.is-active{color:#2a2722;background:#00ffff;font-weight:700}
    .mc-debug-group{margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12)}
    .mc-debug-group:first-of-type{margin-top:0}
    .mc-debug-group-title{margin-bottom:14px}
    .mc-debug-section+.mc-debug-section{margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08)}
    .mc-debug-title{margin-bottom:14px;color:rgba(255,255,255,.9);font-weight:700}
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
    total: number
  ) => {
    const section = document.createElement('div');
    section.className = 'mc-debug-section';

    if (schema.instanceLabel !== false) {
      const title = document.createElement('div');
      title.className = 'mc-debug-title';

      if (typeof schema.instanceLabel === 'function') {
        title.textContent = schema.instanceLabel(instance, index, total);
      } else {
        const base = schema.instanceLabel || 'Instance';
        title.textContent = total > 1 ? `${base} ${index + 1}` : base;
      }

      section.appendChild(title);
    }

    (schema.controls || []).forEach((control) => {
      let element: HTMLElement | null = null;

      if (control.type === 'range') {
        element = createRange(instance, schema, control);
      } else if (control.type === 'button') {
        element = createButton(instance, control);
      }

      if (element) section.appendChild(element);
    });

    return section;
  };

  const renderSchema = (content: Element, schema: MCDebugSchema) => {
    const instances =
      typeof schema.instances === 'function' ? (schema.instances() || []).filter(Boolean) : [];

    const hasStats = Array.isArray(schema.stats) && schema.stats.length;
    if (!instances.length && !hasStats) return false;

    const group = document.createElement('div');
    group.className = 'mc-debug-group';

    const title = document.createElement('div');
    title.className = 'mc-debug-group-title';
    title.textContent = schema.label || schema.id;
    group.appendChild(title);

    const stats = createStats(schema);
    if (stats) group.appendChild(stats);

    instances.forEach((instance, index) => {
      group.appendChild(createSection(instance, schema, index, instances.length));
    });

    content.appendChild(group);
    return true;
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
    schemas.forEach((schema) => {
      rendered = renderSchema(content, schema) || rendered;
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
        <svg class="mc-debug-logo" viewBox="0 0 258 71" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Digerati">
          <path d="M247.18 34.3362V59.389H241.049V34.3362H247.18Z" fill="#00FFFF"/>
          <path d="M237.972 34.3362V39.2253H231.302V59.389H225.171V39.2253H218.501V34.3362H237.972Z" fill="#00FFFF"/>
          <path d="M213.578 54.9637H204.184L202.678 59.389H196.259L205.367 34.3362H212.467L221.574 59.389H215.084L213.578 54.9637ZM211.992 50.2759L208.881 41.0811L205.797 50.2759" fill="#00FFFF"/>
          <path d="M188.953 56.228L183.786 45.6134V59.389H177.655V34.3362H187.946C189.93 34.3362 191.615 34.6811 193.001 35.3711C194.412 36.0611 195.464 37.0127 196.157 38.2261C196.85 39.4157 197.197 40.748 197.197 42.2231C197.197 43.8886 196.719 45.3755 195.762 46.6841C194.83 47.9926 193.444 48.9205 191.603 49.4677L197.412 59.389H194.021C191.862 59.389 189.894 58.1612 188.953 56.228ZM183.786 45.6134H187.587C188.711 45.6134 189.548 45.3399 190.097 44.7926C190.671 44.2454 190.958 43.4722 190.958 42.4729C190.958 41.5213 190.671 40.7718 190.097 40.2246C189.548 39.6774 188.711 39.4038 187.587 39.4038H183.786V45.6134Z" fill="#00FFFF"/>
          <path d="M164.387 39.2253V44.293H172.598V49.0038H164.387V54.4998H173.674V59.389H158.256V34.3362H173.674V39.2253H164.387Z" fill="#00FFFF"/>
          <path d="M147.652 42.259C147.198 41.4263 146.541 40.7958 145.68 40.3675C144.843 39.9155 143.851 39.6895 142.704 39.6895C140.72 39.6895 139.13 40.3438 137.935 41.6523C136.74 42.937 136.142 44.662 136.142 46.8269C136.142 49.1348 136.763 50.943 138.006 52.2516C139.274 53.5363 141.006 54.1787 143.206 54.1787C144.712 54.1787 145.979 53.798 147.007 53.0366C148.059 52.2754 148.823 51.1809 149.302 49.7534H146.038C143.543 49.7534 141.521 47.7402 141.521 45.2568L154.859 45.2568V50.9311C154.405 52.4538 153.628 53.8694 152.529 55.1779C151.453 56.4865 150.078 57.5452 148.405 58.3542C146.732 59.163 144.843 59.5676 142.74 59.5676C140.253 59.5676 138.031 59.0322 136.07 57.9616C134.134 56.8671 132.616 55.3563 131.516 53.4292C130.441 51.5022 129.903 49.3014 129.903 46.8269C129.903 44.3526 130.441 42.1519 131.516 40.2248C132.616 38.2739 134.134 36.7631 136.07 35.6924C138.006 34.598 140.218 34.0508 142.704 34.0508C145.716 34.0508 148.25 34.7765 150.306 36.2278C152.385 37.6791 153.76 39.6895 154.429 42.259H147.652Z" fill="#00FFFF"/>
          <path d="M126.499 34.3362V59.389H120.368V34.3362H126.499Z" fill="#00FFFF"/>
          <path d="M103.746 34.3362C106.399 34.3362 108.718 34.8596 110.702 35.9064C112.686 36.9532 114.216 38.4284 115.292 40.3317C116.391 42.2112 116.941 44.3882 116.941 46.8625C116.941 49.3131 116.391 51.49 115.292 53.3933C114.216 55.2968 112.674 56.7719 110.666 57.8186C108.682 58.8655 106.375 59.389 103.746 59.389H94.3152V34.3362H103.746ZM103.351 54.1072C105.67 54.1072 107.475 53.4766 108.766 52.2157C110.056 50.9548 110.702 49.1704 110.702 46.8625C110.702 44.5547 110.056 42.7584 108.766 41.4737C107.475 40.1889 105.67 39.5465 103.351 39.5465H100.447V54.1072H103.351Z" fill="#00FFFF"/>
          <path d="M254.399 59.6007C256.388 59.6007 258 57.996 258 56.0165C258 54.0371 256.388 52.4324 254.399 52.4324C252.41 52.4324 250.798 54.0371 250.798 56.0165C250.798 57.996 252.41 59.6007 254.399 59.6007Z" fill="white"/>
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
