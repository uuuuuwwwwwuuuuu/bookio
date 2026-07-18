import { useCallback, type FC, useState } from 'react';
import styles from './BookingFormCard.module.scss';
import type { BookingFormType } from '@api/bookingForms/getBookingForms';
import { Button } from '@bookio/ui';
import { useUpdateBookingForm } from '@api/bookingForms/updateBookingForm';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { EditBookingFormDialog } from './EditBookingFormDialog';
import { DeleteBookingFormDialog } from './DeleteBookingFormDialog';
import { BOOKING_FORM_URL } from '@utils/constants';

import TrashIcon from '@assets/icons/trash.svg?react';
import EditIcon from '@assets/icons/pen.svg?react';
import CalendarIcon from '@assets/icons/calendar.svg?react';
import CopyIcon from '@assets/icons/copy.svg?react';

import { useParams } from 'react-router-dom';
import { useGetOrganization } from '@api/organizations/getOrganizationData';

export const BookingFormCard: FC<{ bookingForm: BookingFormType }> = ({ bookingForm }) => {
    const { mutateAsync: updateBookingForm } = useUpdateBookingForm(bookingForm.id);
    const { id } = useParams<{ id: string }>();
    const { data: organization } = useGetOrganization(id);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const bookingFormUrl = `${BOOKING_FORM_URL}/${organization?.slug}/${bookingForm.slug}`;

    const handleToggleIsActive = useCallback(async () => {
        const nextValue = !bookingForm.isActive;

        toast.promise(
            updateBookingForm({
                bookingFormId: bookingForm.id,
                isActive: nextValue,
            }),
            {
                loading: `Updating ${bookingForm.name}`,
                success: `Updated ${bookingForm.name}`,
                error: `Failed to update ${bookingForm.name}`,
            },
        );
    }, [updateBookingForm, bookingForm.name, bookingForm.id, bookingForm.isActive]);

    const handleOpenEditDialog = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleOpenDeleteDialog = useCallback(() => {
        setIsDeleting(true);
    }, []);

    const handleCopyBookingFormUrl = useCallback(() => {
        navigator.clipboard.writeText(bookingFormUrl);
        toast.success('Booking form URL copied to clipboard');
    }, [bookingFormUrl]);

    return (
        <>
            <div className={styles.bookingFormCard}>
                <div className={styles.contentGroup}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleRow}>
                            <h3 className={styles.formName}>{bookingForm.name}</h3>
                            <button
                                type="button"
                                className={clsx(styles.statusBadge, {
                                    [styles.statusBadgeActive]: bookingForm.isActive,
                                    [styles.statusBadgeInactive]: !bookingForm.isActive,
                                })}
                                onClick={handleToggleIsActive}
                                aria-pressed={bookingForm.isActive}
                            >
                                <span className={styles.statusDot} />
                                <span>{bookingForm.isActive ? 'Active' : 'Inactive'}</span>
                            </button>
                        </div>
                        <p className={styles.formDescription}>
                            {bookingForm.description || '\u00A0'}
                        </p>
                    </div>

                    <div className={styles.cardMeta}>
                        <div className={styles.metricRow}>
                            <div className={styles.metricLeft}>
                                <CalendarIcon className={styles.metricIcon} />
                                <span>Bookings this month</span>
                            </div>
                            <span className={styles.bookingsCount}>{bookingForm.totalBookings}</span>
                        </div>

                        <div className={styles.urlBlock}>
                            <span className={styles.urlLabel}>Booking form URL</span>
                            <div className={styles.urlRow}>
                                <span className={styles.urlText}>{bookingFormUrl}</span>
                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    onClick={handleCopyBookingFormUrl}
                                    aria-label="Copy booking form URL"
                                >
                                    <CopyIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.bookingFormButtonsGroup}>
                    <Button
                        variant="red-clean"
                        onClick={handleOpenDeleteDialog}
                        className={styles.bookingFormCardButton}
                        aria-label="Delete booking form"
                    >
                        <TrashIcon />
                    </Button>
                    <Button
                        variant="blue-clean"
                        onClick={handleOpenEditDialog}
                        className={styles.bookingFormCardButton}
                        aria-label="Edit booking form"
                    >
                        <EditIcon />
                    </Button>
                    <Button
                        variant="simple-filled"
                        type="link"
                        to={`${bookingForm.id}/configurator`}
                        className={styles.bookingFormCardConfiguratorButton}
                    >
                        Open configurator
                    </Button>
                </div>
            </div>

            <EditBookingFormDialog
                bookingForm={bookingForm}
                open={isEditing}
                onOpenChange={setIsEditing}
            />

            <DeleteBookingFormDialog
                bookingForm={bookingForm}
                open={isDeleting}
                onOpenChange={setIsDeleting}
            />
        </>
    );
};
