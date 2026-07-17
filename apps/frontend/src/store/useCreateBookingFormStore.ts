import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DEFAULT_BOOKING_FORM_STYLES } from '@utils/defaultBookingFormStyles';

export type CreateBookingFormStep = number;

export type CreateBookingFormDraft = {
    organizationId: string;
    name: string;
    description: string;
    slug: string;
    primary: string;
    bgMain: string;
    bgSecondary: string;
    borderColor: string;
    textMain: string;
    textSecondary: string;
};

const INITIAL_DRAFT: CreateBookingFormDraft = {
    organizationId: '',
    name: '',
    description: '',
    slug: '',
    ...DEFAULT_BOOKING_FORM_STYLES,
};

interface CreateBookingFormStore {
    step: CreateBookingFormStep;
    data: CreateBookingFormDraft;

    goToNextStep: () => void;
    goToPreviousStep: () => void;
    setStep: (step: CreateBookingFormStep) => void;
    setField: <K extends keyof CreateBookingFormDraft>(
        key: K,
        value: CreateBookingFormDraft[K],
    ) => void;
    setOrganizationId: (organizationId: string) => void;
    reset: () => void;
}

const INITIAL_STEP: CreateBookingFormStep = 1;

export const useCreateBookingFormStore = create<CreateBookingFormStore>()(
    devtools(
        (set) => ({
            step: INITIAL_STEP,
            data: INITIAL_DRAFT,

            goToNextStep: () => set((state) => ({ step: state.step + 1 }), false, 'goToNextStep'),
            goToPreviousStep: () =>
                set((state) => ({ step: state.step - 1 }), false, 'goToPreviousStep'),
            setStep: (step) => set({ step }, false, 'setStep'),
            setField: (key, value) =>
                set((state) => ({ data: { ...state.data, [key]: value } }), false, 'setField'),
            setOrganizationId: (organizationId) =>
                set(
                    (state) => ({ data: { ...state.data, organizationId } }),
                    false,
                    'setOrganizationId',
                ),
            reset: () => set({ step: INITIAL_STEP, data: INITIAL_DRAFT }, false, 'reset'),
        }),
        { name: 'CreateBookingFormStore' },
    ),
);
