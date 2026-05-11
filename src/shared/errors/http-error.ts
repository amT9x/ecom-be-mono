import { BaseError } from './base-error.js';
import { ERROR_CODES } from './error-codes.js';

export class NotFoundError extends BaseError {
  constructor(message = 'Resource not found') {
    super(message, 404, ERROR_CODES.NOT_FOUND);
  }
}

export class ValidationError extends BaseError {
  constructor(message = 'Bad request') {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR);
  }
}
