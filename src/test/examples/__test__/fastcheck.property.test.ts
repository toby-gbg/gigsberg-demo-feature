import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

const defaultNumRuns = process.env.CI ? 200 : 50;
const numRuns = process.env.FAST_CHECK_NUM_RUNS
    ? Number.parseInt(process.env.FAST_CHECK_NUM_RUNS, 10)
    : defaultNumRuns;

describe('String utilities', () => {
    describe('When reversing a string twice', () => {
        it('Then it should return the original string', () => {
            fc.assert(
                fc.property(fc.string(), (s) => {
                    // Arrange
                    // Act
                    const reversedTwice = [...[...s].reverse()].reverse().join('');

                    // Assert
                    expect(reversedTwice).toBe(s);
                }),
                { numRuns }
            );
        });
    });
});
