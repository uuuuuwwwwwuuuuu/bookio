import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const getBookingFormMetaClient = hono['booking-form-meta']['get-one'];

export type GetBookingFormMetaResponse = InferResponseType<
    typeof getBookingFormMetaClient.$get,
    200
>;
export type BookingFormMetaType = GetBookingFormMetaResponse['data'];

const fetchBookingFormMeta = async (bookingFormId: string): Promise<BookingFormMetaType> => {
    const response = await getBookingFormMetaClient.$get({
        query: {
            bookingFormId,
        },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to get booking form meta');

    return body.data;
};

export const useGetBookingFormMeta = (
    bookingFormId: string | undefined,
): UseQueryResult<BookingFormMetaType> => {
    return useQuery<BookingFormMetaType>({
        queryKey: ['booking-form-meta', bookingFormId],
        queryFn: () => fetchBookingFormMeta(bookingFormId!),
        enabled: !!bookingFormId,
    });
};
