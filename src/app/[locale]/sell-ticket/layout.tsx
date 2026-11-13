import { notFound } from 'next/navigation';

import Headers from '@/lib/headers';
import { userApi } from '@/services/server/users';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const { config } = await Headers.getDomainInfo();
    if (config?.features?.disableTicketSelling) return notFound();

    const user = await userApi.getCurrentUser();
    if (user?.is_blocked) return notFound();

    return children;
}
