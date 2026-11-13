'use client';

import { useState } from 'react';
import classNames from 'classnames';
import { Check, Copy } from 'lucide-react';

import { highlightText } from './highlight';

export default function CodeBlock({
    children,
    className,
    search = '',
}: {
    children: string;
    className?: string;
    search?: string;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };
    return (
        <div className="group relative">
            <pre
                className={classNames(
                    'bg-black/45 p-2 rounded font-mono break-all whitespace-pre-wrap',
                    className
                )}
            >
                {highlightText(children, search)}
            </pre>

            <button className="absolute top-1 right-1 hidden group-hover:block bg-white p-1 rounded">
                {copied ? (
                    <Check size={14} className="text-green-600" />
                ) : (
                    <Copy size={14} className="stroke-black" onClick={handleCopy} />
                )}
            </button>
        </div>
    );
}
