import { memo, type FC, type ReactNode } from 'react';

import PanelLeftCloseIcon from '@assets/icons/panel-left-close.svg?react';
import { Button } from '@bookio/ui';

import { useShallow } from 'zustand/shallow';
import { useBookingFormConfiguratorStore } from '@store/useBookingFormConfiguratorStore';
import { configuratorTabs } from '../configuratorTabs';
import styles from './ConfiguratorLayout.module.scss';
import { ConfiguratorTabs } from './ConfiguratorTabs';

export const ConfiguratorLayout = memo(function ConfiguratorLayout({
    children,
}: {
    children?: ReactNode;
}) {
    return (
        <div className={styles.configuratorContainer}>
            <ConfiguratorTabsSection />
            <ConfiguratorHeader />
            <div className={styles.content}>{children}</div>
            <ConfiguratorFooter />
        </div>
    );
});

const ConfiguratorTabsSection: FC = memo(() => {
    const { activeTab, setActiveTab } = useBookingFormConfiguratorStore(
        useShallow(({ activeTab, setActiveTab }) => ({ activeTab, setActiveTab })),
    );

    return (
        <div className={styles.tabs}>
            <ConfiguratorTabs
                tabs={configuratorTabs}
                activeTab={activeTab}
                onActiveTabChange={setActiveTab}
            />
        </div>
    );
});

const ConfiguratorHeader: FC = memo(() => {
    const activeTab = useBookingFormConfiguratorStore((state) => state.activeTab);
    return (
        <div className={styles.header}>
            <h2 className={styles.title}>
                {configuratorTabs.find((tab) => tab.value === activeTab)?.content}
            </h2>
            <button type="button" className={styles.collapseButton} aria-label="Collapse panel">
                <PanelLeftCloseIcon />
            </button>
        </div>
    );
});

const ConfiguratorFooter: FC = memo(() => {
    return (
        <div className={styles.footer}>
            <Button type="button" variant="simple-clean">
                Back
            </Button>
            <Button variant="green-filled" className={styles.saveButton}>
                Save booking form
            </Button>
        </div>
    );
});
