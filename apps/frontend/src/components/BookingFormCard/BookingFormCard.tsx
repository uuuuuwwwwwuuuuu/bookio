import { useCallback, type ChangeEvent, type FC, useEffect } from 'react';
import styles from './BookingFormCard.module.scss';
import type { BookingFormType } from '@api/bookingForms/getBookingForms';
import { Button, Checkbox } from '@bookio/ui';
import { useUpdateBookingForm } from '@api/bookingForms/updateBookingForm';
import toast from 'react-hot-toast';

export const BookingFormCard: FC<{ bookingForm: BookingFormType }> = ({ bookingForm }) => {
    const { mutateAsync: updateBookingForm } = useUpdateBookingForm();

    const handleUpdateIsActive = useCallback(
        async (e: ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const currentValue = e.target.checked;

            toast.promise(
                updateBookingForm({
                    bookingFormId: bookingForm.id,
                    isActive: currentValue,
                }),
                {
                    loading: `Updating ${bookingForm.name}`,
                    success: `Updated ${bookingForm.name}`,
                    error: `Failed to update ${bookingForm.name}`,
                },
            );
        },
        [updateBookingForm, bookingForm.name, bookingForm.id],
    );

    useEffect(() => {
        console.log(bookingForm.isActive);
    }, [bookingForm.isActive]);
    
    return (
        <div className={styles.bookingFormCard}>
            <div className={styles.bookingFormCardGroup}>
                <h3>{bookingForm.name}</h3>
                <p>{bookingForm.description}</p>
            </div>
            <div className={styles.bookingFormCardGroup}>
                <span className={styles.bookingFormCardTotalBookings}>
                    Total bookings in this month: {bookingForm.totalBookings}
                </span>
            </div>
            <div className={styles.bookingFormCardGroup}>
                <Checkbox
                    label="Is active booking form"
                    checked={bookingForm.isActive}
                    onChange={handleUpdateIsActive}
                />
            </div>
            <div className={styles.bookingFormCardGroup}>
                <Button variant="blue-clean" type="link" to="create">
                    Edit
                </Button>
                <Button variant="red-clean" type="link" to="create">
                    Delete
                </Button>
            </div>
        </div>
    );
};
