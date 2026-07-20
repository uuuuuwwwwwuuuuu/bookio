import { useCallback, useMemo, type FC } from 'react';
import { useShallow } from 'zustand/shallow';
import { Button } from '@bookio/ui';
import { useCreateBookingForm } from '@api/bookingForms/createBookingForm';
import {
    useCreateBookingFormStore,
    type CreateBookingFormDraft,
} from '@store/useCreateBookingFormStore';
import { BookingFormConfiguratorLayout } from '../../BookingFormConfiguratorLayout/BookingFormConfiguratorLayout';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import styles from './Step5Review.module.scss';

type ReviewCell = {
    label: string;
    value: string;
    empty?: boolean;
    color?: string;
};

type ReviewSection = {
    id: string;
    title: string;
    cells: ReviewCell[];
};

const COLOR_FIELDS = [
    { key: 'primary', label: 'Primary' },
    { key: 'bgMain', label: 'Background main' },
    { key: 'bgSecondary', label: 'Background secondary' },
    { key: 'borderColor', label: 'Border' },
    { key: 'textMain', label: 'Text main' },
    { key: 'textSecondary', label: 'Text secondary' },
] as const;

const buildReviewSections = (data: CreateBookingFormDraft): ReviewSection[] => [
    {
        id: 'general',
        title: 'General',
        cells: [
            { label: 'Name', value: data.name },
            {
                label: 'Description',
                value: data.description || 'No description',
                empty: !data.description,
            },
            { label: 'Slug', value: data.slug },
        ],
    },
    {
        id: 'colors',
        title: 'Colors',
        cells: COLOR_FIELDS.map(({ key, label }) => ({
            label,
            value: data[key],
            color: data[key],
        })),
    },
    {
        id: 'metadata',
        title: 'Metadata',
        cells: [
            { label: 'Title', value: data.metaTitle },
            { label: 'Description', value: data.metaDescription },
            ...(data.additionalMeta.length === 0
                ? [{ label: 'Additional', value: 'None', empty: true }]
                : data.additionalMeta.map((item) => ({
                      label: item.key,
                      value: item.value,
                  }))),
        ],
    },
];

export const Step5Review: FC = () => {
    const { data, goToPreviousStep, goToNextStep, setCreatedBookingFormId } =
        useCreateBookingFormStore(
            useShallow((s) => ({
                data: s.data,
                goToPreviousStep: s.goToPreviousStep,
                goToNextStep: s.goToNextStep,
                setCreatedBookingFormId: s.setCreatedBookingFormId,
            })),
        );

    const { mutateAsync: createBookingForm, isPending } = useCreateBookingForm(data.organizationId);

    const sections = useMemo(() => buildReviewSections(data), [data]);

    const handleCreate = useCallback(async () => {
        try {
            const created = await toast.promise(
                createBookingForm({
                    organizationId: data.organizationId,
                    name: data.name,
                    description: data.description || null,
                    slug: data.slug,
                    primary: data.primary,
                    bgMain: data.bgMain,
                    bgSecondary: data.bgSecondary,
                    borderColor: data.borderColor,
                    textMain: data.textMain,
                    textSecondary: data.textSecondary,
                    metaTitle: data.metaTitle,
                    metaDescription: data.metaDescription,
                    additionalMeta: data.additionalMeta,
                }),
                {
                    loading: 'Creating booking form...',
                    success: 'Booking form created successfully',
                    error: (error: Error) => error.message,
                },
            );

            setCreatedBookingFormId(created.id);
            goToNextStep();
        } catch {
            // toast.promise already surfaces the error
        }
    }, [createBookingForm, data, goToNextStep, setCreatedBookingFormId]);

    return (
        <BookingFormConfiguratorLayout
            footer={
                <div className={styles.footerActions}>
                    <Button
                        type="button"
                        variant="primary-filled"
                        onClick={handleCreate}
                        disabled={isPending}
                    >
                        Create booking form
                    </Button>
                    <Button
                        type="button"
                        variant="simple-clean"
                        onClick={goToPreviousStep}
                        disabled={isPending}
                    >
                        Back
                    </Button>
                </div>
            }
        >
            <div className={styles.summary}>
                {sections.map((section, sectionIndex) => (
                    <section key={section.id} className={styles.section}>
                        <header className={styles.sectionHeader}>
                            <span className={styles.sectionIndex}>
                                {String(sectionIndex + 1).padStart(2, '0')}
                            </span>
                            <h3 className={styles.sectionTitle}>{section.title}</h3>
                        </header>

                        <div className={styles.grid}>
                            {section.cells.map((cell, cellIndex) => (
                                <div
                                    key={`${section.id}-${cellIndex}`}
                                    className={styles.cell}
                                >
                                    <span className={styles.label}>{cell.label}</span>
                                    <span
                                        className={clsx(
                                            styles.value,
                                            cell.empty && styles.emptyValue,
                                            cell.color && styles.colorValue,
                                        )}
                                    >
                                        {cell.color ? (
                                            <span
                                                className={styles.swatch}
                                                style={{ backgroundColor: cell.color }}
                                                aria-hidden
                                            />
                                        ) : null}
                                        {cell.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </BookingFormConfiguratorLayout>
    );
};
