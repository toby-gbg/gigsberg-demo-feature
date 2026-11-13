import { notFound } from 'next/navigation';

import Headers from '@/lib/headers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const domainInfo = await Headers.getDomainInfo();
    if (!domainInfo.config?.features?.showStudentDiscount) {
        return notFound();
    }
    return children;
}
