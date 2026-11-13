'use client';

import { useMemo } from 'react';
import JsonView from '@uiw/react-json-view';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';

import { containsSearchTerm, highlightText } from './highlight';

export default function JsonBlock({
    value,
    collapsed = 2,
    search = '',
}: {
    value: unknown;
    collapsed?: number;
    search?: string;
}) {
    const hasSearch = search.length > 0;

    const rendered = useMemo(() => {
        if (!hasSearch) {
            return (
                <JsonView
                    value={value as object}
                    style={{ fontSize: '12px', ...githubDarkTheme }}
                    collapsed={collapsed}
                    displayDataTypes={false}
                    highlightUpdates={false}
                />
            );
        }

        const renderString = ({
            children,
            ...props
        }: { children?: React.ReactNode } & Record<string, unknown>) => {
            const text =
                typeof children === 'string' || typeof children === 'number'
                    ? String(children)
                    : '';
            return (
                <span {...props}>&quot;{highlightText(text.replace(/"/g, ''), search)}&quot;</span>
            );
        };

        const renderNumber = ({
            children,
            ...props
        }: { children?: React.ReactNode } & Record<string, unknown>) => {
            return <span {...props}>{highlightText(String(children), search)}</span>;
        };

        const renderKey = ({
            children,
            ...props
        }: { children?: React.ReactNode } & Record<string, unknown>) => {
            const keyName = String(children);
            const highlighted = highlightText(keyName, search);
            return (
                <span {...props}>
                    {highlighted}
                    <span className="mr-1">:</span>
                </span>
            );
        };

        return (
            <JsonView
                value={value as object}
                style={{ fontSize: '12px', ...githubDarkTheme }}
                collapsed={hasSearch ? false : collapsed}
                displayDataTypes={false}
                highlightUpdates={false}
                shouldExpandNodeInitially={(isExpanded, node) => {
                    if (!search) return isExpanded;
                    return containsSearchTerm(node.value, search);
                }}
            >
                <JsonView.KeyName render={renderKey} />
                <JsonView.String render={renderString} />
                <JsonView.Int render={renderNumber} />
            </JsonView>
        );
    }, [value, hasSearch, collapsed, search]);

    return <div key={search || 'no-search'}>{rendered}</div>;
}
