import { useEffect, useState } from 'react';
import hono from '@lib/hono-client';
import { useDebounce } from 'use-debounce';
import type { InferRequestType, InferResponseType } from 'hono/client';

const isExistsClient = hono.organizations['is-exists'];

export type IsOrganizationExistsRequest = InferRequestType<typeof isExistsClient.$post>['json'];
export type IsOrganizationExistsResponse = InferResponseType<typeof isExistsClient.$post, 200>;

export const isOrgExists = async (requestData: IsOrganizationExistsRequest) => {
    const response = await isExistsClient.$post({
        json: requestData,
    });

    if (!response.ok) {
        throw new Error('Failed to check if organization exists');
    }

    return (await response.json()).data;
};

const SLUG_CHECK_DEBOUNCE_MS = 500;

export const useIsOrganizationExists = (slug: string) => {
    const [debouncedSlug] = useDebounce(slug, SLUG_CHECK_DEBOUNCE_MS);
    const isSlugSettled = slug === debouncedSlug;
    const [checkResult, setCheckResult] = useState<{ slug: string; exists: boolean } | null>(null);

    useEffect(() => {
        if (!isSlugSettled || !debouncedSlug) {
            return;
        }

        let cancelled = false;

        isOrgExists({ slug: debouncedSlug }).then((exists) => {
            if (!cancelled) setCheckResult({ slug: debouncedSlug, exists });
        });

        return () => {
            cancelled = true;
        };
    }, [debouncedSlug, isSlugSettled]);

    const exists =
        isSlugSettled && debouncedSlug.length > 0 && checkResult?.slug === debouncedSlug
            ? checkResult.exists
            : undefined;

    return { exists };
};