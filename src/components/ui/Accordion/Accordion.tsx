import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

const Accordion = ({ className, ...props }: AccordionPrimitive.Root.Props) => (
    <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn(
            'flex w-full flex-col rounded-2xl border-border border shadow-xs overflow-hidden',
            className
        )}
        {...props}
    />
);

const AccordionItem = ({ className, ...props }: AccordionPrimitive.Item.Props) => (
    <AccordionPrimitive.Item
        data-slot="accordion-item"
        className={cn('border-border relative border-none not-last:border-b', className)}
        {...props}
    />
);

const AccordionTrigger = ({ children, className, ...props }: AccordionPrimitive.Trigger.Props) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            data-slot="accordion-trigger"
            className={cn(
                'group/accordion-trigger h-14 min-h-14 flex flex-1 items-center justify-between gap-2 p-4 text-start text-base font-medium transition-colors outline-none hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-ring aria-disabled:pointer-events-none aria-disabled:opacity-50',
                className
            )}
            {...props}
        >
            {children}
            <ChevronDownIcon className="text-muted-foreground pointer-events-none ms-auto size-4 shrink-0 transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-180" />
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
);

const AccordionContent = ({ children, className, ...props }: AccordionPrimitive.Panel.Props) => (
    <AccordionPrimitive.Panel
        data-slot="accordion-content"
        className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
        {...props}
    >
        <div
            className={cn(
                'h-(--accordion-panel-height) p-4 data-ending-style:h-0 data-starting-style:h-0',
                className
            )}
        >
            {children}
        </div>
    </AccordionPrimitive.Panel>
);

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
