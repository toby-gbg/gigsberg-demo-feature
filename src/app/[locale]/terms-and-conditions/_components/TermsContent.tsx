import { ComponentPropsWithoutRef } from 'react';
import { Check } from 'lucide-react';
import type { MDXComponents, MDXContent } from 'mdx/types';

import { cn } from '@/lib/cn';

import SideNavContent from '@/components/legal/SideNavContent';
import { mdxComponents } from '@/components/mdx';

import { getTermsHeadingId } from './terms';

const termsComponents: MDXComponents = {
    h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => {
        const title = String(children);

        return (
            <mdxComponents.h2 id={getTermsHeadingId(title)} data-legal-heading {...props}>
                {children}
            </mdxComponents.h2>
        );
    },
    blockquote: ({ children, className, ...props }) => (
        <blockquote
            id="buyer-guarantee"
            className={cn(
                'relative my-8 rounded-lg border border-[#8ab9ef] border-l-4 border-l-[#1565c0] bg-[#eef6ff] px-5 py-5 md:px-6 [&>h3]:mt-1 [&>h3]:mb-4 [&>h3]:ml-10 [&>h3]:text-base [&>h3]:leading-snug [&>p]:mt-3 [&>p]:text-sm [&>p]:leading-[1.5] [&>p:first-of-type]:mt-0 [&>p:first-of-type]:ml-10 [&>p:first-of-type]:text-[10px] [&>p:first-of-type]:leading-4 [&>p:first-of-type]:font-bold [&>p:first-of-type]:tracking-[0.14em] [&>p:first-of-type]:text-[#165ca8] [&>p:first-of-type]:uppercase',
                className
            )}
            {...props}
        >
            <span
                aria-hidden="true"
                className="absolute top-5 left-5 flex size-8 items-center justify-center rounded-lg bg-[#1565c0] text-white md:left-6"
            >
                <Check className="size-5 stroke-[3]" />
            </span>
            {children}
        </blockquote>
    ),
    SellerPolicies: ({ children }: { children?: React.ReactNode }) => (
        <section
            data-legal-group="secondary"
            className="mt-14 border-t-4 border-header-start pt-1 [&>h2:first-child]:border-0 [&>h2:first-child]:pt-8 [&>h2:first-child]:text-3xl"
        >
            {children}
        </section>
    ),
};

interface TermsContentProps {
    Content: MDXContent;
}

const TermsContent = ({ Content }: TermsContentProps) => (
    <SideNavContent Content={Content} components={termsComponents} />
);

export default TermsContent;
