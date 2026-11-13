'use client';

import { ComponentProps, forwardRef } from 'react';
import { Link as IntlLink } from '@/i18n/routing';

type LinkProps = ComponentProps<typeof IntlLink>;

const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
    return <IntlLink ref={ref} {...props} />;
});

Link.displayName = 'Link';

export default Link;
