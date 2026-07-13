import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { parseError } from '@utils/parseError';
import type { InferRequestType, InferResponseType } from 'hono/client';

const updateBookingFormClient = hono['booking-forms']['update'];

export type UpdateBookingFormRequest = InferRequestType<
    typeof updateBookingFormClient.$put
>['json'];
export type UpdateBookingFormResponse = InferResponseType<
    typeof updateBookingFormClient.$put,
    200
>;

const updateBookingFormRequest = async (requestData: UpdateBookingFormRequest) => {
    const response = await updateBookingFormClient.$put({
        json: requestData,
    });

    const body = await response.json();

    if (!response.ok) {
        if (!body.success) {
            throw new Error(parseError(body));
        }
        throw new Error('Failed to update booking form');
    }

    if (!body.success) {
        throw new Error(parseError(body));
    }

    return body.data;
};

export const useUpdateBookingForm = () => {
    return useMutation({
        mutationFn: updateBookingFormRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-forms'] });
            queryClient.invalidateQueries({ queryKey: ['booking-form'] });
            queryClient.invalidateQueries({ queryKey: ['booking-form-with-fields'] });
        },
    });
};
