import type { FC } from 'react';

import { BookingFormConfiguratorProvider } from './BookingFormConfiguratorContext';
import { ConfiguratorLayout } from './ConfiguratorLayout/ConfiguratorLayout';
import styles from './BookingFormConfigurator.module.scss';

export const BookingFormConfigurator: FC = () => {
    return (
        <BookingFormConfiguratorProvider>
            <div className={styles.bookingFormConfigurator}>
                <ConfiguratorLayout />
                <div className={styles.configuratorPreview}></div>
            </div>
        </BookingFormConfiguratorProvider>
    );
};
