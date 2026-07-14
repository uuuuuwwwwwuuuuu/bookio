import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
import type { InferRequestType, InferResponseType } from 'hono/client';

export type CreateOrganizationRequest = InferRequestType<
    typeof hono.organizations.create.$post
>['json'];
export type CreateOrganizationResponse = InferResponseType<
    typeof hono.organizations.create.$post,
    200
>;

const createOrganizationRequest = async (requestData: CreateOrganizationRequest) => {
    const response = await hono.organizations.create.$post({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to create organization');

    return body.data;
};

export const useCreateOrganization = () => {
    return useMutation({
        mutationFn: createOrganizationRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
};
