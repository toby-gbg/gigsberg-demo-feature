'use client';

import { ComponentRef, FC, HTMLAttributes, useMemo, useRef } from 'react';

import { L } from '@/interfaces/Language';
import { cn } from '@/lib/cn';

import DropdownToggle, { DropdownToggleProps } from './DropdownToggle';

type WithOnChangeValue =
    | { onChange?: never; value?: never }
    | {
          /* eslint-disable @typescript-eslint/no-explicit-any */
          onChange: (value: any) => void;
          value:
              | [string | number | undefined, string]
              | [string | number | undefined, string][]
              | undefined;
      };

export type DropdownElementProps<D> = D &
    WithOnChangeValue & {
        onClick?: () => void;
        multiple?: boolean;
        initialCurrencyCode?: string;
        initialLanguages?: L;
    };

interface BaseDropdownProps<D> extends Omit<DropdownToggleProps, 'className' | 'onClick'> {
    elements: D[];
    containerClassName?: HTMLAttributes<HTMLDivElement>['className'];
    controlledContentClassName?: HTMLAttributes<HTMLDivElement>['className'];
    Element: FC<D>;
    toggleClassName?: string;
    className?: HTMLAttributes<HTMLUListElement>['className'];
    rightOrLeftMode?: boolean;
    closeOnChoose?: boolean;
    onClick?: () => void;
    multiple?: boolean;
    hideValue?: boolean;
    isControlledSpacing?: boolean;
    initialCurrencyCode?: string;
    initialLanguages?: L;
}

export type DropdownProps<D> = BaseDropdownProps<D> & WithOnChangeValue;

export default function Dropdown<D>({
    className,
    containerClassName,
    toggleClassName,
    controlledContentClassName,
    elements,
    Element,
    onChange,
    value,
    rightOrLeftMode = true,
    closeOnChoose = false,
    onClick,
    multiple,
    title,
    isControlledSpacing = false,
    initialCurrencyCode = 'USD',
    initialLanguages: _,
    ...props
}: DropdownProps<D>) {
    const toggleTrigger = props?.trigger || 'hover';
    const DropdownToggleRef = useRef<ComponentRef<typeof DropdownToggle>>(null);

    const onElementClick = () => {
        if (closeOnChoose) DropdownToggleRef.current?.closeDropdown();
        onClick?.();
    };

    const dropdownElements = useMemo(
        () =>
            elements.map((data, key) => (
                <li key={key}>
                    <Element
                        {...data}
                        onChange={onChange}
                        value={value}
                        onClick={onElementClick}
                        multiple={multiple}
                        initialCurrencyCode={initialCurrencyCode}
                    />
                </li>
            )),
        [elements]
    );

    const dropdownBaseContent = (
        <ul
            className={cn(
                'invisible peer-aria-expanded:visible top-full z-60 absolute gap-2 grid grid-cols-1 bg-white opacity-0 peer-aria-expanded:opacity-100 shadow-xl p-2 rounded-lg w-88 max-h-120 overflow-y-auto text-black transition-all duration-300 ease-in-out',
                className,
                {
                    'ltr:right-0 rtl:left-0': rightOrLeftMode,
                }
            )}
        >
            {dropdownElements}
        </ul>
    );

    // note: solution to add more space between trigger and content is adding padding
    const dropdownControlledContent = (
        <div
            className={cn(
                'invisible peer-aria-expanded:visible z-271 xl:z-60 absolute bg-transparent opacity-0 peer-aria-expanded:opacity-100 pt-2 rounded-lg min-w-92 max-w-max max-h-120 transition-all duration-300 ease-in-out max-[1280px]:pointer-events-none',
                { 'ltr:right-0 rtl:left-0': rightOrLeftMode },
                controlledContentClassName
            )}
        >
            <ul
                className={cn(
                    'gap-2 grid grid-cols-1 bg-white shadow-xl p-2 rounded-lg w-full h-full overflow-y-auto text-black pointer-events-auto',
                    className,
                    { 'ltr:right-0 rtl:left-0': rightOrLeftMode }
                )}
            >
                {dropdownElements}
            </ul>
        </div>
    );

    return (
        <div
            className={cn('relative dropdown-trigger', containerClassName)}
            onMouseLeave={() =>
                toggleTrigger === 'click' ? null : DropdownToggleRef.current?.closeDropdown()
            }
            onBlur={() =>
                toggleTrigger === 'hover' ? null : DropdownToggleRef.current?.closeDropdown()
            }
        >
            <DropdownToggle
                ref={DropdownToggleRef}
                className={toggleClassName}
                value={value}
                title={title}
                {...props}
            />

            {isControlledSpacing ? dropdownControlledContent : dropdownBaseContent}
        </div>
    );
}
