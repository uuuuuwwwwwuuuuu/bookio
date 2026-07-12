import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { parseError } from '@utils/parseError';
import type { InferRequestType, InferResponseType } from 'hono/client';

const createBookingFormClient = hono['booking-forms']['create'];

export type CreateBookingFormRequest = InferRequestType<
    typeof createBookingFormClient.$post
>['json'];
export type CreateBookingFormResponse = InferResponseType<
    typeof createBookingFormClient.$post,
    200
>;

const createBookingFormRequest = async (requestData: CreateBookingFormRequest) => {
    const response = await createBookingFormClient.$post({
        json: requestData,
    });

    const body = await response.json();

    if (!response.ok) {
        if (!body.success) {
            throw new Error(parseError(body));
        }
        throw new Error('Failed to create booking form');
    }

    if (!body.success) {
        throw new Error(parseError(body));
    }

    return body.data;
};

export const useCreateBookingForm = () => {
    return useMutation({
        mutationFn: createBookingFormRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-forms'] });
        },
    });
};
