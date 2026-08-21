const DEFAULT_TIMEOUT = 2000;

/** Wait briefly for stable text metrics without allowing a font request to block a feature forever. */
export const waitForFonts = (timeout = DEFAULT_TIMEOUT): Promise<void> => {
  if (!document.fonts?.ready) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, timeout);

    void document.fonts.ready.finally(() => {
      window.clearTimeout(timer);
      resolve();
    });
  });
};
