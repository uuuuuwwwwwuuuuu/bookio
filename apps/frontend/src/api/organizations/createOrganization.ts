import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

export type CreateOrganizationRequest = InferRequestType<typeof hono.organizations.create.$post>['json'];
export type CreateOrganizationResponse = InferResponseType<
    typeof hono.organizations.create.$post,
    200
>;

const createOrganizationRequest = async (
    requestData: CreateOrganizationRequest,
): Promise<CreateOrganizationResponse> => {
    const response = await hono.organizations.create.$post({
        json: requestData,
    });

    if (!response.ok) {
        throw new Error('Failed to create organization');
    }

    return response.json();
};

export const useCreateOrganization = () => {
    return useMutation({
        mutationFn: createOrganizationRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
};
