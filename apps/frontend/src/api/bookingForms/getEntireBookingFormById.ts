import hono from '@lib/hono-client';
import { validateError } from '@utils/validateError';
import type { InferResponseType } from 'hono/client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSession } from '@api/auth';

const getEntireBookingFormByIdClient = hono['booking-forms']['get-entire-by-id'];

export type GetEntireBookingFormByIdResponse = InferResponseType<
    typeof getEntireBookingFormByIdClient.$get,
    200
>;
export type EntireBookingFormType = GetEntireBookingFormByIdResponse['data'];

const fetchEntireBookingFormById = async (
    bookingFormId: string,
): Promise<EntireBookingFormType> => {
    const response = await getEntireBookingFormByIdClient.$get({
        query: {
            bookingFormId,
        },
    });

    const body = await response.json();

    validateError(response, body, 'Failed to get entire booking form by id');

    return body.data;
};

export const useGetEntireBookingFormById = (
    bookingFormId: string | undefined,
): UseQueryResult<EntireBookingFormType> => {
    const { data: session } = useSession();
    return useQuery<EntireBookingFormType>({
        queryKey: ['entire-booking-form', bookingFormId],
        queryFn: () => fetchEntireBookingFormById(bookingFormId!),
        enabled: !!session?.user.id,
    });
};
