/* eslint-disable no-console */
const DEBUG = true;

const SELECTORS = {
  scope: 'form[mc-prefill="True"], [mc-prefill="True"] form',
  prefillField: 'input, select, textarea',
  editButton: '[mc-billing-form="edit"]',
} as const;

type PrefillField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const debug = (...args: unknown[]): void => {
  if (!DEBUG) return;
  console.log('[MC Prefill]', ...args);
};

const debugWarn = (...args: unknown[]): void => {
  if (!DEBUG) return;
  console.warn('[MC Prefill]', ...args);
};

const isReadOnlySupported = (
  field: PrefillField
): field is HTMLInputElement | HTMLTextAreaElement =>
  field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement;

const setFieldLocked = (field: PrefillField, locked: boolean): void => {
  if (isReadOnlySupported(field)) {
    field.readOnly = locked;
    field.toggleAttribute('data-mc-prefill-readonly', locked);
    return;
  }

  if (field instanceof HTMLSelectElement) {
    field.disabled = locked;
  }
};

const getEditableFields = (root: ParentNode): PrefillField[] =>
  Array.from(root.querySelectorAll<PrefillField>(SELECTORS.prefillField)).filter((field) => {
    if (field instanceof HTMLInputElement) {
      return field.type !== 'hidden' && field.type !== 'submit' && field.type !== 'button';
    }

    return true;
  });

const setEditableState = (scope: ParentNode, locked: boolean): void => {
  const fields = getEditableFields(scope);

  debug('Updating editable state:', {
    scope,
    locked,
    fieldCount: fields.length,
    fields,
  });

  fields.forEach((field) => {
    setFieldLocked(field, locked);
  });
};

const getPrefillValue = (field: PrefillField): string | null => {
  const valueFromDedicatedAttribute = field.getAttribute('mc-prefill-value');

  if (valueFromDedicatedAttribute !== null) {
    return valueFromDedicatedAttribute;
  }

  const legacyValue = field.getAttribute('mc-prefill');

  if (legacyValue !== null && legacyValue !== 'True') {
    return legacyValue;
  }

  return null;
};

const initPrefillScope = (form: HTMLFormElement, index: number): void => {
  debug(`Initialising scope ${index + 1}`, form);

  const prefillFields = getEditableFields(form);

  prefillFields.forEach((field) => {
    const prefillValue = getPrefillValue(field);

    if (prefillValue === null) {
      return;
    }

    field.value = prefillValue;

    debug('Applied prefill:', {
      field,
      value: prefillValue,
    });
  });

  const editButtons = Array.from(form.querySelectorAll<HTMLElement>(SELECTORS.editButton));

  if (!editButtons.length) {
    debugWarn('No mc-billing-form="edit" buttons found in prefill scope:', form);
    return;
  }

  let isLocked = true;
  setEditableState(form, isLocked);
  editButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      isLocked = !isLocked;

      debug('Edit button clicked:', {
        button,
        isLocked,
        form,
      });

      setEditableState(form, isLocked);
    });
  });
};

const initPrefill = (): void => {
  debug('Script initialised');
  debug('Document readyState:', document.readyState);

  const forms = Array.from(document.querySelectorAll<HTMLFormElement>(SELECTORS.scope));

  debug('Prefill scopes found:', forms.length, forms);

  forms.forEach((form, index) => {
    initPrefillScope(form, index);
  });
};

export const initPrefillUtility = (): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrefill, { once: true });
    return;
  }

  initPrefill();
};
