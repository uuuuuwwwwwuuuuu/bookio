import { useCallback, type ChangeEvent, type FC } from 'react';
import { useShallow } from 'zustand/shallow';
import { Button } from '@bookio/ui';
import { ValidatableInput } from '@components/ValidatableInput/ValidatableInput';
import { useIsBookingFormExists } from '@api/bookingForms/isBookingFormExists';
import { useGetOrganization } from '@api/organizations/getOrganizationData';
import { useCreateBookingFormStore } from '@store/useCreateBookingFormStore';
import { BOOKING_FORM_URL } from '@utils/constants';
import { BookingFormConfiguratorLayout } from '../../BookingFormConfiguratorLayout/BookingFormConfiguratorLayout';
import { step2Schema } from '../../schemas/createBookingFormDraft.schema';
import toast from 'react-hot-toast';
import styles from './Step2UrlSlug.module.scss';

export const Step2UrlSlug: FC = () => {
    const { slug, organizationId, setField, goToNextStep, goToPreviousStep } =
        useCreateBookingFormStore(
            useShallow((s) => ({
                slug: s.data.slug,
                organizationId: s.data.organizationId,
                setField: s.setField,
                goToNextStep: s.goToNextStep,
                goToPreviousStep: s.goToPreviousStep,
            })),
        );

    const { data: organization } = useGetOrganization(organizationId || undefined);

    const trimmedSlug = slug.trim();
    const formatResult =
        trimmedSlug.length > 0 ? step2Schema.safeParse({ slug: trimmedSlug }) : null;
    const isFormatValid = formatResult?.success === true;

    const { exists: slugExists } = useIsBookingFormExists({
        organizationId,
        slug: isFormatValid ? trimmedSlug : '',
    });

    const slugIsValid =
        trimmedSlug.length === 0
            ? undefined
            : !isFormatValid
              ? false
              : slugExists === undefined
                ? undefined
                : !slugExists;

    const slugErrorMessage =
        slugIsValid !== false
            ? undefined
            : ((formatResult && !formatResult.success
                  ? formatResult.error.issues[0]?.message
                  : undefined) ??
              (slugExists === true ? 'Booking form with this slug already exists' : undefined));

    const organizationSlug = organization?.slug ?? 'your-org';
    const previewSlug = trimmedSlug || 'your-form';

    const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
        setField('slug', event.target.value);
    };

    const handleClickNext = useCallback(() => {
        const parsed = step2Schema.safeParse({ slug: trimmedSlug });
        if (!parsed.success) {
            return toast.error(parsed.error.issues[0]?.message ?? 'Invalid slug');
        }

        if (slugExists === true) {
            return toast.error('Booking form with this slug already exists');
        }

        if (slugExists === undefined && trimmedSlug.length > 0) {
            return toast.error('Please wait until the slug availability check finishes');
        }

        setField('slug', trimmedSlug);
        goToNextStep();
    }, [trimmedSlug, slugExists, setField, goToNextStep]);

    return (
        <BookingFormConfiguratorLayout
            footer={
                <div className={styles.footerActions}>
                    <Button type="button" variant="primary-filled" onClick={handleClickNext}>
                        Go to next
                    </Button>
                    <Button type="button" variant="simple-clean" onClick={goToPreviousStep}>
                        Back
                    </Button>
                </div>
            }
        >
            <ValidatableInput
                value={slug}
                onChange={handleSlugChange}
                placeholder="Slug*"
                isValid={slugIsValid}
                errorMessage={slugErrorMessage}
            />
            <div className={styles.urlPreview}>
                <span className={styles.urlPreviewLabel}>Public form URL</span>
                <span className={styles.urlPreviewValue}>
                    {BOOKING_FORM_URL}/{organizationSlug}/
                    <span className={styles.urlPreviewSlug}>{previewSlug}</span>
                </span>
            </div>
        </BookingFormConfiguratorLayout>
    );
};
