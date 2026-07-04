type AuthResponse<T> = {
    data: T | null;
    error: { message?: string } | null;
};

export async function unwrapAuthResponse<T>(
    promise: Promise<AuthResponse<T>>,
): Promise<T> {
    const response = await promise;

    if (response.error) {
        throw new Error(response.error.message ?? 'Request failed');
    }

    if (!response.data) {
        throw new Error('Request failed');
    }

    return response.data;
}
