import hono from '@lib/hono-client';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { useMutation } from '@tanstack/react-query';
import { useSession } from '@api/auth';
import { queryClient } from '@lib/query-client';
import { validateError } from '@utils/validateError';

export type ConnectToOrganizationRequest = InferRequestType<
    typeof hono.organizations.connect.$put
>['json'];
export type ConnectToOrganizationResponse = InferResponseType<
    typeof hono.organizations.connect.$put
>;

const connectToOrganizationRequest = async (requestData: ConnectToOrganizationRequest) => {
    const response = await hono.organizations.connect.$put({
        json: requestData,
    });

    const body = await response.json();

    validateError(response, body, 'Failed to connect to organization');

    return body.data;
};

export const useConnectToOrganization = () => {
    const { data: session } = useSession();

    return useMutation({
        mutationFn: (data: Omit<ConnectToOrganizationRequest, 'userId'>) =>
            connectToOrganizationRequest({ ...data, userId: session!.user.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
};
