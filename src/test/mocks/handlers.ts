import { http, HttpResponse } from 'msw';

export const handlers = [
    http.get('*/api/health', () => HttpResponse.json({ ok: true })),
    http.get('*/api/users', () =>
        HttpResponse.json([
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Doe' },
        ])
    ),
    http.get('https://api.example.com/users', () =>
        HttpResponse.json([
            { id: 1, name: 'Server Alice' },
            { id: 2, name: 'Server Bob' },
        ])
    ),
    http.get('https://api.example.com/users/:id', ({ params }) => {
        const { id } = params;
        return HttpResponse.json({ name: `User ${id}` });
    }),
];
