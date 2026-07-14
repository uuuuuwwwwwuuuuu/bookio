import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
import type { InferRequestType, InferResponseType } from 'hono/client';

const updateBookingFormClient = hono['booking-forms']['update'];

export type UpdateBookingFormRequest = InferRequestType<
    typeof updateBookingFormClient.$put
>['json'];
export type UpdateBookingFormResponse = InferResponseType<typeof updateBookingFormClient.$put, 200>;

const updateBookingFormRequest = async (requestData: UpdateBookingFormRequest) => {
    const response = await updateBookingFormClient.$put({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to update booking form');

    return body.data;
};

export const useUpdateBookingForm = (bookingFormId: string | undefined) => {
    return useMutation({
        mutationFn: updateBookingFormRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form', bookingFormId] });
            queryClient.invalidateQueries({ queryKey: ['booking-forms'] });
        },
    });
};
