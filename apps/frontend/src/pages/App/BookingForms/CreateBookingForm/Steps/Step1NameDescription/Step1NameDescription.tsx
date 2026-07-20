import { useCallback, type ChangeEvent, type FC } from 'react';
import { useShallow } from 'zustand/shallow';
import { Button, Input } from '@bookio/ui';
import { ValidatableInput } from '@components/ValidatableInput/ValidatableInput';
import { useIsBookingFormExists } from '@api/bookingForms/isBookingFormExists';
import { useCreateBookingFormStore } from '@store/useCreateBookingFormStore';
import { BookingFormConfiguratorLayout } from '../../BookingFormConfiguratorLayout/BookingFormConfiguratorLayout';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import styles from './Step1NameDescription.module.scss';

export const Step1NameDescription: FC = () => {
    const navigate = useNavigate();
    const { data, name, description, organizationId, setField, goToNextStep } =
        useCreateBookingFormStore(
            useShallow((s) => ({
                data: s.data,
                name: s.data.name,
                description: s.data.description,
                organizationId: s.data.organizationId,
                setField: s.setField,
                goToNextStep: s.goToNextStep,
            })),
        );

    const { exists: nameExists } = useIsBookingFormExists({
        organizationId,
        name: name.trim(),
    });
    const nameIsValid = nameExists === undefined ? undefined : !nameExists;

    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setField('name', event.target.value);
    };

    const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
        setField('description', event.target.value);
    };

    const handleClickNext = useCallback(() => {
        if (!data.name) return toast.error('Name is required');

        goToNextStep();
    }, [data.name, goToNextStep]);

    const handleClose = useCallback(() => {
        navigate(-1);
    }, [navigate]);
    return (
        <BookingFormConfiguratorLayout
            footer={
                <div className={styles.footerActions}>
                    <Button type="button" variant="primary-filled" onClick={handleClickNext}>
                        Go to next
                    </Button>
                    <Button type="button" variant="simple-clean" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            }
        >
            <ValidatableInput
                value={name}
                onChange={handleNameChange}
                placeholder="Name*"
                isValid={nameIsValid}
                errorMessage={
                    nameExists === true ? 'Booking form with this name already exists' : undefined
                }
            />
            <Input
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Description"
            />
        </BookingFormConfiguratorLayout>
    );
};
