import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
import type { InferRequestType, InferResponseType } from 'hono/client';

export type CreateBookingFormFieldRequest = InferRequestType<
    typeof hono.fields.create.$post
>['json'];
export type CreateBookingFormFieldResponse = InferResponseType<
    typeof hono.fields.create.$post,
    200
>;

const createBookingFormFieldRequest = async (requestData: CreateBookingFormFieldRequest) => {
    const response = await hono.fields.create.$post({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to create booking form field');

    return body.data;
};

export const useCreateBookingFormField = () => {
    return useMutation({
        mutationFn: createBookingFormFieldRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form-fields'] });
            queryClient.invalidateQueries({ queryKey: ['booking-form-with-fields'] });
        },
    });
};
