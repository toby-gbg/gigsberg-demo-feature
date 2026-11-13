import { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

const contact = (chunks: ReactNode, props?: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
        href="/contact-us"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-[rgb(var(--bg-solid))]"
        {...props}
    >
        {chunks}
    </a>
);
const bold = (chunks: ReactNode, props?: HTMLAttributes<HTMLSpanElement>) => (
    <span className="font-bold" {...props}>
        {chunks}
    </span>
);

export { contact, bold };
