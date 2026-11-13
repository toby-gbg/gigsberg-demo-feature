import { EventDetail } from '@/interfaces/Event';

interface Props {
    eventDetail: EventDetail;
}

export default function DebugHeader({ eventDetail }: Props) {
    const { id, svgFilePath, name } = eventDetail;
    const items = [
        {
            label: 'Listing:',
            value: id,
        },
        { label: 'Event name:', value: name },
        {
            label: 'Svg path:',
            value: (
                <a
                    target="_blank"
                    className="underline text-blue-500"
                    href={`https://www.gigsberg.com/files/images/venues/svg/${svgFilePath}`}
                >
                    {svgFilePath}
                </a>
            ),
        },
    ];

    return (
        <div className="px-4 py-2 border-b-2">
            <h2 className="text-lg font-bold">Map Debugger</h2>

            <div className="py-1 text-xs flex items-center gap-5">
                {items.map((item) => (
                    <div key={item.label}>
                        <strong>{item.label}</strong> {item.value}
                    </div>
                ))}
            </div>
        </div>
    );
}
