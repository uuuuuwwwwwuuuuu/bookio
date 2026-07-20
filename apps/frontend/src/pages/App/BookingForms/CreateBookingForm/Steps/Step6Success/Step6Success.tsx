import { useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';
import { Button } from '@bookio/ui';
import { useCreateBookingFormStore } from '@store/useCreateBookingFormStore';
import { BookingFormConfiguratorLayout } from '../../BookingFormConfiguratorLayout/BookingFormConfiguratorLayout';
import styles from './Step6Success.module.scss';

import DoneIcon from '@assets/icons/done.svg?react';

export const Step6Success: FC = () => {
    const navigate = useNavigate();
    const { organizationId, createdBookingFormId } = useCreateBookingFormStore(
        useShallow((s) => ({
            organizationId: s.data.organizationId,
            createdBookingFormId: s.createdBookingFormId,
        })),
    );

    const handleContinueToConfigurator = useCallback(() => {
        if (!organizationId || !createdBookingFormId) return;

        navigate(`/${organizationId}/booking-forms/${createdBookingFormId}/configurator`);
    }, [navigate, organizationId, createdBookingFormId]);

    const handleFinish = useCallback(() => {
        if (!organizationId) return;

        navigate(`/${organizationId}/booking-forms/`);
    }, [navigate, organizationId]);

    return (
        <BookingFormConfiguratorLayout
            footer={
                <div className={styles.footerActions}>
                    <Button
                        type="button"
                        variant="primary-filled"
                        onClick={handleContinueToConfigurator}
                        disabled={!createdBookingFormId}
                    >
                        Continue to configurator
                    </Button>
                    <Button type="button" variant="simple-clean" onClick={handleFinish}>
                        Finish
                    </Button>
                </div>
            }
        >
            <div className={styles.content}>
                <DoneIcon className={styles.doneIcon} aria-hidden />
            </div>
        </BookingFormConfiguratorLayout>
    );
};
