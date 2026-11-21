import { describe, expect, it } from 'vitest';
import { kiotaError } from '~/tests/helpers/apiErrors';
import { isApiError, isValidationProblem, toProblemDetails } from './problemDetails';

describe('problemDetails', () => {
  describe('isApiError', () => {
    it('should recognise an error that carries a responseStatusCode', () => {
      expect(isApiError(kiotaError(502))).toBe(true);
      expect(isApiError(Object.assign(new Error('unmapped'), { responseStatusCode: 418 }))).toBe(true);
    });

    it.each([
      ['a plain Error', new Error('boom')],
      ['a TypeError', new TypeError('Failed to fetch')],
      ['a string', 'boom'],
      ['undefined', undefined],
      ['null', null],
      ['a status-like body without responseStatusCode', { status: 500 }],
    ])('should not treat %s as an api error', (_, error) => {
      expect(isApiError(error)).toBe(false);
    });
  });

  describe('isValidationProblem', () => {
    it('should detect a validation problem by its errors or errorDetails', () => {
      expect(isValidationProblem({ errors: { url: ['urlRequired'] } })).toBe(true);
      expect(isValidationProblem({ errorDetails: [{ code: 'urlRequired' }] })).toBe(true);
    });

    it('should not detect a plain problem or a missing problem as a validation problem', () => {
      expect(isValidationProblem({ status: 500 })).toBe(false);
      expect(isValidationProblem(undefined)).toBe(false);
    });
  });

  describe('toProblemDetails', () => {
    it('should return undefined when the failure never reached the api', () => {
      expect(toProblemDetails(new TypeError('Failed to fetch'))).toBeUndefined();
      expect(toProblemDetails(new DOMException('aborted', 'AbortError'))).toBeUndefined();
      expect(toProblemDetails(undefined)).toBeUndefined();
    });

    it('should read the status from responseStatusCode and not from the body', () => {
      const problem = toProblemDetails({ ...kiotaError(502), status: 200 });

      expect(problem?.status).toBe(502);
    });

    it('should read extensions from additionalData', () => {
      const problem = toProblemDetails(kiotaError(409, {
        title: 'Conflict',
        code: 'orderShipped',
        placeholders: { orderId: '12' },
        errorDetails: [{ code: 'rowInvalid', field: 'rows.1', placeholders: { row: '1' } }],
      }));

      expect(problem).toEqual(expect.objectContaining({
        status: 409,
        title: 'Conflict',
        code: 'orderShipped',
        placeholders: { orderId: '12' },
        errorDetails: [{ code: 'rowInvalid', field: 'rows.1', placeholders: { row: '1' } }],
      }));
    });

    it('should normalise a Kiota validation error whose errors sit in additionalData', () => {
      const problem = toProblemDetails(kiotaError(400, {
        errors: { url: ['urlRequired', 'urlInvalid'] },
      }));

      expect(problem?.errors).toEqual({ url: ['urlRequired', 'urlInvalid'] });
    });

    it('should ignore field error values that are not code lists', () => {
      const problem = toProblemDetails({
        responseStatusCode: 400,
        errors: { additionalData: { url: 'urlRequired', other: [1, 'urlInvalid'] } },
      });

      expect(problem?.errors).toEqual({ url: [], other: ['urlInvalid'] });
    });

    it('should leave out what the response does not carry', () => {
      const problem = toProblemDetails(kiotaError(500));

      expect(problem).toEqual({
        status: 500,
        title: undefined,
        code: undefined,
        placeholders: undefined,
        errors: undefined,
        errorDetails: undefined,
      });
    });
  });
});
