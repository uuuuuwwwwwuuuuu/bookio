import { createContext, useContext, useState, type FC, type ReactNode } from 'react';

type BookingFormConfiguratorContextValue = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
};

const BookingFormConfiguratorContext = createContext<BookingFormConfiguratorContextValue | null>(
    null,
);

export const BookingFormConfiguratorProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState('settings');
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    return (
        <BookingFormConfiguratorContext.Provider
            value={{ activeTab, setActiveTab, isCollapsed, setIsCollapsed }}
        >
            {children}
        </BookingFormConfiguratorContext.Provider>
    );
};

export const useBookingFormConfigurator = () => {
    const context = useContext(BookingFormConfiguratorContext);

    if (!context) {
        throw new Error(
            'useBookingFormConfigurator must be used within BookingFormConfiguratorProvider',
        );
    }

    return context;
};
