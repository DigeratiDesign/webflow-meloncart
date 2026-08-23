import { createLogger, isMCDebugEnabled } from '../../digerati/core/logger';

export interface AutoHideAccordionItemOptions {
  /** Selector for the clickable FAQ item. */
  itemSelector?: string;
  /** Selector for the answer wrapper whose height indicates open/closed. */
  wrapSelector?: string;
}

const logger = createLogger('melon', 'faq', {
  debug: isMCDebugEnabled,
});

export class AutoHideAccordionItem {
  private readonly items: HTMLElement[];
  private readonly itemSelector: string;
  private readonly wrapSelector: string;
  private readonly boundClick: EventListener;

  constructor(options: AutoHideAccordionItemOptions = {}) {
    this.itemSelector = options.itemSelector ?? '[mc-faq="question"]';
    this.wrapSelector = options.wrapSelector ?? '[mc-faq="answer"]';
    this.boundClick = (event) => this.handleClick(event as MouseEvent);
    this.items = [...document.querySelectorAll<HTMLElement>(this.itemSelector)];

    logger.debug('Found FAQ items.', {
      itemSelector: this.itemSelector,
      wrapSelector: this.wrapSelector,
      count: this.items.length,
      items: this.items,
    });

    if (!this.items.length) {
      logger.warn(`No FAQ items found for selector "${this.itemSelector}".`);
    }
  }

  private findAnswerWrap(trigger: HTMLElement): HTMLElement | undefined {
    let container: HTMLElement | null = trigger;

    while (container) {
      const wrap = container.querySelector<HTMLElement>(this.wrapSelector);

      if (wrap) return wrap;

      container = container.parentElement;
    }

    return undefined;
  }

  private handleClick(event: MouseEvent): void {
    // Ignore the synthetic clicks used to let Webflow close open siblings.
    if (!event.isTrusted) {
      logger.debug('Ignored synthetic FAQ click.', { currentTarget: event.currentTarget });
      return;
    }

    const clickedItem = event.currentTarget as HTMLElement;

    logger.debug('Trusted FAQ click received.', {
      clickedItem,
      siblingCount: this.items.length - 1,
    });

    this.items.forEach((item) => {
      if (item === clickedItem) return;

      const wrap = this.findAnswerWrap(item);

      if (!wrap) {
        logger.debug('Skipped sibling without a nearby answer wrapper.', {
          item,
          wrapSelector: this.wrapSelector,
        });
        return;
      }

      const { height } = window.getComputedStyle(wrap);

      logger.debug('Checked FAQ sibling state.', { item, wrap, height });

      if (height === '0px') return;

      // Preserve the existing Webflow IX2 close interaction and its animation.
      item.click();
      logger.debug('Triggered Webflow close click for FAQ sibling.', { item, wrap, height });
    });
  }

  public init(): void {
    this.items.forEach((item) => {
      // Run before Webflow's handler opens or closes the selected item.
      item.addEventListener('click', this.boundClick, true);
    });

    logger.debug('Initialized FAQ auto-hide listeners.', { count: this.items.length });
  }

  public destroy(): void {
    this.items.forEach((item) => {
      item.removeEventListener('click', this.boundClick, true);
    });

    logger.debug('Destroyed.');
  }
}

let instance: AutoHideAccordionItem | undefined;

export const initAutoHideAccordionItem = (
  options?: AutoHideAccordionItemOptions
): AutoHideAccordionItem => {
  if (instance) return instance;

  instance = new AutoHideAccordionItem(options);
  instance.init();
  return instance;
};
