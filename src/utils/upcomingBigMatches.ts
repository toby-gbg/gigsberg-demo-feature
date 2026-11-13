import { DateTime } from 'luxon';

export const formatDateTimeUpcomingBigMatches = (date: string, time: string) => {
    const parsedDate = DateTime.fromISO(date).setLocale('en-GB');

    if (!parsedDate.isValid) {
        return {
            date: '',
            weekday: '',
            day: '',
            month: '',
            time: time.slice(0, 5),
        };
    }

    const weekday = parsedDate.toFormat('ccc');
    const monthName = parsedDate.toFormat('LLL');

    return {
        date: parsedDate.toFormat('ccc, d LLL yyyy'),
        weekday,
        day: parsedDate.toFormat('d'),
        month: monthName,
        time: time.slice(0, 5),
    };
};
