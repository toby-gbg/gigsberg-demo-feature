import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// --- Server Component ---
async function ServerUserList() {
    /* NOTE: If you want to use relative URL:
     * Approach 1: Patch fetch to make relative URL work in Node
     * Approach 2: Change to use ENV variable for the base URL
     */
    const res = await fetch('https://api.example.com/users', { cache: 'no-store' });
    const users: { id: number; name: string }[] = await res.json();

    return (
        <section>
            <h1>Server Users</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </section>
    );
}

// --- Test ---
describe('ServerUserList', () => {
    describe('When the server component fetches data #api', () => {
        it('should render the users correctly', async () => {
            // Arrange
            // (MSW handler is globally set up in src/test/mocks/handlers.ts)

            // Act
            const ResolvedComponent = await ServerUserList();
            render(ResolvedComponent);

            // Assert
            expect(screen.getByText('Server Users')).toBeInTheDocument();
            const listItems = screen.getAllByRole('listitem');
            expect(listItems).toHaveLength(2);
            expect(screen.getByText('Server Alice')).toBeInTheDocument();
            expect(screen.getByText('Server Bob')).toBeInTheDocument();
        });
    });
});
