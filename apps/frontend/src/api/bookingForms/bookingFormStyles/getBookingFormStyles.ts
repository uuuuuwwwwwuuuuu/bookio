import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const getBookingFormStylesClient = hono['booking-form-styles']['get-one'];

export type GetBookingFormStylesResponse = InferResponseType<
    typeof getBookingFormStylesClient.$get,
    200
>;
export type BookingFormStylesType = GetBookingFormStylesResponse['data'];

const fetchBookingFormStyles = async (bookingFormId: string): Promise<BookingFormStylesType> => {
    const response = await getBookingFormStylesClient.$get({
        query: {
            bookingFormId,
        },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to get booking form styles');

    return body.data;
};

export const useGetBookingFormStyles = (
    bookingFormId: string | undefined,
): UseQueryResult<BookingFormStylesType> => {
    return useQuery<BookingFormStylesType>({
        queryKey: ['booking-form-styles', bookingFormId],
        queryFn: () => fetchBookingFormStyles(bookingFormId!),
        enabled: !!bookingFormId,
    });
};
