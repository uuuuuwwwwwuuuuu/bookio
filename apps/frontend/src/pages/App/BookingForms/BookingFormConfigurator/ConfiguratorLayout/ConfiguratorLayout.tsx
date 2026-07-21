import type { FC, ReactNode } from 'react';

import SettingsIcon from '@assets/icons/settings.svg?react';
import FieldsIcon from '@assets/icons/fields.svg?react';
import StylesIcon from '@assets/icons/styles.svg?react';
import PanelLeftCloseIcon from '@assets/icons/panel-left-close.svg?react';

import { useBookingFormConfigurator } from '../BookingFormConfiguratorContext';
import styles from './ConfiguratorLayout.module.scss';
import { ConfiguratorTabs, type ConfiguratorTab } from './ConfiguratorTabs';

const tabs: ConfiguratorTab[] = [
    {
        value: 'settings',
        content: 'Settings',
        icon: <SettingsIcon />,
    },
    {
        value: 'fields',
        content: 'Fields',
        icon: <FieldsIcon />,
    },
    {
        value: 'styles',
        content: 'Styles',
        icon: <StylesIcon />,
    },
];

export const ConfiguratorLayout: FC<{ children?: ReactNode }> = ({ children }) => {
    const { activeTab, setActiveTab } = useBookingFormConfigurator();

    return (
        <div className={styles.configuratorContainer}>
            <div className={styles.tabs}>
                <ConfiguratorTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onActiveTabChange={setActiveTab}
                />
            </div>
            <div className={styles.header}>
                <h2 className={styles.title}>Basic settings</h2>
                <button type="button" className={styles.collapseButton} aria-label="Collapse panel" >
                    <PanelLeftCloseIcon />
                </button>
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    );
};
