'use client';

import { useMemo } from 'react';

import FloatingSelect from '@/components/FloatingSelect';

import { useVenueMapDebug } from '../_providers/VenueMapDebugProvider';

export default function MetadataBlocks() {
    const {
        availableBlocks,
        debouncedSearchTerm: searchTerm,
        blockCategoryFilter: categoryFilter,
        setBlockCategoryFilter: setCategoryFilter,
        blockStatusFilter: statusFilter,
        setBlockStatusFilter: setStatusFilter,
        mappedBlockKeys,
        svgElements,
        highlightElement,
        clearHighlight,
    } = useVenueMapDebug();

    const categories = useMemo(() => {
        const cats = Array.from(new Set(availableBlocks.map((b) => b.categoryName))).sort();

        // Map to objects and prepend the "All" option
        const catOptions = cats.map((cat) => ({
            value: cat,
            label: cat,
        }));

        return [{ value: 'all', label: 'All Categories' }, ...catOptions];
    }, [availableBlocks]);

    const filteredBlocks = availableBlocks.filter((b) => {
        const isMapped = mappedBlockKeys.has(b.key);

        const matchesSearch =
            b.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = !categoryFilter || b.categoryName === categoryFilter;

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'found' && isMapped) ||
            (statusFilter === 'missing' && !isMapped);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="min-w-[320px]">
            {/* Filters */}

            <div className="grid grid-cols-2 gap-2 p-2">
                <FloatingSelect
                    placeholder="Category"
                    isHideSearchInput
                    options={categories}
                    value={categoryFilter || 'all'}
                    classNames={{
                        wrapper: 'w-full',
                        trigger: 'h-8 min-h-8',
                        optionItem: 'text-xs',
                    }}
                    onChange={(selectedValue) => {
                        const value = selectedValue?.toString() ?? 'all';
                        setCategoryFilter(value === 'all' ? '' : value);
                    }}
                />

                <FloatingSelect
                    placeholder="Status"
                    isHideSearchInput
                    options={[
                        { value: 'all', label: 'All' },
                        { value: 'found', label: 'Found' },
                        { value: 'missing', label: 'Missing' },
                    ]}
                    value={statusFilter}
                    classNames={{
                        wrapper: 'w-full',
                        trigger: 'h-8 min-h-8',
                        optionItem: 'text-xs',
                    }}
                    onChange={(selectedValue) => {
                        setStatusFilter(selectedValue?.toString() ?? 'all');
                    }}
                />
            </div>

            {/* Table Container */}
            <div className="h-[calc(100vh-220px)] overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-2 border-b">Key</th>
                            <th className="p-2 border-b">Category</th>
                            <th className="p-2 border-b">Status</th>
                            <th className="p-2 border-b">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBlocks.map((block, i) => {
                            const isMapped = mappedBlockKeys.has(block.key);
                            const svgEl = svgElements.find((el) => {
                                const keys =
                                    el.element
                                        .getAttribute('data-block-key')
                                        ?.split(',')
                                        .map((k) => k.trim()) || [];
                                return keys.includes(block.key);
                            });

                            return (
                                <tr
                                    key={i}
                                    className={`hover:bg-blue-100 border-b cursor-pointer transition-colors ${isMapped ? 'bg-blue-50/50' : 'bg-red-50/50'}`}
                                    onMouseEnter={() => highlightElement(svgEl?.element || null)}
                                    onMouseLeave={() => clearHighlight(svgEl?.element || null)}
                                >
                                    <td className="p-2 font-mono font-bold">{block.key}</td>
                                    <td className="p-2 text-[10px] text-gray-600">
                                        {block.categoryName}
                                    </td>
                                    <td className="p-2">
                                        {isMapped ? (
                                            <span className="text-green-600 font-bold px-1 rounded bg-green-100 text-[9px]">
                                                FOUND
                                            </span>
                                        ) : (
                                            <span className="text-red-600 font-bold italic px-1 rounded bg-red-100 text-[9px]">
                                                MISSING
                                            </span>
                                        )}
                                    </td>
                                    <td>{block.price}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
