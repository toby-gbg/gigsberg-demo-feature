'use client';

import { useMemo } from 'react';

import FloatingSelect from '@/components/FloatingSelect';

import { useVenueMapDebug } from '../_providers/VenueMapDebugProvider';

const formatCategory = (name: string) => name.replace(/_/g, ' ');

export default function SvgElements() {
    const {
        svgElements,
        debouncedSearchTerm: searchTerm,
        svgCategoryFilter: categoryFilter,
        setSvgCategoryFilter: setCategoryFilter,
        svgStatusFilter: statusFilter,
        setSvgStatusFilter: setStatusFilter,
        highlightElement,
        clearHighlight,
    } = useVenueMapDebug();

    const categories = useMemo(() => {
        const cats = Array.from(
            new Set(svgElements.map((el) => el.categoryName).filter(Boolean))
        ).sort();

        // Map to objects and prepend the "All" option
        const catOptions = cats.map((cat) => ({
            value: cat,
            label: formatCategory(cat),
        }));

        return [{ value: 'all', label: 'All Categories' }, ...catOptions];
    }, [svgElements]);

    const filteredSvgElements = useMemo(() => {
        return svgElements.filter((el) => {
            const friendlyCategory = formatCategory(el.categoryName);
            const matchesSearch =
                el.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                el.dataName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                el.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                el.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                friendlyCategory.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = !categoryFilter || el.categoryName === categoryFilter;

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'found' && el.hasBlockKey) ||
                (statusFilter === 'missing' && !el.hasBlockKey);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [svgElements, searchTerm, categoryFilter, statusFilter]);

    return (
        <div className="min-w-[400px]">
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
                        { value: 'found', label: 'Mapped' },
                        { value: 'missing', label: 'Unmapped' },
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

            <div className="overflow-y-auto relative h-[calc(100vh-220px)]">
                <table className="w-full text-left text-[11px]">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="p-2 border-b">ID</th>
                            <th className="p-2 border-b">Name</th>
                            <th className="p-2 border-b">Text</th>

                            <th className="p-2 border-b">Raw Category</th>
                            <th className="p-2 border-b">Category</th>
                            <th className="p-2 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSvgElements.map((el, i) => (
                            <tr
                                key={i}
                                className={`hover:bg-green-100 border-b cursor-pointer transition-colors ${el.hasBlockKey ? 'bg-green-50/50' : ''}`}
                                onMouseEnter={() => highlightElement(el.element)}
                                onMouseLeave={() => clearHighlight(el.element)}
                            >
                                <td className="p-2 font-mono leading-tight text-blue-700">
                                    {el.id}
                                </td>
                                <td className="p-2 font-mono leading-tight">
                                    <div className="text-purple-700">{el.dataName}</div>
                                </td>
                                <td className="p-2 font-mono leading-tight">
                                    <div className="text-[10px] text-gray-400 italic">
                                        {el.text && `"${el.text}"`}
                                    </div>
                                </td>
                                <td className="p-2 font-mono text-gray-400 opacity-60">
                                    {el.categoryName}
                                </td>
                                <td className="p-2">
                                    {el.categoryName && (
                                        <div className="text-green-700 font-bold">
                                            {formatCategory(el.categoryName)}
                                        </div>
                                    )}
                                </td>
                                <td className="p-2">
                                    {el.hasBlockKey ? (
                                        <span className="text-green-600 font-bold px-1 rounded bg-green-100 text-[9px]">
                                            MAPPED
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 px-1 rounded bg-gray-100 text-[9px]">
                                            UNMAPPED
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
