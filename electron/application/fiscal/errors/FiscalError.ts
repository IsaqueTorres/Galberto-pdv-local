import type { FiscalErrorCategory } from '../types/fiscal.types';

type FiscalErrorInput = {
  code: string;
  message: string;
  category: FiscalErrorCategory;
  retryable?: boolean;
  details?: unknown;
  cause?: unknown;
};

export class FiscalError extends Error {
  readonly code: string;
  readonly category: FiscalErrorCategory;
  readonly retryable: boolean;
  readonly details?: unknown;

  constructor(input: FiscalErrorInput) {
    super(input.message);
    this.name = 'FiscalError';
    this.code = input.code;
    this.category = input.category;
    this.retryable = input.retryable ?? false;
    this.details = input.details;
    if (input.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = input.cause;
    }
  }
}

export function normalizeFiscalError(error: unknown, fallbackCode = 'FISCAL_INTERNAL_ERROR'): FiscalError {
  if (error instanceof FiscalError) {
    return error;
  }

  if (error instanceof Error) {
    return new FiscalError({
      code: fallbackCode,
      message: error.message,
      category: 'INTERNAL',
      retryable: false,
      cause: error,
    });
  }

  return new FiscalError({
    code: fallbackCode,
    message: 'Erro interno na camada fiscal.',
    category: 'INTERNAL',
    retryable: false,
    details: error,
  });
}

