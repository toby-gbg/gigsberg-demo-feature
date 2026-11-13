import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

function TinyGreeting({ name }: { name: string }) {
    return <p>Hello, {name}</p>;
}

describe('TinyGreeting component', () => {
    describe('When a name is provided', () => {
        it('Then it should render the greeting correctly', () => {
            // Arrange
            const name = 'World';

            // Act
            render(<TinyGreeting name={name} />);

            // Assert
            expect(screen.getByText(`Hello, ${name}`)).toBeInTheDocument();
        });
    });
});
