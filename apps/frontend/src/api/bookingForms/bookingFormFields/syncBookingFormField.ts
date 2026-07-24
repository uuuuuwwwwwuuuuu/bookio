import hono from '@lib/hono-client';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { validateError } from '@utils/validateError';
import { trimObj } from '@utils/trimObj';
import { invalidateEntireBookingForm } from '../getEntireBookingFormById';

export type SyncBookingFormFieldRequest = InferRequestType<typeof hono.fields.sync.$put>['json'];
export type SyncBookingFormFieldResponse = InferResponseType<typeof hono.fields.sync.$put>;

const syncBookingFormFieldRequest = async (requestData: SyncBookingFormFieldRequest) => {
    const response = await hono.fields.sync.$put({
        json: trimObj(requestData),
    });

    const body = await response.json();

    validateError(response, body, 'Failed to sync booking form fields');

    return body.data;
};

export const useSyncBookingFormField = (bookingFormId: string | undefined) => {
    return useMutation({
        mutationFn: syncBookingFormFieldRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-form-fields'] });
            invalidateEntireBookingForm(bookingFormId);
        },
    });
};
