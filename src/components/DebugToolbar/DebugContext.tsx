'use client';

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
    useTransition,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type Website from '@/interfaces/Website';
import { clearApiCallHistory, getApiCallHistory, invalidateCache } from '@/lib/debug/actions';
import type { ApiCallInfo } from '@/lib/debug/api-tracker';

import { useSite } from '@/providers/SiteProvider';
import useCookie from '@/hooks/useCookie';
import { useDebounce } from '@/hooks/useDebounce';

interface DebugContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedCall: ApiCallInfo | null;
    setSelectedCall: (call: ApiCallInfo | null) => void;
    apiCalls: ApiCallInfo[];
    isPending: boolean;
    refreshApiCalls: () => void;
    handleClearHistory: () => void;
    handleInvalidate: (tags: string[]) => void;
    websiteName: string | undefined;
    locale: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    debouncedSearchTerm: string;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({
    children,
    locale,
    website: websiteOverride,
}: {
    children: ReactNode;
    locale?: string;
    // optional override for trees without SiteProvider; otherwise from hook
    website?: Website | null;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCall, setSelectedCall] = useState<ApiCallInfo | null>(null);
    const [apiCalls, setApiCalls] = useState<ApiCallInfo[]>([]);
    const [isPending, startTransition] = useTransition();

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const updateDebouncedSearch = useDebounce((val: string) => {
        setDebouncedSearchTerm(val);
    }, 300);

    const handleSearchChange = useCallback(
        (val: string) => {
            setSearchTerm(val);
            updateDebouncedSearch(val);
        },
        [updateDebouncedSearch]
    );

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { refresh } = useRouter();
    const { getCookie } = useCookie<string>('sid');
    const websiteFromProvider = useSite().website;
    const website = websiteOverride ?? websiteFromProvider;

    // Get current full url
    const currentFullUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const refreshApiCalls = () => {
        startTransition(async () => {
            try {
                setApiCalls(await getApiCallHistory(getCookie()));
            } catch (err) {
                console.error('Error fetching API calls:', err);
            }
        });
    };

    const handleClearHistory = () => {
        startTransition(async () => {
            try {
                await clearApiCallHistory();
                setSelectedCall(null);
                setApiCalls([]);
            } catch (err) {
                console.error('Error clearing API calls:', err);
            }
        });
    };

    const handleInvalidate = (tags: string[]) => {
        startTransition(async () => {
            try {
                await invalidateCache(tags);

                refresh();
            } catch (err) {
                console.error('Error invalidating cache:', err);
            }
        });
    };

    useEffect(() => {
        refreshApiCalls();
    }, [currentFullUrl]);

    return (
        <DebugContext.Provider
            value={{
                isOpen,
                setIsOpen,
                selectedCall,
                setSelectedCall,
                apiCalls,
                isPending,
                refreshApiCalls,
                handleClearHistory,
                handleInvalidate,
                websiteName: website?.name,
                locale: locale || 'en-GB',
                searchTerm,
                setSearchTerm: handleSearchChange,
                debouncedSearchTerm,
            }}
        >
            {children}
        </DebugContext.Provider>
    );
}

export function useDebug() {
    const context = useContext(DebugContext);
    if (!context) {
        throw new Error('useDebug must be used within a DebugProvider');
    }
    return context;
}
