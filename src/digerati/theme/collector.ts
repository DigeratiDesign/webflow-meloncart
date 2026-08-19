import { createLogger } from '../core/logger';
import type { ColorThemesAPI, ColorThemeValues } from '../core/types';

const DEBUG = false;
const logger = createLogger('digerati', 'theme', {
  debug: () => DEBUG,
});

const STORAGE_KEYS = {
  THEMES: 'colorThemes_data_v3',
  PUBLISH_DATE: 'colorThemes_publishDate_v3',
} as const;

const CLASS_PREFIXES = {
  feature: 'ui-theme_feature_',
  cta: 'ui-theme_cta_',
  icon: 'ui-theme_icon_',
} as const;

const log = (...args: unknown[]): void => {
  logger.debug(...args);
};

const warn = (...args: unknown[]): void => {
  logger.warn(...args);
};

const error = (...args: unknown[]): void => {
  logger.error(...args);
};

const createColorThemesAPI = (): ColorThemesAPI => ({
  themes: {},
  ctaThemes: {},
  iconThemes: {},
  getTheme(featureName = '', ctaName = '', iconName = ''): ColorThemeValues {
    const result: ColorThemeValues = {};

    if (featureName) {
      const featureTheme = this.themes[featureName];

      if (!featureTheme) {
        warn(`Feature theme "${featureName}" not found`, Object.keys(this.themes));
      } else {
        Object.assign(result, featureTheme);
      }
    }

    if (ctaName) {
      const ctaTheme = this.ctaThemes[ctaName];

      if (!ctaTheme) {
        warn(`CTA theme "${ctaName}" not found`, Object.keys(this.ctaThemes));
      } else {
        Object.assign(result, ctaTheme);
      }
    }

    if (iconName) {
      const iconTheme = this.iconThemes[iconName];

      if (!iconTheme) {
        warn(`Icon theme "${iconName}" not found`, Object.keys(this.iconThemes));
      } else {
        Object.assign(result, iconTheme);
      }
    }

    log('getTheme()', {
      featureName,
      ctaName,
      iconName,
      result,
    });

    return result;
  },
});

const ensureColorThemes = (): ColorThemesAPI => {
  window.colorThemes ||= createColorThemesAPI();

  return window.colorThemes;
};

const getPublishDate = (): number | null => {
  try {
    const htmlComment = document.documentElement.previousSibling;

    if (!htmlComment || htmlComment.nodeType !== Node.COMMENT_NODE) {
      return null;
    }

    const match = htmlComment.textContent?.match(/Last Published: (.+?) GMT/);

    if (!match) {
      return null;
    }

    return new Date(match[1]).getTime();
  } catch (err) {
    warn('Could not determine Webflow publish date:', err);

    return null;
  }
};

type StoredThemeData = {
  themes?: Record<string, ColorThemeValues>;
  ctaThemes?: Record<string, ColorThemeValues>;
  iconThemes?: Record<string, ColorThemeValues>;
};

const loadFromStorage = (): StoredThemeData | null => {
  try {
    const storedPublishDate = localStorage.getItem(STORAGE_KEYS.PUBLISH_DATE);
    const currentPublishDate = getPublishDate();

    if (
      !currentPublishDate ||
      !storedPublishDate ||
      storedPublishDate !== currentPublishDate.toString()
    ) {
      log('No valid cached theme data');

      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.THEMES);

    if (!raw) {
      return null;
    }

    const data = JSON.parse(raw) as StoredThemeData;

    log('Loaded theme data from cache:', data);

    return data;
  } catch (err) {
    warn('Failed to load theme cache:', err);

    return null;
  }
};

const saveToStorage = (): void => {
  try {
    const publishDate = getPublishDate();

    if (!publishDate) {
      warn('Publish date unavailable — theme cache skipped');

      return;
    }

    const colorThemes = ensureColorThemes();
    const data: StoredThemeData = {
      themes: colorThemes.themes,
      ctaThemes: colorThemes.ctaThemes,
      iconThemes: colorThemes.iconThemes,
    };

    localStorage.setItem(STORAGE_KEYS.PUBLISH_DATE, publishDate.toString());
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(data));

    log('Theme data cached');
  } catch (err) {
    warn('Failed to cache themes:', err);
  }
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getRuleBlock = (cssText: string, className: string): string => {
  const escaped = escapeRegExp(className);
  const regex = new RegExp(`\\.${escaped}\\{([^}]*)\\}`, 'g');
  const match = regex.exec(cssText);

  return match ? match[1] : '';
};

const getVariableNames = (cssText: string, className: string): string[] => {
  const block = getRuleBlock(cssText, className);

  if (!block) {
    warn(`No CSS rule found for .${className}`);

    return [];
  }

  const variables: string[] = [];
  const regex = /(--[^:;{}]+)\s*:/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(block)) !== null) {
    const variable = match[1].trim();

    if (variable.includes('\\<deleted\\|')) {
      continue;
    }

    variables.push(variable);
  }

  return [...new Set(variables)];
};

const resolveMode = (
  className: string,
  variableNames: string[],
  probe: HTMLDivElement
): ColorThemeValues => {
  probe.className = className;

  const computed = getComputedStyle(probe);
  const values: ColorThemeValues = {};

  variableNames.forEach((variable) => {
    const value = computed.getPropertyValue(variable).trim();

    if (value) {
      values[variable] = value;
    }
  });

  log(`Resolved .${className}:`, values);

  return values;
};

const discoverClasses = (cssText: string, prefix: string): string[] => {
  const escaped = escapeRegExp(prefix);
  const regex = new RegExp(`\\.${escaped}[\\w-]+`, 'g');
  const matches = cssText.match(regex) || [];

  return [...new Set(matches.map((value) => value.replace('.', '')))];
};

type CollectThemeFamilyOptions = {
  cssText: string;
  classes: string[];
  prefix: string;
  destination: Record<string, ColorThemeValues>;
  label: string;
  probe: HTMLDivElement;
};

const collectThemeFamily = ({
  cssText,
  classes,
  prefix,
  destination,
  label,
  probe,
}: CollectThemeFamilyOptions): void => {
  classes.forEach((className) => {
    const themeName = className.replace(prefix, '');
    const variableNames = getVariableNames(cssText, className);

    if (!variableNames.length) {
      log(`Skipping ${label} "${themeName}" — no custom properties`);

      return;
    }

    log(`${label} "${themeName}" variables:`, variableNames);
    destination[themeName] = resolveMode(className, variableNames, probe);
  });
};

const ready = (): void => {
  const colorThemes = ensureColorThemes();

  log('Feature themes:', colorThemes.themes);
  log('CTA themes:', colorThemes.ctaThemes);
  log('Icon themes:', colorThemes.iconThemes);
  log('Dispatching colorThemesReady');

  document.dispatchEvent(new CustomEvent('colorThemesReady'));
};

const collectColorThemes = (): void => {
  const colorThemes = ensureColorThemes();

  log('Theme Collector starting');

  const cached = loadFromStorage();

  if (cached) {
    colorThemes.themes = cached.themes || {};
    colorThemes.ctaThemes = cached.ctaThemes || {};
    colorThemes.iconThemes = cached.iconThemes || {};

    ready();

    return;
  }

  const stylesheet =
    Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).find((link) =>
      link.href.includes('webflow')
    ) || document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]');

  if (!stylesheet?.href) {
    error('Could not find Webflow stylesheet');

    return;
  }

  log('Fetching stylesheet:', stylesheet.href);

  void fetch(stylesheet.href)
    .then((response) => {
      log('Stylesheet response:', response.status);

      if (!response.ok) {
        throw new Error(`Stylesheet fetch failed: ${response.status}`);
      }

      return response.text();
    })
    .then((cssText) => {
      log('Stylesheet loaded:', `${cssText.length} chars`);

      const featureClasses = discoverClasses(cssText, CLASS_PREFIXES.feature);
      const ctaClasses = discoverClasses(cssText, CLASS_PREFIXES.cta);
      const iconClasses = discoverClasses(cssText, CLASS_PREFIXES.icon);

      log('Feature mode classes:', featureClasses);
      log('CTA mode classes:', ctaClasses);
      log('Icon mode classes:', iconClasses);

      const probe = document.createElement('div');
      probe.setAttribute('aria-hidden', 'true');

      Object.assign(probe.style, {
        position: 'fixed',
        width: '0',
        height: '0',
        overflow: 'hidden',
        visibility: 'hidden',
        pointerEvents: 'none',
        top: '-9999px',
        left: '-9999px',
      });

      document.body.appendChild(probe);

      collectThemeFamily({
        cssText,
        classes: featureClasses,
        prefix: CLASS_PREFIXES.feature,
        destination: colorThemes.themes,
        label: 'Feature mode',
        probe,
      });

      collectThemeFamily({
        cssText,
        classes: ctaClasses,
        prefix: CLASS_PREFIXES.cta,
        destination: colorThemes.ctaThemes,
        label: 'CTA mode',
        probe,
      });

      collectThemeFamily({
        cssText,
        classes: iconClasses,
        prefix: CLASS_PREFIXES.icon,
        destination: colorThemes.iconThemes,
        label: 'Icon mode',
        probe,
      });

      probe.remove();

      saveToStorage();
      ready();
    })
    .catch((err: unknown) => {
      error('Theme Collector failed:', err);
    });
};

export const initThemeCollector = (): void => {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', collectColorThemes, { once: true });

    return;
  }

  collectColorThemes();
};
