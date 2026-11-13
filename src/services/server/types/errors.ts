/**
 * Custom API Error Classes
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public endpoint?: string,
        public response?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export function hasResponseStatusCode(response: unknown): response is { statusCode: string } {
    return (
        typeof response === 'object' &&
        response !== null &&
        'statusCode' in response &&
        typeof response.statusCode === 'string'
    );
}

export class NetworkError extends ApiError {
    constructor(message: string, endpoint?: string) {
        super(message, undefined, endpoint);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}

export class ValidationError extends ApiError {
    constructor(
        message: string,
        public validationErrors?: Record<string, string[]>
    ) {
        super(message, 422);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string, endpoint?: string) {
        super(message, 404, endpoint);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string = 'Forbidden', response?: unknown) {
        super(message, 403, undefined, response);
        this.name = 'ForbiddenError';
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

/**
 * Error handler utility
 */
export function handleApiError(error: unknown, endpoint?: string): never {
    if (error instanceof ApiError) {
        throw error;
    }

    if (error instanceof Error) {
        throw new ApiError(error.message, undefined, endpoint);
    }

    throw new ApiError('An unknown error occurred', undefined, endpoint);
}
