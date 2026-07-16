import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
import type { InferRequestType, InferResponseType } from 'hono/client';

const updateBookingFormMetaClient = hono['booking-form-meta']['update'];

export type UpdateBookingFormMetaRequest = InferRequestType<
    typeof updateBookingFormMetaClient.$put
>['json'];
export type UpdateBookingFormMetaResponse = InferResponseType<
    typeof updateBookingFormMetaClient.$put,
    200
>;

const updateBookingFormMetaRequest = async (requestData: UpdateBookingFormMetaRequest) => {
    const response = await updateBookingFormMetaClient.$put({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to update booking form meta');

    return body.data;
};

export const useUpdateBookingFormMeta = (bookingFormId: string | undefined) => {
    return useMutation({
        mutationFn: updateBookingFormMetaRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form-meta', bookingFormId] });
        },
    });
};
