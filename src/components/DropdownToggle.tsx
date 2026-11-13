'use client';

import {
    AnchorHTMLAttributes,
    forwardRef,
    ForwardRefRenderFunction,
    HTMLAttributes,
    KeyboardEvent,
    MouseEvent,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';
import Image from 'next/image';
import { useStore } from '@nanostores/react';
import { ChevronDown, LucideIcon } from 'lucide-react';

import { $isOpenMobileMenu } from '@/stores/modal';
import { cn } from '@/lib/cn';

import Link from '@/components/Link';

export interface DropdownToggleProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    trigger?: 'click' | 'hover';
    title: string;
    showArrow?: boolean;
    iconSrc?: string | null;
    Icon?: LucideIcon;
    symbol?: string;
    template?: 'regular' | 'filter';
    value?: [string | number | undefined, string] | [string | number | undefined, string][];
    preventClick?: boolean;
    onToggleOpen?: (isOpen: boolean) => void;
    'aria-label'?: string;
    hideValue?: boolean;
    isGradient?: boolean;
}

interface DropdownToggleMethods {
    closeDropdown: () => void;
}

const DropdownToggleContent = ({
    title,
    iconSrc,
    Icon,
    symbol,
    value,
    showArrow,
    isOpen,
}: Pick<DropdownToggleProps, 'title' | 'iconSrc' | 'Icon' | 'symbol' | 'value' | 'showArrow'> & {
    isOpen: boolean;
}) => {
    return (
        <>
            <div className="flex items-center gap-x-2">
                {iconSrc ? (
                    <Image
                        src={iconSrc}
                        alt={`${title} icon`}
                        width={20}
                        height={15}
                        className="object-cover shrink-0"
                    />
                ) : symbol ? (
                    <span className="text-base">{symbol}</span>
                ) : Icon ? (
                    <Icon size={16} />
                ) : null}

                {!!(title || value) && (
                    <span className="max-[1475px]:text-xs capitalize">
                        {value && !Array.isArray(value[0]) ? value[1] : title}
                        {value &&
                            Array.isArray(value[0]) &&
                            value.length > 0 &&
                            ` (${value.length})`}
                    </span>
                )}
            </div>

            {showArrow && (
                <ChevronDown
                    size={16}
                    className={cn('transition-transform duration-300 shrink-0', {
                        'rotate-180': isOpen,
                    })}
                />
            )}
        </>
    );
};

const DropdownToggle: ForwardRefRenderFunction<DropdownToggleMethods, DropdownToggleProps> = (
    {
        trigger = 'hover',
        showArrow = false,
        title,
        iconSrc,
        Icon,
        symbol,
        className,
        href = '#!',
        template = 'regular',
        value,
        onToggleOpen,
        'aria-label': ariaLabelProp,
        hideValue = false,
        isGradient = false,
        ...props
    },
    ref
) => {
    const isOpenParent = useStore($isOpenMobileMenu);
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = (e: KeyboardEvent | MouseEvent) => {
        e.preventDefault();
        setIsOpen((prev) => !prev);
    };

    const closeDropdown = () => setIsOpen(false);

    useImperativeHandle(ref, () => ({
        closeDropdown,
    }));

    useEffect(() => {
        onToggleOpen?.(isOpen);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpenParent) closeDropdown();
    }, [isOpenParent]);

    const commonClasses = cn(
        'peer flex justify-between items-center gap-x-2 text-sm transition-all cursor-pointer',
        {
            'text-on-header': template === 'regular',
            'border border-zinc-300 py-2 px-5': template === 'filter',
            'bg-gradient text-on-main': template === 'filter' && value && isGradient,
            'bg-solid text-on-solid': template === 'filter' && value && !isGradient,
            'bg-zinc-200 text-zinc-500': template === 'filter' && !value,
        },
        className
    );

    if (href === '#!' || trigger === 'click') {
        // Use provided aria-label or determine it from the visible text
        let ariaLabel: string = ariaLabelProp || title;

        if (!ariaLabelProp && value) {
            if (Array.isArray(value[0]) && value.length > 0) {
                // Multiple values selected
                ariaLabel = `${title} (${value.length})`;
            } else if (!Array.isArray(value[0]) && typeof value[1] === 'string') {
                // Single value selected
                ariaLabel = value[1];
            }
        }

        return (
            <div
                className={commonClasses}
                role="button"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
                tabIndex={0}
                onClick={(e) => toggleDropdown(e as MouseEvent)}
                onMouseEnter={() => trigger === 'hover' && setIsOpen((prev) => !prev)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDropdown(e);
                    }
                }}
                {...(props as HTMLAttributes<HTMLDivElement>)}
            >
                <DropdownToggleContent
                    title={hideValue ? '' : title}
                    value={hideValue ? undefined : value}
                    iconSrc={iconSrc}
                    Icon={Icon}
                    symbol={symbol}
                    showArrow={showArrow}
                    isOpen={isOpen}
                />
            </div>
        );
    }

    return (
        <Link
            prefetch={false}
            href={href}
            className={commonClasses}
            aria-expanded={isOpen}
            onMouseEnter={() => trigger === 'hover' && setIsOpen((prev) => !prev)}
            {...props}
        >
            <DropdownToggleContent
                title={hideValue ? '' : title}
                value={hideValue ? undefined : value}
                iconSrc={iconSrc}
                Icon={Icon}
                symbol={symbol}
                showArrow={showArrow}
                isOpen={isOpen}
            />
        </Link>
    );
};

export default forwardRef(DropdownToggle);
