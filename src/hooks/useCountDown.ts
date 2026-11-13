import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
    duration: number;
    warningAt?: number;
    onWarning?: () => void;
    onExpire?: () => void;
    autoStart?: boolean;
}

export function useCountdown({
    duration,
    warningAt,
    onWarning,
    onExpire,
    autoStart = true,
}: Props) {
    const expiresAtRef = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [secondsLeft, setSecondsLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(autoStart);

    const hasWarnedRef = useRef(false);

    const calculate = useCallback(() => {
        const remainingMs = expiresAtRef.current - Date.now();
        const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

        setSecondsLeft(remainingSeconds);

        // Warning
        if (warningAt !== undefined && remainingSeconds <= warningAt && !hasWarnedRef.current) {
            hasWarnedRef.current = true;
            onWarning?.();
        }

        // Expire
        if (remainingSeconds <= 0) {
            stop();
            onExpire?.();
        }
    }, [warningAt, onWarning, onExpire]);

    const start = useCallback(() => {
        expiresAtRef.current = Date.now() + duration * 1000;
        hasWarnedRef.current = false;
        setIsRunning(true);
        calculate();

        intervalRef.current && clearInterval(intervalRef.current);
        intervalRef.current = setInterval(calculate, 1000);
    }, [duration, calculate]);

    const stop = useCallback(() => {
        intervalRef.current && clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        stop();
        setSecondsLeft(duration);
        if (autoStart) start();
    }, [duration, autoStart, start, stop]);

    // Auto start
    useEffect(() => {
        if (autoStart) start();
        return stop;
    }, []);

    // Handle tab visibility
    useEffect(() => {
        const sync = () => calculate();
        document.addEventListener('visibilitychange', sync);
        return () => document.removeEventListener('visibilitychange', sync);
    }, [calculate]);

    return {
        secondsLeft,
        isRunning,
        start,
        stop,
        reset,
    };
}
