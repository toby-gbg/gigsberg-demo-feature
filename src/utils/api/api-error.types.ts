import { TAppErrorKey } from './api-error-codes';

export interface ValidationErrorItem {
    keyword: string;
    instancePath: string;
    schemaPath: string;
    params: Record<string, unknown>;
    message: string;
}

export interface ApiValidationError {
    status: number;
    data: {
        statusCode: TAppErrorKey;
        error: string;
        message: string;
        validation: ValidationErrorItem[];
        stack?: string;
    };
}
