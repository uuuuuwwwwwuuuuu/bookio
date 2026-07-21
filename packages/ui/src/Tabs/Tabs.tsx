import {
    createContext,
    memo,
    useCallback,
    useContext,
    type ComponentProps,
    type MouseEvent,
    type ReactNode,
} from 'react';
import styles from './Tabs.module.scss';

type TabsContextValue = {
    value: string;
    onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error('Tabs compound components must be used within <Tabs>');
    }

    return context;
}

export type TabsProps = {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
    className?: string;
};

function TabsRoot({ value, onValueChange, children, className }: TabsProps) {
    const classes = [styles.root, className].filter(Boolean).join(' ');

    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={classes} role="tablist">
                {children}
            </div>
        </TabsContext.Provider>
    );
}

export type TabsItemProps = {
    value: string;
    children: ReactNode;
    className?: string;
} & Omit<ComponentProps<'button'>, 'className' | 'children' | 'value' | 'type'>;

function TabsItem({ value, children, className, disabled, onClick, ...props }: TabsItemProps) {
    const { value: selectedValue, onValueChange } = useTabsContext();
    const selected = selectedValue === value;

    const classes = [styles.item, selected && styles.itemSelected, className]
        .filter(Boolean)
        .join(' ');

    const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            onClick?.(event);
            if (event.defaultPrevented || disabled) return;
            onValueChange(value);
        },
        [disabled, onClick, onValueChange, value],
    );

    return (
        <button
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={disabled}
            className={classes}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
}

export type TabsIconProps = {
    children: ReactNode;
    className?: string;
};

function TabsIcon({ children, className }: TabsIconProps) {
    const classes = [styles.icon, className].filter(Boolean).join(' ');

    return (
        <span className={classes} aria-hidden>
            {children}
        </span>
    );
}

export type TabsContentProps = {
    children: ReactNode;
    className?: string;
};

function TabsContent({ children, className }: TabsContentProps) {
    const classes = [styles.content, className].filter(Boolean).join(' ');

    return <span className={classes}>{children}</span>;
}

type TabsComponent = typeof TabsRoot & {
    Item: typeof TabsItem;
    Icon: typeof TabsIcon;
    Content: typeof TabsContent;
};

const Tabs = memo(TabsRoot) as unknown as TabsComponent;
Tabs.Item = TabsItem;
Tabs.Icon = TabsIcon;
Tabs.Content = TabsContent;

export default Tabs;
