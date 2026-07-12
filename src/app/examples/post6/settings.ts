import type { DynamicFormSettings } from '@bach.software/vue-dynamic-form';

/**
 * Our application-wide form settings: validation timing and error messages.
 * Defined once, used by every form.
 */
export const settings: DynamicFormSettings = {
  // No errors while filling in, live feedback after the first submit
  validateOnValueUpdate: false,
  validateOnValueUpdateAfterSubmit: true,
  messages: {
    required: '{field} is required',
    minOccurs: 'Add at least {min} item(s)',
    choiceMinOccurs: 'Fill in at least {min} of these options',
    minLength: '{field} must be at least {length} characters',
    maxLength: '{field} may not exceed {length} characters',
    pattern: 'This is not a valid {field}',
  },
};
