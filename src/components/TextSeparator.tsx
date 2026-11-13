'use client';

import { FC } from 'react';

interface TextSeparatorProps {
    title: string;
}

const TextSeparator: FC<TextSeparatorProps> = ({ title }) => {
    return (
        <div className="col-span-12 mb-5 mt-2">
            <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="mx-4 text-sm text-gray-600 font-semibold">{title}</span>
                <div className="flex-1 h-px bg-gray-300"></div>
            </div>
        </div>
    );
};

export default TextSeparator;
