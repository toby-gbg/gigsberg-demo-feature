import { Plus } from 'lucide-react';

import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/Accordion';

import { useFaqContext } from '../../_providers/FaqContext';
import { FAQCategory } from '../../_types/faq';

export default function FAQSection({ item }: { item: FAQCategory }) {
    const { title, elements } = item;
    const { searchValue } = useFaqContext();

    const displayElements = searchValue.length
        ? elements.filter((faq) =>
              faq.question?.toString().toLowerCase().includes(searchValue.toLowerCase())
          )
        : elements;

    return displayElements.length ? (
        <section key={title?.toString()} className="mt-5">
            <h2 className="mb-2 text-md text-gray-500 font-black uppercase tracking-wide">
                {title}
            </h2>

            <ul className="flex flex-col gap-y-5">
                {displayElements.map(({ question, answer }) => (
                    <li key={question?.toString()}>
                        <Accordion className="border-none shadow-none rounded-xl">
                            <AccordionItem
                                value={question?.toString() ?? ''}
                                className="rounded-xl border data-open:border-solid data-open:border-primary bg-white shadow"
                            >
                                <AccordionTrigger
                                    className="hover:bg-transparent h-auto min-h-0 w-full px-4 py-5 transition aria-expanded:bg-on-header/5 [&>svg]:hidden"
                                    onClick={() => {
                                        GoogleAnalyticsTracker.triggerGA4Event({
                                            event: 'faq_question_expand',
                                            data: {
                                                category: title?.toString(),
                                                question: question?.toString(),
                                            },
                                        });
                                    }}
                                >
                                    <h5 className="text-primary text-lg font-semibold">
                                        {question}
                                    </h5>
                                    <span className="flex size-6 rotate-0 items-center justify-center rounded-lg bg-gray-200 p-1 text-on-header transition-transform group-aria-expanded/accordion-trigger:rotate-45 group-aria-expanded/accordion-trigger:bg-gradient group-aria-expanded/accordion-trigger:text-on-main">
                                        <Plus size={40} strokeWidth={4} />
                                    </span>
                                </AccordionTrigger>

                                <AccordionContent className="pt-0">
                                    <p className="text-gray-700">{answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </li>
                ))}
            </ul>
        </section>
    ) : null;
}
