import { useCallback, type ChangeEvent, type FC } from 'react';
import { useShallow } from 'zustand/shallow';
import { Button, Input } from '@bookio/ui';
import TrashIcon from '@assets/icons/trash.svg?react';
import { useCreateBookingFormStore } from '@store/useCreateBookingFormStore';
import { BookingFormConfiguratorLayout } from '../../BookingFormConfiguratorLayout/BookingFormConfiguratorLayout';
import { step4Schema } from '../../schemas/createBookingFormDraft.schema';
import toast from 'react-hot-toast';
import styles from './Step4Metadata.module.scss';

export const Step4Metadata: FC = () => {
    const { metaTitle, metaDescription, additionalMeta, setField, goToNextStep, goToPreviousStep } =
        useCreateBookingFormStore(
            useShallow((s) => ({
                metaTitle: s.data.metaTitle,
                metaDescription: s.data.metaDescription,
                additionalMeta: s.data.additionalMeta,
                setField: s.setField,
                goToNextStep: s.goToNextStep,
                goToPreviousStep: s.goToPreviousStep,
            })),
        );

    const handleMetaTitleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setField('metaTitle', event.target.value);
        },
        [setField],
    );

    const handleMetaDescriptionChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setField('metaDescription', event.target.value);
        },
        [setField],
    );

    const handleAdditionalMetaChange = useCallback(
        (index: number, field: 'key' | 'value') => (event: ChangeEvent<HTMLInputElement>) => {
            const next = additionalMeta.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: event.target.value } : item,
            );
            setField('additionalMeta', next);
        },
        [additionalMeta, setField],
    );

    const handleAddMore = useCallback(() => {
        setField('additionalMeta', [...additionalMeta, { key: '', value: '' }]);
    }, [additionalMeta, setField]);

    const handleRemoveAdditionalMeta = useCallback(
        (index: number) => {
            setField(
                'additionalMeta',
                additionalMeta.filter((_, itemIndex) => itemIndex !== index),
            );
        },
        [additionalMeta, setField],
    );

    const handleClickNext = useCallback(() => {
        const trimmed = {
            metaTitle: metaTitle.trim(),
            metaDescription: metaDescription.trim(),
            additionalMeta: additionalMeta.map((item) => ({
                key: item.key.trim(),
                value: item.value.trim(),
            })),
        };

        const parsed = step4Schema.safeParse(trimmed);
        if (!parsed.success) {
            return toast.error(parsed.error.issues[0]?.message ?? 'Invalid metadata');
        }

        setField('metaTitle', trimmed.metaTitle);
        setField('metaDescription', trimmed.metaDescription);
        setField('additionalMeta', trimmed.additionalMeta);
        goToNextStep();
    }, [metaTitle, metaDescription, additionalMeta, setField, goToNextStep]);

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
            <Input
                label="Title"
                value={metaTitle}
                onChange={handleMetaTitleChange}
                placeholder="Title*"
            />
            <Input
                label="Description"
                value={metaDescription}
                onChange={handleMetaDescriptionChange}
                placeholder="Description*"
            />

            {additionalMeta.map((item, index) => (
                <div key={index} className={styles.metaRow}>
                    <Input
                        label="Meta property name"
                        className={styles.metaRowInput}
                        value={item.key}
                        onChange={handleAdditionalMetaChange(index, 'key')}
                        placeholder="Meta property name*"
                    />
                    <Input
                        label="Meta property value"
                        className={styles.metaRowInput}
                        value={item.value}
                        onChange={handleAdditionalMetaChange(index, 'value')}
                        placeholder="Meta property value*"
                    />
                    <Button
                        type="button"
                        variant="red-clean"
                        className={styles.removeButton}
                        onClick={() => handleRemoveAdditionalMeta(index)}
                        aria-label="Remove meta property"
                    >
                        <TrashIcon />
                    </Button>
                </div>
            ))}

            <Button type="button" variant="simple-clean" onClick={handleAddMore}>
                Add more
            </Button>
        </BookingFormConfiguratorLayout>
    );
};
