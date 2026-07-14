export const trimObj = <T>(value: T): T => {
    if (typeof value === 'string') {
        return value.trim() as T;
    }

    if (Array.isArray(value)) {
        return value.map((item) => trimObj(item)) as T;
    }

    if (typeof value === 'object' && value !== null) {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [key, trimObj(nestedValue)]),
        ) as T;
    }

    return value;
};
