import type { FC } from 'react';

import { ConfiguratorLayout } from './ConfiguratorLayout/ConfiguratorLayout';
import { useBookingFormConfiguratorStore } from '@store/useBookingFormConfiguratorStore';
import { getConfiguratorTab } from './configuratorTabs';
import styles from './BookingFormConfigurator.module.scss';

export const BookingFormConfigurator: FC = () => {
    const activeTab = useBookingFormConfiguratorStore((state) => state.activeTab);
    const tab = getConfiguratorTab(activeTab);
    const Panel = tab?.Panel;

    return (
        <div className={styles.bookingFormConfigurator}>
            <ConfiguratorLayout>{Panel ? <Panel /> : null}</ConfiguratorLayout>
            <div className={styles.configuratorPreview}></div>
        </div>
    );
};
