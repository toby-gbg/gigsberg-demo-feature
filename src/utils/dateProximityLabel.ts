import { DateTime } from 'luxon';

/**
 * Proximity labels for events (used for "Today", "Tomorrow", etc. badges)
 */
export type ProximityLabel = 'today' | 'tomorrow' | 'this_weekend' | 'next_week';

export type ProximityLabelColor = 'red' | 'orange' | 'blue' | 'teal';

/**
 * English fallback texts in case translations are missing
 */
export const PROXIMITY_LABEL_FALLBACKS: Record<ProximityLabel, string> = {
    today: 'Today',
    tomorrow: 'Tomorrow',
    this_weekend: 'This Weekend',
    next_week: 'Next Week',
};

/**
 * Computes a proximity label for an event based on how close it is to today.
 *
 * Priority order (only one label is returned):
 * 1. Today
 * 2. Tomorrow
 * 3. This Weekend (upcoming Saturday or Sunday)
 * 4. Next Week (Monday to Sunday of the following week)
 *
 * Events further than "next week" return `null`.
 *
 * @param eventDate - Date string in either "dd/MM/yyyy" or "yyyy-MM-dd" format
 * @param eventTime - Time string in "HH:mm" format (default: "00:00")
 * @param timezone - Optional IANA timezone (e.g. "Asia/Bangkok", "Europe/London")
 *                   If not provided, uses the local timezone.
 * @returns ProximityLabel or null if no label applies
 */
export function getDateProximityLabel(
    eventDate: string,
    eventTime: string = '00:00',
    timezone?: string
): ProximityLabel | null {
    // Detect date format
    const isDDMMYYYY = /^\d{2}\/\d{2}\/\d{4}$/.test(eventDate?.trim());
    const dateFormat = isDDMMYYYY ? 'dd/MM/yyyy' : 'yyyy-MM-dd';

    // Detect time format (HH:mm or HH:mm:ss)
    const isFullTime = /^\d{2}:\d{2}:\d{2}$/.test(eventTime.trim());
    const timeFormat = isFullTime ? 'HH:mm:ss' : 'HH:mm';

    const fullFormat = `${dateFormat} ${timeFormat}`;

    // Parse datetime
    let dt = DateTime.fromFormat(`${eventDate} ${eventTime}`, fullFormat, {
        zone: timezone || 'local',
    });

    // Fallback parsing in case format detection fails
    if (!dt.isValid) {
        const fallbackFormat = isDDMMYYYY ? 'yyyy-MM-dd' : 'dd/MM/yyyy';
        dt = DateTime.fromFormat(`${eventDate} ${eventTime}`, `${fallbackFormat} HH:mm`, {
            zone: timezone || 'local',
        });
    }

    // Invalid date → return null
    if (!dt.isValid) {
        return null;
    }

    // Normalize to start of day for comparison
    const eventDay = dt.startOf('day');
    const now = DateTime.now()
        .setZone(dt.zoneName || 'local')
        .startOf('day');

    // Calculate difference in days
    const diffDays = Math.floor(eventDay.diff(now, 'days').days);

    // ── Priority Checks ─────────────────────────────────────

    // Priority 1: Today
    if (diffDays === 0) return 'today';

    // Priority 2: Tomorrow
    if (diffDays === 1) return 'tomorrow';

    // Priority 3: This Weekend (Sat or Sun)
    const eventWeekday = dt.weekday; // Luxon: 1=Monday, 6=Saturday, 7=Sunday
    const currentWeekday = now.weekday;

    if (eventWeekday === 6 || eventWeekday === 7) {
        const daysToWeekend = eventWeekday === 6 ? 6 - currentWeekday : 7 - currentWeekday;

        // Only show if the weekend is upcoming (not in the past)
        if (daysToWeekend >= 0 && diffDays === daysToWeekend) {
            return 'this_weekend';
        }
    }

    // Priority 4: Next Week (full calendar week: Mon–Sun)
    const nextWeekStart = now.plus({ weeks: 1 }).startOf('week');
    const nextWeekEnd = nextWeekStart.plus({ days: 6 });

    if (eventDay >= nextWeekStart && eventDay <= nextWeekEnd) {
        return 'next_week';
    }

    // Too far in the future → no label
    return null;
}
