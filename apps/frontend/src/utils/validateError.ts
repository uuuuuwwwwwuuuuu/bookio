import { parseError } from './parseError';

type ApiErrorBody = {
    success: false;
    error: string | import('zod').ZodError;
};

type ApiSuccessBody = {
    success: true;
    data: unknown;
};

const hasFailedSuccess = (body: unknown): body is ApiErrorBody => {
    return (
        typeof body === 'object' &&
        body !== null &&
        'success' in body &&
        !(body as { success: boolean }).success
    );
};

export function validateError<TBody>(
    response: Response,
    body: TBody,
    fallbackMessage: string,
): asserts body is Extract<TBody, ApiSuccessBody> {
    if (!response.ok && !hasFailedSuccess(body)) {
        throw new Error(fallbackMessage);
    }

    if (hasFailedSuccess(body)) {
        throw new Error(parseError(body));
    }
}
