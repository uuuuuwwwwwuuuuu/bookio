import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
import type { InferRequestType, InferResponseType } from 'hono/client';

const createBookingFormMetaClient = hono['booking-form-meta']['create'];

export type CreateBookingFormMetaRequest = InferRequestType<
    typeof createBookingFormMetaClient.$post
>['json'];
export type CreateBookingFormMetaResponse = InferResponseType<
    typeof createBookingFormMetaClient.$post,
    200
>;

const createBookingFormMetaRequest = async (requestData: CreateBookingFormMetaRequest) => {
    const response = await createBookingFormMetaClient.$post({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to create booking form meta');

    return body.data;
};

export const useCreateBookingFormMeta = (bookingFormId: string | undefined) => {
    return useMutation({
        mutationFn: createBookingFormMetaRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form-meta', bookingFormId] });
        },
    });
};
