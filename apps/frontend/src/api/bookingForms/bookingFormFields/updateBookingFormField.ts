import hono from '@lib/hono-client';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';

export type UpdateBookingFormFieldRequest = InferRequestType<
    typeof hono.fields.update.$put
>['json'];
export type UpdateBookingFormFieldResponse = InferResponseType<
    typeof hono.fields.update.$put
>;

const updateBookingFormFieldRequest = async (requestData: UpdateBookingFormFieldRequest) => {
    const response = await hono.fields.update.$put({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to update booking form field');

    return body.data;
};

export const useUpdateBookingFormField = () => {
    return useMutation({
        mutationFn: updateBookingFormFieldRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form-fields'] });
            queryClient.invalidateQueries({ queryKey: ['booking-form-with-fields'] });
        },
    });
};
