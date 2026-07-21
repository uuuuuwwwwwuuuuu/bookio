import type { FC, ReactNode } from 'react';
import { memo } from 'react';
import { Tabs } from '@bookio/ui';

export type ConfiguratorTab = {
    value: string;
    content: string;
    icon: ReactNode;
};

export const ConfiguratorTabs: FC<{
    tabs: ConfiguratorTab[];
    activeTab: string;
    onActiveTabChange: (tab: string) => void;
}> = memo(({ tabs, activeTab, onActiveTabChange }) => {
    return (
        <Tabs value={activeTab} onValueChange={onActiveTabChange}>
            {tabs.map((tab) => (
                <Tabs.Item key={tab.value} value={tab.value}>
                    <Tabs.Icon>{tab.icon}</Tabs.Icon>
                    <Tabs.Content>{tab.content}</Tabs.Content>
                </Tabs.Item>
            ))}
        </Tabs>
    );
});
