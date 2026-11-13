import { eventApi } from '@/services/server/events';

import Link from '@/components/Link';

interface FooterEventsProps {
    isFeatured?: boolean;
}

export default async function FooterEvents({ isFeatured = false }: FooterEventsProps) {
    const footerEvents = await eventApi.getFooterEvents();

    const events = isFeatured ? footerEvents?.featureEvents : footerEvents?.popularEvents;

    return (
        <>
            {events?.map((event) => (
                <li key={`event-${event.id}`}>
                    <Link
                        prefetch={false}
                        href={event.url}
                        className="inline-block py-1.5 hover:underline hover:underline-offset-4"
                    >
                        {event.name}
                    </Link>
                </li>
            ))}
        </>
    );
}
