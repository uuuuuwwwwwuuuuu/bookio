import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
import type { InferRequestType, InferResponseType } from 'hono/client';

const createBookingFormStylesClient = hono['booking-form-styles']['create'];

export type CreateBookingFormStylesRequest = InferRequestType<
    typeof createBookingFormStylesClient.$post
>['json'];
export type CreateBookingFormStylesResponse = InferResponseType<
    typeof createBookingFormStylesClient.$post,
    200
>;

const createBookingFormStylesRequest = async (requestData: CreateBookingFormStylesRequest) => {
    const response = await createBookingFormStylesClient.$post({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to create booking form styles');

    return body.data;
};

export const useCreateBookingFormStyles = (bookingFormId: string | undefined) => {
    return useMutation({
        mutationFn: createBookingFormStylesRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form-styles', bookingFormId] });
        },
    });
};
