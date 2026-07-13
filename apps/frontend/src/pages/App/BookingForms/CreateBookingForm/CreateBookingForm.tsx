import { type FC } from 'react';
import styles from './CreateBookingForm.module.scss';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useCreateBookingForm,
    type CreateBookingFormRequest,
} from '@api/bookingForms/createBookingForm';
import { useIsBookingFormExists } from '@api/bookingForms/isBookingFormExists';
import { ValidatableInput } from '@components/ValidatableInput/ValidatableInput';
import { Button, Input } from '@bookio/ui';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Controller, useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFirstFieldError } from '@utils/formErrors';

const createBookingFormSchema = z.object({
    name: z.string().min(1).max(255),
    organizationId: z.uuid(),
    description: z.string().max(255).optional().nullable(),
}) satisfies z.ZodType<CreateBookingFormRequest>;

type FormData = z.infer<typeof createBookingFormSchema>;

export const CreateBookingForm: FC = () => {
    const { id } = useParams();
    const { mutateAsync, isPending, isSuccess } = useCreateBookingForm();
    const navigate = useNavigate();

    const {
        register,
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(createBookingFormSchema),
        defaultValues: {
            name: '',
            description: '',
            organizationId: id ?? '',
        },
    });

    const name = useWatch({ control, name: 'name', defaultValue: '' });
    const { exists: nameExists } = useIsBookingFormExists(name, id ?? '');
    const nameIsValid = nameExists === undefined ? undefined : !nameExists;

    const onSubmit = async (data: FormData) => {
        if (nameExists === true) {
            toast.error('Booking form with this name already exists');
            return;
        }

        await toast.promise(mutateAsync(data), {
            loading: 'Creating booking form...',
            success: 'Booking form created successfully',
            error: (error: Error) => error.message,
        });
    };

    const onInvalid = (errors: FieldErrors<FormData>) => {
        toast.error(getFirstFieldError(errors) ?? 'Invalid form data');
    };


    if (isSuccess) {
        navigate(`/${id}/booking-forms`);
    }

    return (
        <div className={styles.createBookingForm}>
            <div className={styles.createBookingFormContent}>
                <h2>Create a new booking form</h2>

                <p>Pay your attention, you can't set the same name for multiple booking forms</p>
            </div>

            <form
                className={styles.createBookingFormForm}
                onSubmit={handleSubmit(onSubmit, onInvalid)}
            >
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <ValidatableInput
                            {...field}
                            placeholder="Enter the name of the booking form"
                            isValid={nameIsValid}
                        />
                    )}
                />

                <Input
                    placeholder="Enter the description of the booking form"
                    {...register('description')}
                />

                <Button
                    type="submit"
                    variant="primary-filled"
                    className={styles.submitButton}
                >
                    Create booking form
                </Button>
            </form>
        </div>
    );
};
