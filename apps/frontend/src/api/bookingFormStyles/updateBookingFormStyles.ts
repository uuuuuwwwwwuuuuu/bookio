import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
import type { InferRequestType, InferResponseType } from 'hono/client';

const updateBookingFormStylesClient = hono['booking-form-styles']['update'];

export type UpdateBookingFormStylesRequest = InferRequestType<
    typeof updateBookingFormStylesClient.$put
>['json'];
export type UpdateBookingFormStylesResponse = InferResponseType<
    typeof updateBookingFormStylesClient.$put,
    200
>;

const updateBookingFormStylesRequest = async (requestData: UpdateBookingFormStylesRequest) => {
    const response = await updateBookingFormStylesClient.$put({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to update booking form styles');

    return body.data;
};

export const useUpdateBookingFormStyles = (bookingFormId: string | undefined) => {
    return useMutation({
        mutationFn: updateBookingFormStylesRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form-styles', bookingFormId] });
        },
    });
};
