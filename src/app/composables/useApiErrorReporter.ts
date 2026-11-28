import type { MessageDetail, MessageOptions } from '~/composables/useMessageStore';
import type { ProblemDetails, ValidationProblemDetails } from '~/types/problemDetails';
import { useI18n } from 'vue-i18n';
import { useMessageStore } from '~/composables/useMessageStore';
import { isValidationProblem, toProblemDetails } from '~/types/problemDetails';

/** A failing or unreachable dependency: the visitor can try again later. */
const unavailableStatuses = new Set([502, 503]);

export interface ApiErrorReporterOptions {
  /**
   * Short, translated name of the operation ("loading the page likes").
   * Wrapped around the derived message so an error names the call it came
   * from; without it, two failing requests on one page are indistinguishable.
   * An explicit `errorMessage` takes precedence and is not wrapped.
   */
  friendlyName?: string
  /**
   * Replaces the translated message for non-validation failures. A function
   * receives the parsed problem details, so the message can still use the code
   * or placeholders.
   */
  errorMessage?: string | ((problem?: ProblemDetails) => string)
  /**
   * By default a 404 resolves as "no result" (outcome `notFound`) instead of
   * being reported, so callers can render an empty state. Set this when a
   * missing resource is a genuine error for this call.
   */
  notFoundIsError?: boolean
  /**
   * Called on a 401 instead of reporting; typically starts the login redirect.
   * When omitted, a 401 is reported like any other failure.
   */
  onUnauthorized?: () => void
  /** Collapse every error reported through this instance into one grouped bar. */
  group?: string
  /** The heading of the grouped bar; pass a translated string. */
  groupMessage?: string
  /**
   * Set to false to keep failures out of the message store, for calls that
   * handle errors themselves (via `onError`, which still receives the translated
   * description and field errors) or want no visible reporting at all.
   * Classification is unaffected: a 404 still resolves as `notFound` and a 401
   * still triggers `onUnauthorized`.
   */
  reportErrors?: boolean
}

export type ApiErrorOutcome
  = | { status: 'redirected' }
    | { status: 'notFound' }
    | {
      status: 'error'
      description: string
      /** Per-field translated messages, when the failure was a validation problem. */
      validationErrors?: MessageDetail[]
    };

/**
 * Turns an exception thrown by a Kiota-generated client into user-facing
 * messages: the error code is translated (`errors.${code}`) with its placeholders
 * interpolated, and field-scoped batch failures become one line per field with
 * every message for that field listed under it.
 *
 * A 502 or 503 is the backend's way of saying a dependency is down. Those bodies
 * carry no code, so the status alone selects the "unavailable" message. Any other
 * failure without a code, including one that never reached the API, falls back to
 * the generic "unexpected" message. Identical errors reported twice show once.
 */
export function useApiErrorReporter(options: ApiErrorReporterOptions = {}) {
  const { t } = useI18n();
  const { addError, addExtendedError, addSuccess, clear } = useMessageStore();

  const translate = (code: string | undefined, placeholders?: Record<string, string>) =>
    code ? t(`errors.${code}`, placeholders ?? {}) : t('errors.unexpected');

  const deriveMessage = (problem?: ValidationProblemDetails) => {
    if (problem?.status !== undefined && unavailableStatuses.has(problem.status))
      return t('errors.unavailable');
    if (!problem?.code && isValidationProblem(problem))
      return t('errors.validation');
    return translate(problem?.code, problem?.placeholders);
  };

  const describe = (problem?: ValidationProblemDetails) => {
    if (typeof options.errorMessage === 'function')
      return options.errorMessage(problem);
    if (options.errorMessage)
      return options.errorMessage;

    const message = deriveMessage(problem);
    return options.friendlyName
      ? t('errors.whileCalling', { name: options.friendlyName, message })
      : message;
  };

  /**
   * One line per field; a field that failed multiple times gets all its
   * messages, which is how a batch result surfaces in the UI. Prefers
   * `errorDetails` (it carries placeholders) and falls back to the plain
   * `errors` dictionary for model-validation responses.
   */
  const toFieldErrors = (problem: ValidationProblemDetails): MessageDetail[] => {
    const byField = new Map<string, string[]>();
    const add = (field: string, message: string) => {
      const existing = byField.get(field) ?? [];
      byField.set(field, [...existing, message]);
    };

    if (problem.errorDetails?.length) {
      for (const detail of problem.errorDetails)
        add(detail.field ?? '', translate(detail.code, detail.placeholders));
    }
    else {
      for (const [field, codes] of Object.entries(problem.errors ?? {})) {
        for (const code of codes)
          add(field, translate(code));
      }
    }

    return Array.from(byField, ([field, values]) => ({
      label: field || undefined,
      values,
    }));
  };

  const messageOptions = (): MessageOptions => ({
    addOnce: true,
    ...(options.group ? { group: options.group, groupMessage: options.groupMessage } : {}),
  });

  const reportError = async (error: unknown): Promise<ApiErrorOutcome> => {
    const problem = toProblemDetails(error);

    if (problem?.status === 401 && options.onUnauthorized) {
      options.onUnauthorized();
      return { status: 'redirected' };
    }

    if (problem?.status === 404 && !options.notFoundIsError)
      return { status: 'notFound' };

    const description = describe(problem);

    if (isValidationProblem(problem)) {
      const validationErrors = toFieldErrors(problem);
      if (options.reportErrors !== false)
        await addExtendedError(description, validationErrors, messageOptions());
      return { status: 'error', description, validationErrors };
    }

    if (options.reportErrors !== false)
      await addError(description, messageOptions());
    return { status: 'error', description };
  };

  const reportSuccess = (description: string, successOptions?: MessageOptions) =>
    addSuccess(description, successOptions);

  return {
    reportError,
    reportSuccess,
    /** Removes every message this instance added (bound to the owning component). */
    clear,
  };
}
