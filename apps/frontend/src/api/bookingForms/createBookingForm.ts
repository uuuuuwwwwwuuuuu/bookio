import hono from '@lib/hono-client';
import { queryClient } from '@lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
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
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to create booking form');

    return body.data;
};

export const useCreateBookingForm = (organizationId: string | undefined) => {
    return useMutation({
        mutationFn: createBookingFormRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-forms', organizationId] });
        },
    });
};
