import { useCallback, type ChangeEvent, type FC, useEffect, useState } from 'react';
import styles from './BookingFormCard.module.scss';
import type { BookingFormType } from '@api/bookingForms/getBookingForms';
import { Button, Checkbox, Dialog } from '@bookio/ui';
import {
    useUpdateBookingForm,
    type UpdateBookingFormRequest,
} from '@api/bookingForms/updateBookingForm';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';

const updateBookingFormSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(255).optional().nullable(),
}) satisfies z.ZodType<Omit<UpdateBookingFormRequest, 'bookingFormId' | 'isActive'>>;

type UpdateBookingFormFormData = z.infer<typeof updateBookingFormSchema>;

export const BookingFormCard: FC<{ bookingForm: BookingFormType }> = ({ bookingForm }) => {
    const { mutateAsync: updateBookingForm } = useUpdateBookingForm();
    const [isEditing, setIsEditing] = useState(false);

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

    const { register, handleSubmit } = useForm<UpdateBookingFormFormData>({
        defaultValues: {
            name: bookingForm.name,
            description: bookingForm.description,
        },
        resolver: zodResolver(updateBookingFormSchema),
    });

    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    useEffect(() => {
        console.log(bookingForm.isActive);
    }, [bookingForm.isActive]);

    return (
        <>
            <div className={styles.bookingFormCard}>
                <div className={styles.contentGroup}>
                    <div className={clsx(styles.bookingFormCardGroup, styles.bookingFormCardGroupName)}>
                        <h3>{bookingForm.name}</h3>
                        {bookingForm.description && <p>{bookingForm.description}</p>}
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
                </div>
                <div className={styles.bookingFormCardGroup}>
                    <Button variant="blue-clean" onClick={handleEdit}>
                        Edit
                    </Button>
                    <Button variant="red-clean">Delete</Button>
                </div>
            </div>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <Dialog.Title>Edit Booking Form</Dialog.Title>
            </Dialog>
        </>
    );
};
