/* eslint-disable no-console */
type LoggerDomain = 'digerati' | 'melon';
type DebugGate = boolean | (() => boolean);

type LoggerOptions = {
  debug?: DebugGate;
};

export const isMCDebugEnabled = (): boolean => {
  return true;
};

const resolveDebug = (debug: DebugGate | undefined): boolean => {
  if (typeof debug === 'function') {
    return debug();
  }

  return debug ?? false;
};

const DOMAIN_PREFIX: Record<LoggerDomain, string> = {
  digerati: '👁',
  melon: '🍈',
};

export const createLogger = (
  domain: LoggerDomain,
  channel: string,
  options: LoggerOptions = {}
) => {
  const prefix = `[${DOMAIN_PREFIX[domain]}:${channel}]`;

  return {
    debug: (...args: unknown[]) => {
      if (resolveDebug(options.debug)) {
        console.log(prefix, ...args);
      }
    },
    info: (...args: unknown[]) => {
      if (resolveDebug(options.debug)) {
        console.info(prefix, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      console.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(prefix, ...args);
    },
  };
};
