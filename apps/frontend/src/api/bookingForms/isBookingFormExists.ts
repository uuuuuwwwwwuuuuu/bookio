import { useEffect, useState } from 'react';
import hono from '@lib/hono-client';
import { useDebounce } from 'use-debounce';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { parseError } from '@utils/parseError';

const isExistsClient = hono['booking-forms']['is-exists'];

export type IsBookingFormExistsRequest = InferRequestType<typeof isExistsClient.$post>['json'];
export type IsBookingFormExistsResponse = InferResponseType<typeof isExistsClient.$post, 200>;

export const isBookingFormExists = async (requestData: IsBookingFormExistsRequest) => {
    const response = await isExistsClient.$post({
        json: requestData,
    });

    const body = await response.json();

    if (!response.ok) {
        if ('success' in body && !body.success) {
            throw new Error(parseError(body));
        }
        throw new Error('Failed to check if booking form exists');
    }

    if (!body.success) {
        throw new Error(parseError(body));
    }
    

    return body.data;
};

const NAME_CHECK_DEBOUNCE_MS = 500;

export const useIsBookingFormExists = (name: string, organizationId: string) => {
    const [debouncedName] = useDebounce(name, NAME_CHECK_DEBOUNCE_MS);
    const isNameSettled = name === debouncedName;
    const [checkResult, setCheckResult] = useState<{
        name: string;
        organizationId: string;
        exists: boolean;
    } | null>(null);

    useEffect(() => {
        if (!isNameSettled || !debouncedName || !organizationId) {
            return;
        }

        let cancelled = false;

        isBookingFormExists({ name: debouncedName, organizationId }).then((exists) => {
            if (!cancelled) {
                setCheckResult({ name: debouncedName, organizationId, exists });
            }
        });

        return () => {
            cancelled = true;
        };
    }, [debouncedName, isNameSettled, organizationId]);

    const exists =
        isNameSettled &&
        debouncedName.length > 0 &&
        organizationId.length > 0 &&
        checkResult?.name === debouncedName &&
        checkResult?.organizationId === organizationId
            ? checkResult.exists
            : undefined;

    return { exists };
};
