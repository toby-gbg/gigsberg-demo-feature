'use client';

import { useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// --- Client Component ---
function ClientUserList() {
    const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/users')
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div role="status">Loading...</div>;

    return (
        <ul>
            {users.map((user) => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
}

// --- Test ---
describe('ClientUserList', () => {
    describe('When the component mounts #api', () => {
        it('should display the list of users fetched from the API', async () => {
            // Arrange
            // Act
            render(<ClientUserList />);

            // Assert
            const listItems = await screen.findAllByRole('listitem');

            expect(listItems).toHaveLength(2);
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        });
    });
});
