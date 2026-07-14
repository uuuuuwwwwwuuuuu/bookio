import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import type { InferRequestType, InferResponseType } from 'hono/client';

export type DeleteBookingFormFieldRequest = InferRequestType<
    typeof hono.fields.delete.$delete
>['json'];
export type DeleteBookingFormFieldResponse = InferResponseType<
    typeof hono.fields.delete.$delete,
    200
>;

const deleteBookingFormFieldRequest = async (requestData: DeleteBookingFormFieldRequest) => {
    const response = await hono.fields.delete.$delete({
        json: requestData,
    });

    const body = await response.json();

    validateError(response, body, 'Failed to delete booking form field');

    return body.data;
};

export const useDeleteBookingFormField = () => {
    return useMutation({
        mutationFn: deleteBookingFormFieldRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form-fields'] });
            queryClient.invalidateQueries({ queryKey: ['booking-form-with-fields'] });
        },
    });
};
