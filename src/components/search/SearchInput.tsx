'use client';

import { ChangeEvent, FC } from 'react';
import { XIcon } from 'lucide-react';

import { Input, type InputProps } from '../ui/Input/Input';

const SearchInput: FC<InputProps & { onClear: () => void }> = ({
    value,
    onChange,
    onClear,
    ...props
}) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
    };

    const handleClear = () => {
        onClear?.();
    };

    return (
        <Input
            {...props}
            suffixIcon={
                value ? (
                    <XIcon
                        className="text-gray-400 cursor-pointer hover:text-gray-600"
                        size={16}
                        onClick={handleClear}
                    />
                ) : undefined
            }
            value={value}
            onChange={handleChange}
        />
    );
};

export default SearchInput;
