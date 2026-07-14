import { useSession } from '@api/auth';
import hono from '@lib/hono-client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';

export type OrganizationsResponse200 = InferResponseType<typeof hono.organizations.$get, 200>;
export type OrganizationsType = OrganizationsResponse200['data'];
export type OrganizationType = OrganizationsType[number];

const fetchOrganizationsByUserId = async (userId: string) => {
    const response = await hono.organizations.$get({
        query: { userId },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to fetch organizations');

    return body.data;
};

export const useGetOrganizationsByUserId = (): UseQueryResult<OrganizationsType> => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: ['organizations', session?.user?.id],
        enabled: !!session?.user?.id,
        queryFn: () => fetchOrganizationsByUserId(session!.user.id),
    });
};
