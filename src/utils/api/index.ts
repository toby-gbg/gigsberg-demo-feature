import { ValidationError } from '@/interfaces/AttendeeDetails';
import { AppErrorKey, TAppErrorKey } from '@/utils/api/api-error-codes';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export const isAppErrorCode = (value: unknown): value is TAppErrorKey =>
    Object.values(AppErrorKey).some((code) => code === value);

export const isValidationErrorStatus = (errorKey?: TAppErrorKey, status?: number): boolean =>
    errorKey === AppErrorKey.VALIDATION_ERROR || status === 422;

export const isValidationError = (value: unknown): value is ValidationError =>
    isRecord(value) && typeof value.instancePath === 'string' && typeof value.message === 'string';
