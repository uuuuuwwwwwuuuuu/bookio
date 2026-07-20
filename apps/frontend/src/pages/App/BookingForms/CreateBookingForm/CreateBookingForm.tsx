import { useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';
import {
    useCreateBookingFormStore,
    type CreateBookingFormStep,
} from '@store/useCreateBookingFormStore';
import { PanelFormLayout } from '@components/PanelFormLayout/PanelFormLayout';
import { Step1NameDescription } from './Steps/Step1NameDescription/Step1NameDescription';
import { Step2UrlSlug } from './Steps/Step2UrlSlug/Step2UrlSlug';
import { Step3Styles } from './Steps/Step3Styles/Step3Styles';
import { Step4Metadata } from './Steps/Step4Metadata/Step4Metadata';
import { Step5Review } from './Steps/Step5Review/Step5Review';
import { Step6Success } from './Steps/Step6Success/Step6Success';

const STEPS: Record<CreateBookingFormStep, FC> = {
    1: Step1NameDescription,
    2: Step2UrlSlug,
    3: Step3Styles,
    4: Step4Metadata,
    5: Step5Review,
    6: Step6Success,
};

const STEP_META: Record<CreateBookingFormStep, { title: string; description: string }> = {
    1: {
        title: 'Enter name and description of booking form',
        description:
            'The name must be unique within your organization. The description should explain the purpose of this booking form.',
    },
    2: {
        title: 'Choose a unique URL slug',
        description:
            'This slug becomes part of the public booking form link together with your organization slug. Clients will open this URL to book — keep it short and unique within your organization.',
    },
    3: {
        title: 'Choose booking form colors',
        description:
            'Set the color palette for the public booking form. Use hex values like #RGB or #RRGGBB for primary, backgrounds, border, and text.',
    },
    4: {
        title: 'Set page metadata',
        description:
            'Title and description are required for SEO and social previews. Use Add more to define extra meta properties as name/value pairs.',
    },
    5: {
        title: 'Review your booking form',
        description:
            'Please confirm that all information is correct. You can go back to edit any step, or create the booking form.',
    },
    6: {
        title: 'Booking form created',
        description:
            'Your booking form is ready. Continue to the configurator to set it up, or finish and return to the list.',
    },
};

export const CreateBookingForm: FC = () => {
    const { id } = useParams();
    const { step, setOrganizationId, reset } = useCreateBookingFormStore(
        useShallow((s) => ({
            step: s.step,
            setOrganizationId: s.setOrganizationId,
            reset: s.reset,
        })),
    );

    useEffect(() => {
        if (id) setOrganizationId(id);
        return () => reset();
    }, [id, setOrganizationId, reset]);

    const CurrentStep = STEPS[step];
    const meta = STEP_META[step];
    const stepLabel = String(step).padStart(2, '0');

    return (
        <PanelFormLayout
            badge={`Step ${stepLabel}`}
            title={meta.title}
            description={meta.description}
            contentKey={String(step)}
            animate={false}
        >
            <CurrentStep />
        </PanelFormLayout>
    );
};
