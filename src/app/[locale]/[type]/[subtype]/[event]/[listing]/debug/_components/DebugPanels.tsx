'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Code, Database, Grid3X3, LucideIcon, RefreshCcw, RotateCcw, Search } from 'lucide-react';

import { ListingMetadata } from '@/interfaces/Listing';

import { useDebounce } from '@/hooks/useDebounce';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

import { useVenueMapDebug } from '../_providers/VenueMapDebugProvider';
import APIRawMetadata from './APIRawMetadata';
import MetadataBlocks from './MetadataBlocks';
import SvgElements from './SvgElements';

interface PanelConfig {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    isSelected: boolean;
    onToggle: (val: boolean) => void;
    count?: number;
    component: ReactNode;
}

const getNextCheckboxValue = (value: boolean | { target?: { checked?: boolean } }) => {
    if (typeof value === 'boolean') return value;

    return Boolean(value.target?.checked);
};

const SearchInput = () => {
    const { searchTerm, setSearchTerm, scanSvg, resetFilters } = useVenueMapDebug();
    const [localValue, setLocalValue] = useState(searchTerm);

    const debouncedSetSearchTerm = useDebounce((value: string) => {
        setSearchTerm(value);
    }, 300);

    // Sync local state with global state if global changes (e.g. from elsewhere)
    useEffect(() => {
        setLocalValue(searchTerm);
    }, [searchTerm]);

    const handleChange = (value: string) => {
        setLocalValue(value);
        debouncedSetSearchTerm(value);
    };

    return (
        <div className="flex items-center gap-1">
            <Input
                placeholder="Global Search..."
                prefixIcon={<Search size={14} className="text-gray-400" />}
                value={localValue}
                onChange={(event) => handleChange(event.target.value)}
                classNames={{
                    wrapper: 'flex-1',
                    input: 'h-8 min-h-8 rounded-md px-2',
                }}
            />
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            aria-label="Reset filters"
                            onClick={resetFilters}
                            isIconOnly
                            className="h-8 w-8 min-w-8"
                            prefixIcon={<RotateCcw size={14} />}
                        />
                    }
                />
                <TooltipContent>Reset Filters</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            aria-label="Refresh scan"
                            onClick={scanSvg}
                            isIconOnly
                            className="h-8 w-8 min-w-8"
                            prefixIcon={<RefreshCcw size={14} />}
                        />
                    }
                />
                <TooltipContent>Refresh Scan</TooltipContent>
            </Tooltip>
        </div>
    );
};

export default function DebugPanels({ metadata }: { metadata: ListingMetadata }) {
    const {
        availableBlocks,
        svgElements,
        showMetadataBlocks,
        setShowMetadataBlocks,
        showSvgElements,
        setShowSvgElements,
        showApiMetadata,
        setShowApiMetadata,
    } = useVenueMapDebug();

    const panels: PanelConfig[] = useMemo(
        () => [
            {
                id: 'blocks',
                label: 'Metadata Blocks',
                icon: Grid3X3,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                isSelected: showMetadataBlocks,
                onToggle: setShowMetadataBlocks,
                count: availableBlocks.length,
                component: <MetadataBlocks />,
            },
            {
                id: 'svg',
                label: 'SVG Elements',
                icon: Database,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                isSelected: showSvgElements,
                onToggle: setShowSvgElements,
                count: svgElements.length,
                component: <SvgElements />,
            },
            {
                id: 'api',
                label: 'API Metadata',
                icon: Code,
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                isSelected: showApiMetadata,
                onToggle: setShowApiMetadata,
                component: <APIRawMetadata metadata={metadata} />,
            },
        ],
        [
            showMetadataBlocks,
            showSvgElements,
            showApiMetadata,
            setShowMetadataBlocks,
            setShowSvgElements,
            setShowApiMetadata,
            availableBlocks.length,
            svgElements.length,
            metadata,
        ]
    );

    const activePanels = panels.filter((p) => p.isSelected);

    return (
        <div>
            <div className="absolute z-50 flex flex-col h-full overflow-hidden border-r-2 bg-white">
                {/* Header Controls */}
                <div className="flex flex-col gap-2 p-2 border-b bg-gray-50/50">
                    <SearchInput />

                    <div className="flex items-center gap-4 px-1">
                        {panels.map((p) => (
                            <div
                                className={`flex items-center gap-1 text-xs font-bold ${p.color}`}
                                key={p.id}
                            >
                                <Checkbox
                                    checked={p.isSelected}
                                    onCheckedChange={(value) =>
                                        p.onToggle(getNextCheckboxValue(value))
                                    }
                                    className="flex flex-row justify-start items-center gap-2"
                                ></Checkbox>
                                <p.icon size={14} /> {p.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panels Container */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div
                        className={`flex h-full divide-x-2 ${
                            activePanels.length === 0
                                ? 'bg-gray-100 items-center justify-center italic text-gray-400 text-xs w-full'
                                : 'w-max min-w-full'
                        }`}
                    >
                        {activePanels.length === 0 ? (
                            <span>No panels selected</span>
                        ) : (
                            activePanels.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex flex-col overflow-hidden flex-none text-xs"
                                >
                                    <div
                                        className={`p-1 px-2 ${p.bgColor} font-bold border-b flex justify-between items-center uppercase`}
                                    >
                                        <span>{p.label}</span>
                                        {p.count !== undefined && (
                                            <span className="opacity-70 bg-black/5 px-1 rounded">
                                                {p.count}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">{p.component}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
