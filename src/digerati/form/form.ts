import { createLogger } from '../core/logger';

const DEBUG = false;
const logger = createLogger('digerati', 'form', {
  debug: () => DEBUG,
});

const SELECTORS = {
  form: 'form',
  field: 'input[required], select[required], textarea[required], input[type="email"]',
  fieldWrapper: '[mc-form="field-wrapper"]',
} as const;

const CLASSES = {
  fieldError: 'has-error',
  errorMessage: 'form-field-error',
} as const;

const MESSAGES = {
  required: 'Please complete this field',
  fullName: 'Enter your full name',
  emailRequired: 'Enter your email address',
  emailInvalid: 'Enter a valid email address',
  streetAddress: 'Enter your street address',
  city: 'Enter your city',
  postalCode: 'Enter your postal / ZIP code',
  country: 'Select your country',
} as const;

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const debug = (...args: unknown[]): void => {
  logger.debug(...args);
};

const debugWarn = (...args: unknown[]): void => {
  logger.debug(...args);
};

const debugError = (...args: unknown[]): void => {
  logger.error(...args);
};

const getErrorElement = (field: FormField): HTMLDivElement | null => {
  const wrapper = field.closest<HTMLElement>(SELECTORS.fieldWrapper);

  if (!wrapper) {
    debugWarn('getErrorElement(): wrapper not found', field);
    return null;
  }

  const error = wrapper.querySelector<HTMLDivElement>(`.${CLASSES.errorMessage}`);

  debug('getErrorElement():', {
    field,
    wrapper,
    error,
  });

  return error;
};

const createErrorId = (field: FormField): string => {
  const base = field.id || field.name || `field-${Math.random().toString(36).slice(2, 8)}`;
  const id = `${base}-error`;

  debug('createErrorId():', {
    field,
    id,
  });

  return id;
};

const clearError = (field: FormField): void => {
  debug('clearError()', field);
  field.classList.remove(CLASSES.fieldError);
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');

  const error = getErrorElement(field);

  if (error) {
    debug('Removing error element:', error);
    error.remove();
  }
};

const showError = (field: FormField, message: string): void => {
  const wrapper = field.closest<HTMLElement>(SELECTORS.fieldWrapper);

  debug('showError()', {
    field,
    message,
    wrapper,
  });

  if (!wrapper) {
    debugError(
      'No field wrapper found for field:',
      field,
      `Expected ancestor matching ${SELECTORS.fieldWrapper}`
    );
    return;
  }

  field.classList.add(CLASSES.fieldError);
  field.setAttribute('aria-invalid', 'true');

  let error = getErrorElement(field);

  if (!error) {
    debug('Creating error element for:', field);
    error = document.createElement('div');
    error.classList.add(CLASSES.errorMessage);
    wrapper.appendChild(error);
  } else {
    debug('Reusing existing error element:', error);
  }

  if (!error.id) {
    error.id = createErrorId(field);
  }

  field.setAttribute('aria-describedby', error.id);
  error.textContent = message;

  debug('Error rendered:', {
    field,
    error,
    errorId: error.id,
    message,
  });
};

const getRequiredMessage = (field: FormField): string => {
  const type = (field.type || '').toLowerCase();
  const name = (field.name || '').toLowerCase();

  debug('getRequiredMessage()', {
    field,
    type,
    name,
  });

  if (type === 'email') {
    return MESSAGES.emailRequired;
  }

  if (field.tagName === 'SELECT') {
    return MESSAGES.country;
  }

  if (name.includes('name')) {
    return MESSAGES.fullName;
  }

  if (name.includes('street') || name.includes('address-line1')) {
    return MESSAGES.streetAddress;
  }

  if (name.includes('city')) {
    return MESSAGES.city;
  }

  if (name.includes('postal') || name.includes('postcode') || name.includes('zip')) {
    return MESSAGES.postalCode;
  }

  if (name.includes('country')) {
    return MESSAGES.country;
  }

  return MESSAGES.required;
};

const validateField = (field: FormField): boolean => {
  debug('validateField()', {
    field,
    name: field.name,
    type: field.type,
    value: field.value,
    required: field.required,
    disabled: field.disabled,
    willValidate: field.willValidate,
  });

  if (!field.willValidate) {
    debugWarn('Field will not validate:', field);
    clearError(field);
    return true;
  }

  const isValid = field.checkValidity();

  debug('checkValidity():', {
    field,
    name: field.name,
    isValid,
    validity: {
      valueMissing: field.validity.valueMissing,
      typeMismatch: field.validity.typeMismatch,
      patternMismatch: field.validity.patternMismatch,
      tooLong: field.validity.tooLong,
      tooShort: field.validity.tooShort,
      rangeUnderflow: field.validity.rangeUnderflow,
      rangeOverflow: field.validity.rangeOverflow,
      stepMismatch: field.validity.stepMismatch,
      badInput: field.validity.badInput,
      customError: field.validity.customError,
      valid: field.validity.valid,
    },
  });

  if (isValid) {
    debug('Field valid. Clearing error:', field);
    clearError(field);
    return true;
  }

  let message: string = MESSAGES.required;

  if (field.validity.valueMissing) {
    message = getRequiredMessage(field);
  } else if (field.type === 'email' && field.validity.typeMismatch) {
    message = MESSAGES.emailInvalid;
  }

  debugWarn('Field invalid:', {
    field,
    name: field.name,
    message,
  });

  showError(field, message);
  return false;
};

const initForms = (): void => {
  debug('Script initialised');
  debug('Document readyState:', document.readyState);

  const forms = document.querySelectorAll<HTMLFormElement>(SELECTORS.form);

  debug('Forms found:', forms.length, forms);

  forms.forEach((form, formIndex) => {
    debug(`Initialising form ${formIndex + 1}`, form);
    form.setAttribute('novalidate', '');

    const fields = Array.from(form.querySelectorAll<FormField>(SELECTORS.field));

    debug(`Form ${formIndex + 1}: matching fields found:`, fields.length, fields);

    fields.forEach((field, fieldIndex) => {
      debug(`Field ${fieldIndex + 1}`, {
        element: field,
        tagName: field.tagName,
        type: field.type,
        name: field.name,
        id: field.id,
        required: field.required,
        disabled: field.disabled,
        willValidate: field.willValidate,
        value: field.value,
        wrapper: field.closest(SELECTORS.fieldWrapper),
      });
    });

    form.addEventListener(
      'invalid',
      (event) => {
        debug('Native invalid event intercepted:', event.target);
        event.preventDefault();
      },
      true
    );

    fields.forEach((field) => {
      let hasBeenTouched = false;

      field.addEventListener('blur', () => {
        const hasValue = String(field.value || '').trim() !== '';

        debug('Blur:', {
          field,
          name: field.name,
          value: field.value,
          hasBeenTouched,
          hasValue,
        });

        if (hasBeenTouched || hasValue) {
          validateField(field);
        }

        hasBeenTouched = true;
      });

      field.addEventListener('input', () => {
        hasBeenTouched = true;

        debug('Input:', {
          field,
          name: field.name,
          value: field.value,
          hasError: field.classList.contains(CLASSES.fieldError),
        });

        if (field.classList.contains(CLASSES.fieldError)) {
          validateField(field);
        }
      });

      field.addEventListener('change', () => {
        hasBeenTouched = true;

        debug('Change:', {
          field,
          name: field.name,
          value: field.value,
          hasError: field.classList.contains(CLASSES.fieldError),
        });

        if (field.classList.contains(CLASSES.fieldError)) {
          validateField(field);
        }
      });
    });

    form.addEventListener(
      'submit',
      (event) => {
        debug('Submit captured:', form);

        let firstInvalidField: FormField | null = null;

        for (const field of fields) {
          debug('Checking field on submit:', {
            field,
            name: field.name,
            willValidate: field.willValidate,
            value: field.value,
          });

          if (!field.willValidate) {
            debugWarn('Skipping field because willValidate = false:', field);
            continue;
          }

          const isValid = validateField(field);

          debug('Submit validation result:', {
            field,
            name: field.name,
            isValid,
          });

          if (!isValid && !firstInvalidField) {
            firstInvalidField = field;
          }
        }

        if (firstInvalidField !== null) {
          const invalidField = firstInvalidField;

          debugWarn('Submission blocked. First invalid field:', invalidField);
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          invalidField.focus({
            preventScroll: true,
          });
          invalidField.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return false;
        }

        debug('Form valid. Allowing Webflow submission to continue.');
        return undefined;
      },
      true
    );
  });
};

export const initForm = (): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms, { once: true });
    return;
  }

  initForms();
};
