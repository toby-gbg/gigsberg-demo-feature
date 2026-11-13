import { DirectionProvider, TextDirection } from '@base-ui/react';
import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from '@/lib/cn';

interface RangeProps extends SliderPrimitive.Root.Props {
    isGradient?: boolean;
    formatValue?: (value: number) => string;
    dir?: TextDirection;
}

const Range = ({
    className,
    defaultValue,
    formatValue,
    isGradient = false,
    max = 100,
    min = 0,
    value,
    ...props
}: RangeProps) => {
    const values = Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max];

    return (
        <DirectionProvider direction={props?.dir ?? 'ltr'}>
            <SliderPrimitive.Root
                data-slot="range"
                className={cn('data-horizontal:w-full data-vertical:h-full', className)}
                defaultValue={defaultValue}
                max={max}
                min={min}
                value={value}
                {...props}
            >
                <SliderPrimitive.Control
                    className={cn(
                        'relative flex w-full touch-none items-center select-none',
                        'data-disabled:opacity-50',
                        'data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col'
                    )}
                >
                    <SliderPrimitive.Track
                        data-slot="range-track"
                        className={cn(
                            'relative grow overflow-hidden rounded-xl bg-gray-200 select-none',
                            'data-horizontal:h-2 data-horizontal:w-full',
                            'data-vertical:h-full data-vertical:w-2'
                        )}
                    >
                        <SliderPrimitive.Indicator
                            data-slot="range-indicator"
                            className={cn(
                                'select-none',
                                'data-horizontal:h-full data-vertical:w-full',
                                'rtl:origin-right ltr:origin-left',
                                isGradient ? 'bg-gradient' : 'bg-solid'
                            )}
                        />
                    </SliderPrimitive.Track>
                    {Array.from({ length: values.length }, (_, index) => (
                        <SliderPrimitive.Thumb
                            data-slot="range-thumb"
                            key={index}
                            index={index}
                            className={({ activeThumbIndex }) =>
                                cn(
                                    'group block size-4 shrink-0 select-none rounded-lg border-2 border-solid bg-white shadow-sm',
                                    'ring-ring/50 transition-[color,box-shadow,transform]',
                                    'hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden',
                                    isGradient
                                        ? 'bg-gradient hover:ring-main-start/20 focus-visible:ring-main-start/20'
                                        : 'bg-solid hover:ring-solid/20 focus-visible:ring-solid/20',
                                    'data-dragging:scale-90 disabled:pointer-events-none disabled:opacity-50',
                                    activeThumbIndex === index && 'group/active-thumb'
                                )
                            }
                        >
                            <SliderPrimitive.Value
                                className={cn(
                                    'pointer-events-none absolute top-full start-1/2 z-1000 mt-2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
                                    'rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-sm',
                                    isGradient ? 'bg-gradient' : 'bg-solid',
                                    'opacity-0 transition-opacity',
                                    'group-hover:opacity-100 group-has-[:focus-visible]:opacity-100',
                                    'group-data-dragging/active-thumb:opacity-100'
                                )}
                            >
                                {(formattedValues, rawValues) =>
                                    formatValue
                                        ? formatValue(rawValues[index])
                                        : formattedValues[index]
                                }
                            </SliderPrimitive.Value>
                        </SliderPrimitive.Thumb>
                    ))}
                </SliderPrimitive.Control>
            </SliderPrimitive.Root>
        </DirectionProvider>
    );
};

export { Range };
