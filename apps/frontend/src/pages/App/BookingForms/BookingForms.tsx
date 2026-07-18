import { useCallback, type FC } from 'react';
import styles from './BookingForms.module.scss';
import { useGetBookingForms } from '@api/bookingForms/getBookingForms';
import { useParams } from 'react-router-dom';
import { Button, Input } from '@bookio/ui';
import { Spinner } from '@components/Spinner/Spinner';
import { BookingFormCard } from '@components/BookingFormCard/BookingFormCard';

import PlusIcon from '@assets/icons/plus.svg?react';
import SearchIcon from '@assets/icons/search.svg?react';

export const BookingForms: FC = () => {
    const { id } = useParams();
    const { data: bookingForms, isPending, error, refetch } = useGetBookingForms(id);

    const handleRetry = useCallback(() => {
        refetch();
    }, [refetch]);

    if (isPending) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner size={6} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>{error.message}</h2>
                <Button variant="primary-outlined" onClick={handleRetry}>
                    Retry
                </Button>
            </div>
        );
    }

    if (bookingForms.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyContainerContent}>
                    <h2>You haven't any booking forms yet</h2>
                    <p>Create your first booking form to get started</p>
                </div>
                <Button
                    variant="primary-filled"
                    type="link"
                    className={styles.createButton}
                    to="create"
                >
                    Create your first booking form
                </Button>
            </div>
        );
    }

    const activeFormsCount = bookingForms.filter((form) => form.isActive).length;

    return (
        <>
            <BookingFormHeader
                formsCount={bookingForms.length}
                activeFormsCount={activeFormsCount}
            />
            <div className={styles.bookingForms}>
                {bookingForms.map((bookingForm) => (
                    <BookingFormCard key={bookingForm.id} bookingForm={bookingForm} />
                ))}
            </div>
        </>
    );
};

type BookingFormHeaderProps = {
    formsCount: number;
    activeFormsCount: number;
};

const BookingFormHeader: FC<BookingFormHeaderProps> = ({ formsCount, activeFormsCount }) => {
    return (
        <div className={styles.bookingHeader}>
            <div className={styles.headerLeft}>
                <h2 className={styles.pageTitle}>Booking Forms</h2>
                <div className={styles.metaChips}>
                    <Button variant="simple-filled" className={styles.chipButton}>
                        {formsCount} forms
                    </Button>
                    <Button variant="simple-filled" className={styles.chipButton}>
                        <span className={styles.activeDot} aria-hidden />
                        {activeFormsCount} active
                    </Button>
                </div>
            </div>

            <div className={styles.headerToolbar}>
                <Input.Root className={styles.searchInput}>
                    <Input.Icon>
                        <SearchIcon />
                    </Input.Icon>
                    <Input
                        type="search"
                        placeholder="Search forms…"
                        aria-label="Search forms"
                        readOnly
                    />
                </Input.Root>

                <Button
                    variant="primary-filled"
                    type="link"
                    to="create"
                    className={styles.headerCreateButton}
                >
                    <PlusIcon />
                    Create
                </Button>
            </div>
        </div>
    );
};
