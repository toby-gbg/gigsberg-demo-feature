import type { MDXComponents, MDXContent } from 'mdx/types';

interface SideNavContentProps {
    Content: MDXContent;
    components?: MDXComponents;
}

const SideNavContent = ({ Content, components }: SideNavContentProps) => (
    <article
        id="legal-document"
        className="min-w-0 rounded-xl border wrap-anywhere border-[#e1e7f0] bg-white px-5 py-7 leading-[1.7] shadow-[0_1px_2px_rgba(2,45,95,0.05),0_10px_28px_rgba(2,45,95,0.07)] md:px-10.5 md:py-8.5"
    >
        <Content components={components} />
    </article>
);

export default SideNavContent;
