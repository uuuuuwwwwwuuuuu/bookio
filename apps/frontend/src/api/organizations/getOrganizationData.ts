import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType, InferRequestType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSession } from '@api/auth';

export type GetOrganizationDataResponse = InferResponseType<
    typeof hono.organizations.data.$get,
    200
>;
export type OrganizationData = GetOrganizationDataResponse['data'];
export type GetOrganizationDataRequest = InferRequestType<typeof hono.organizations.data.$get>;

const getOrganizationData = async (
    organizationId: string,
    userId: string,
): Promise<OrganizationData> => {
    const response = await hono.organizations.data.$get({
        query: {
            organizationId,
            userId,
        },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to get organization data');

    return body.data;
};

export const useGetOrganization = (
    organizationId: string | undefined,
): UseQueryResult<OrganizationData> => {
    const { data: session } = useSession();
    return useQuery<OrganizationData>({
        queryKey: ['organization', organizationId],
        queryFn: () => getOrganizationData(organizationId!, session!.user.id),
        enabled: !!session && !!organizationId,
    });
};
