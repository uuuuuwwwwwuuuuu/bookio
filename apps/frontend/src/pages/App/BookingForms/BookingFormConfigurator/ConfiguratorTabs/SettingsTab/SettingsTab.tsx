import { useEffect, type FC } from 'react';
import type { BookingFormType } from '@api/bookingForms/getBookingForms';
import type { UpdateBookingFormRequest } from '@api/bookingForms/updateBookingForm';
import { useParams } from 'react-router-dom';
import { Checkbox, Input } from '@bookio/ui';
import { ValidatableInput } from '@components/ValidatableInput/ValidatableInput';
import { useIsBookingFormExists } from '@api/bookingForms/isBookingFormExists';

import styles from './SettingsTab.module.scss';
import { BookingFormUrlPreview } from '@components/BookingFormUrlPreview/BookingFormUrlPreview';
import { useGetOrganization, type OrganizationData } from '@api/organizations/getOrganizationData';

import { useForm, useWatch } from 'react-hook-form';

import { useBookingFormConfiguratorStore } from '@store/useBookingFormConfiguratorStore';
import { useGetEntireBookingFormById } from '@api/bookingForms/getEntireBookingFormById';

type SettingsTabFormData = Omit<UpdateBookingFormRequest, 'bookingFormId'>;

type SettingsTabFormProps = {
    bookingForm: BookingFormType;
    organization: OrganizationData;
};

function getFieldExistsValidity(
    currentValue: string,
    originalValue: string,
    exists: boolean | undefined,
): boolean | undefined {
    if (currentValue === originalValue || exists === undefined) {
        return undefined;
    }

    return !exists;
}

const SettingsTabForm: FC<SettingsTabFormProps> = ({ bookingForm, organization }) => {
    const setBookingForm = useBookingFormConfiguratorStore((state) => state.setBookingForm);

    const { register, control } = useForm<SettingsTabFormData>({
        defaultValues: {
            name: bookingForm.name ?? '',
            description: bookingForm.description ?? '',
            slug: bookingForm.slug ?? '',
            isActive: bookingForm.isActive ?? false,
        },
    });

    const formValues = useWatch({ control });

    useEffect(() => {
        setBookingForm({
            bookingFormId: bookingForm.id,
            name: formValues?.name ?? '',
            description: formValues?.description ?? '',
            slug: formValues?.slug ?? '',
            isActive: formValues?.isActive ?? false,
        });
    }, [formValues, bookingForm.id, setBookingForm]);

    const name = formValues?.name ?? '';
    const slug = formValues?.slug ?? '';

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const originalName = (bookingForm.name ?? '').trim();
    const originalSlug = (bookingForm.slug ?? '').trim();

    const { exists: nameExists } = useIsBookingFormExists({
        organizationId: organization.id,
        name: trimmedName,
    });
    const { exists: slugExists } = useIsBookingFormExists({
        organizationId: organization.id,
        slug: trimmedSlug,
    });

    const nameIsValid = getFieldExistsValidity(trimmedName, originalName, nameExists);
    const slugIsValid = getFieldExistsValidity(trimmedSlug, originalSlug, slugExists);

    return (
        <div className={styles.settingsTab}>
            <ValidatableInput
                label="Name"
                className={styles.input}
                {...register('name')}
                isValid={nameIsValid}
                errorMessage={
                    nameExists === true ? 'Booking form with this name already exists' : undefined
                }
            />
            <Input
                label="Description"
                type="textarea"
                className={styles.textarea}
                {...register('description')}
            />
            <ValidatableInput
                label="Slug"
                className={styles.input}
                {...register('slug')}
                isValid={slugIsValid}
                errorMessage={
                    slugExists === true ? 'Booking form with this slug already exists' : undefined
                }
            />
            <BookingFormUrlPreview
                formSlug={trimmedSlug || originalSlug}
                organizationSlug={organization.slug}
            />
            <Checkbox label="Is active" {...register('isActive')} />
        </div>
    );
};

export const SettingsTab: FC = () => {
    const { bookingFormId, id } = useParams();

    const { data: organization } = useGetOrganization(id);
    const { data: bookingForm } = useGetEntireBookingFormById(bookingFormId);

    if (!bookingFormId || !id || !bookingForm || !organization) return null;

    return <SettingsTabForm bookingForm={bookingForm} organization={organization} />;
};
