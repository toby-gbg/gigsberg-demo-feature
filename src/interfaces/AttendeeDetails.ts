import { TAppErrorKey } from '@/utils/api/api-error-codes';
import { AttendeeXS2Scope, SubmitXS2Condition } from '@/constants/attendee';

export type AttendeeFieldType = 'text' | 'date' | 'select';

export interface AttendeeField {
    field_name: string;
    field_type: AttendeeFieldType;
    allowed_values?: string[];
    required: boolean;
    validations?: string[];
}

export type AttendeeScope = `${AttendeeXS2Scope}`;
export type SubmitCondition = `${SubmitXS2Condition}`;

export interface EventGuestDataResponse {
    scope: AttendeeScope;
    condition: SubmitCondition;
    attendersData: AttendeeField[];
}

export type AttendeeFormValue = string | number | boolean | string[] | null;
export interface AttendeeDetailsSubmitRequest {
    condition: SubmitCondition;
    guests: Record<string, AttendeeFormValue>[];
}

export interface ValidationError {
    keyword: string;
    instancePath: string;
    schemaPath: string;
    params: Record<string, unknown>;
    message: string;
}

export interface AttendeeDetailsErrorResponse {
    statusCode: TAppErrorKey;
    error: string;
    message: string;
    validation: ValidationError[];
}
