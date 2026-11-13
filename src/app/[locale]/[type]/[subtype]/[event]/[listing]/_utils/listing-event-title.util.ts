import { EventDetail, EventDetailPerformer } from '@/interfaces/Event';

export type LinkablePerformer = {
    name: string;
    href: string;
};

export type EventTitleSegment =
    { type: 'text'; value: string } | { type: 'link'; value: string; href: string };

/**
 * Get performers that can be rendered as links.
 *
 * New events use `performers[]`, while older events use
 * `performer1` / `performer2`.
 *
 * Performers without a name or URL are ignored.
 */
export const getLinkablePerformers = (eventDetails: EventDetail): LinkablePerformer[] => {
    const performers: (EventDetailPerformer | null | undefined)[] = eventDetails.performers?.length
        ? eventDetails.performers
        : [eventDetails.performer1, eventDetails.performer2];

    return performers.flatMap((performer) => {
        if (!performer?.name || !performer.url) {
            return [];
        }

        return [
            {
                name: performer.name,
                href: performer.url,
            },
        ];
    });
};

/**
 * Escape special characters so a string can be safely used inside a RegExp.
 *
 * For example:
 *
 *   AC/DC (Live) -> AC/DC \(Live\)
 */
export const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Normalize a string for case-insensitive and accent-insensitive matching.
 *
 * For example:
 *
 *   Beyoncé -> beyonce
 *   Atlético -> atletico
 *
 * The original string is always preserved for rendering.
 *
 * We assume that removing diacritics does not change the string length
 * for the performer/title names we receive. This allows normalized match
 * positions to be used directly on the original title.
 */
export const normalize = (value: string): string =>
    value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

/**
 * Build a regex that matches performer names as standalone words.
 *
 * Unicode letter/number boundaries are used instead of `\b` so that
 * non-ASCII characters are handled correctly.
 *
 * Longer names are matched first to prevent a shorter name from consuming
 * part of a longer name.
 *
 * Example:
 *
 *   ["team", "team united"]
 *
 *   "the team united wins" -> "team united"
 */
export const buildPerformerNameSplitter = (names: string[]): RegExp | null => {
    if (names.length === 0) {
        return null;
    }

    const sortedNames = [...names].sort((a, b) => b.length - a.length);

    const escapedNames = sortedNames.map(escapeRegExp).join('|');

    return new RegExp(`(?<![\\p{L}\\p{N}])(${escapedNames})(?![\\p{L}\\p{N}])`, 'giu');
};

/**
 * Split an event title into text and performer-link segments.
 *
 * The title is normalized only for matching. When creating the result,
 * the original title is used so the displayed text keeps its original
 * casing, accents and formatting.
 * How it works:
 *
 * 1. Get the linkable performers (those with a url). If there are none,
 *    return the whole title as a single text segment.
 * 2. Build a regex that matches any performer name (normalized) as a
 *    standalone word.
 * 3. Run that regex against the NORMALIZED title to find match positions, but
 *    always `slice` the ORIGINAL title (preserving the user's original
 *    accents/casing) when building segments — this works because normalizing
 *    doesn't change string length (see `normalize`'s doc comment for the caveat).
 * 4. Any title text between matches (or before/after all matches) becomes a
 *    plain text segment.
 *
 * @example
 * getEventTitleSegments('Beyoncé vs Jay-Z: The Showdown', {
 *   performers: [
 *     { name: 'Beyoncé', url: '/artists/beyonce' },
 *     { name: 'Jay-Z', url: '/artists/jayz' },
 *   ],
 * });
 * // => [
 * //   { type: 'link', value: 'Beyoncé', href: '/artists/beyonce' },
 * //   { type: 'text', value: ' vs ' },
 * //   { type: 'link', value: 'Jay-Z', href: '/artists/jayz' },
 * //   { type: 'text', value: ': The Showdown' },
 * // ]
 *
 * @example
 * // No matching performer in the title -> whole title stays as text
 * getEventTitleSegments('Mystery Guest Night', {
 *   performers: [{ name: 'Beyoncé', url: '/artists/beyonce' }],
 * });
 * // => [{ type: 'text', value: 'Mystery Guest Night' }]
 */
export const getEventTitleSegments = (
    title: string,
    eventDetails: EventDetail
): EventTitleSegment[] => {
    const performers = getLinkablePerformers(eventDetails);

    if (performers.length === 0) {
        return [{ type: 'text', value: title }];
    }

    const splitter = buildPerformerNameSplitter(
        performers.map((performer) => normalize(performer.name))
    );

    if (!splitter) {
        return [{ type: 'text', value: title }];
    }

    const normalizedTitle = normalize(title);
    const segments: EventTitleSegment[] = [];

    /**
     * Match against the normalized title, but slice the original title
     * so the rendered value keeps its original spelling.
     */
    let cursor = 0;

    for (const match of normalizedTitle.matchAll(splitter)) {
        const performer = performers.find((performer) => normalize(performer.name) === match[0]);

        if (!performer) {
            continue;
        }

        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;

        // Add text between the previous match and this performer.
        if (cursor < matchStart) {
            segments.push({
                type: 'text',
                value: title.slice(cursor, matchStart),
            });
        }

        // Use the original title so accents and casing are preserved.
        segments.push({
            type: 'link',
            value: title.slice(matchStart, matchEnd),
            href: performer.href,
        });

        cursor = matchEnd;
    }

    // Add any text after the last performer.
    if (cursor < title.length) {
        segments.push({
            type: 'text',
            value: title.slice(cursor),
        });
    }

    return segments;
};
