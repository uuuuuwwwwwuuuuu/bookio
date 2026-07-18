import type { FC } from 'react';
import styles from './OrganizationSearch.module.scss';
import { Input } from '@bookio/ui';
import { useOrganizationListStore } from '@store/useOrganizationListStore';
import { useShallow } from 'zustand/shallow';
import { useOnPress } from '@hooks/useOnPress';
import { useCallback, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useOutsideClick } from '@hooks/useOutsideClick';
import {
    useGetOrganizationsByUserId,
    type OrganizationsType,
} from '@api/organizations/getOrganizationsByUserId';
import { OrganizationItem } from '@components/OrganizationItem/OrganizationItem';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SearchIcon from '@assets/icons/search.svg?react';

const createTrigrams = (value: string) => {
    return value
        .split('')
        .map((char, index, array) => {
            return char + array[index + 1] + array[index + 2];
        })
        .filter((trigram) => trigram.length === 3);
};

const filterOrganizations = (organizations: OrganizationsType, value: string) => {
    if (!value.trim()) return [];

    const searchLower = value.toLowerCase();

    if (value.length < 3)
        return organizations.filter((org) => org.name.toLowerCase().includes(searchLower));

    const searchTrigrams = createTrigrams(searchLower);

    const preparedOrgs = organizations.map((org) => {
        const orgNameLower = org.name.toLowerCase();
        const orgTrigrams = createTrigrams(orgNameLower);
        const matchedSearchTrigrams = searchTrigrams.filter((trigram) =>
            orgTrigrams.includes(trigram),
        );
        const score =
            orgNameLower === searchLower
                ? 100
                : (matchedSearchTrigrams.length / searchTrigrams.length) * 100;

        return {
            ...org,
            score,
        };
    });

    return preparedOrgs.filter((org) => org.score > 60).sort((a, b) => b.score - a.score);
};

export const OrganizationSearch: FC = () => {
    const { setIsOpen, isOpen } = useOrganizationListStore(
        useShallow(({ setIsOpen, isOpen }) => ({ isOpen, setIsOpen })),
    );
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);

    const closeSearch = useCallback(() => {
        if (!isOpen || isClosing) return;
        setIsClosing(true);
    }, [isOpen, isClosing]);

    const handleAnimationEnd = useCallback(
        (e: React.AnimationEvent<HTMLDivElement>) => {
            if (e.target !== e.currentTarget || !isClosing) return;
            if (e.animationName !== styles.fadeOut) return;

            setIsClosing(false);
            setIsOpen(false);
        },
        [isClosing, setIsOpen],
    );

    const { data: organizations, error } = useGetOrganizationsByUserId();
    const [filteredOrganizations, setFilteredOrganizations] = useState<
        OrganizationsType
    >([]);

    useOnPress('Escape', closeSearch);
    useOutsideClick([searchInputRef, searchWrapperRef], closeSearch);

    if (error) {
        toast.error(error.message)
    }

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            
            if (!organizations) return;

            setFilteredOrganizations(filterOrganizations(organizations || [], value));
        },
        [organizations, setFilteredOrganizations],
    );

    if (!isOpen) return null;

    return (
        <div
            className={clsx(styles.organizationSearch, { [styles.closing]: isClosing })}
            onAnimationEnd={handleAnimationEnd}
        >
            <Input.Root className={styles.searchInput}>
                <Input.Icon>
                    <SearchIcon />
                </Input.Icon>
                <Input
                    type="search"
                    placeholder="Search"
                    ref={searchInputRef}
                    onChange={handleSearchChange}
                    autoFocus
                />
            </Input.Root>
            <OrganizationSearchWrapper data={filteredOrganizations} ref={searchWrapperRef} />
        </div>
    );
};

interface OrganizationSearchWrapperProps {
    data: OrganizationsType;
    ref: React.RefObject<HTMLDivElement | null>;
}

const OrganizationSearchWrapper = ({ data, ref }: OrganizationSearchWrapperProps) => {
    const navigate = useNavigate();
    const handleClickOnOrganization = useCallback((id: string) => {
        navigate(`/${id}`);
    }, [navigate]);

    return (
        <div
            className={styles.organizationSearchWrapper}
            style={{ opacity: data.length > 0 ? 1 : 0 }}
            ref={ref}
        >
            {data.map((organization) => (
                <OrganizationItem
                    key={organization.id}
                    organizationName={organization.name}
                    organizationId={organization.id}
                    createdAt={organization.createdAt}
                    role={organization.role}
                    slug={organization.slug}
                    showActions={false}
                    onClick={handleClickOnOrganization}
                />
            ))}
        </div>
    );
};
