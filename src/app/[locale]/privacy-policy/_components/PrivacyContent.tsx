import { ComponentPropsWithoutRef } from 'react';
import type { MDXComponents, MDXContent } from 'mdx/types';

import SideNavContent from '@/components/legal/SideNavContent';
import { mdxComponents } from '@/components/mdx';

const privacyComponents: MDXComponents = {
    h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => {
        const id = String(children)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        return (
            <mdxComponents.h2 id={id} data-legal-heading {...props}>
                {children}
            </mdxComponents.h2>
        );
    },
};

interface PrivacyContentProps {
    Content: MDXContent;
}

const PrivacyContent = ({ Content }: PrivacyContentProps) => (
    <SideNavContent Content={Content} components={privacyComponents} />
);

export default PrivacyContent;
