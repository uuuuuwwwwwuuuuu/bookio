import { useCallback, type FC } from 'react';
import styles from './BookingForms.module.scss';
import { useGetBookingForms } from '@api/bookingForms/getBookingForms';
import { useParams } from 'react-router-dom';
import { Button } from '@bookio/ui';
import { Spinner } from '@components/Spinner/Spinner';

export const BookingForms: FC = () => {
    const { id } = useParams();
    const { data: bookingForms, isPending, error, refetch } = useGetBookingForms(id);

    const handleRetry = useCallback(() => {
        refetch();
    }, [refetch]);

    if (isPending) {
        return <div className={styles.loadingContainer}>
            <Spinner size={6} />
        </div>
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>{error.message}</h2>
                <Button variant="primary-outlined" onClick={handleRetry}>Retry</Button>
            </div>
        );
    }

    return <div className={styles.bookingForms}></div>;
};
