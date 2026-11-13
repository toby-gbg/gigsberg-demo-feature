'use client';

import React, { useEffect, useRef, useState } from 'react';

type Placement = 'left' | 'right' | 'top' | 'bottom';

interface ResizableDrawerProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    placement?: Placement;
    initialSize?: number;
    minSize?: number;
    maxSize?: number;
    title?: string;
    isOpen?: boolean;
    onOpenChange?: (value: boolean) => void;
}

export default function ResizableDrawer({
    trigger,
    children,
    placement = 'right',
    initialSize = 520,
    minSize = 280,
    maxSize,
    isOpen = false,
    onOpenChange,
}: ResizableDrawerProps) {
    const [open, setOpen] = useState(isOpen);
    const [size, setSize] = useState(initialSize);

    const startPos = useRef(0);
    const startSize = useRef(0);

    const isHorizontal = placement === 'left' || placement === 'right';
    const actualOpen = onOpenChange ? isOpen : open;

    const toggleOpenPanel = () => {
        if (onOpenChange) {
            onOpenChange(!actualOpen);
        } else {
            setOpen((prev) => !prev);
        }
    };

    const resolvedMaxSize =
        maxSize ??
        (typeof window !== 'undefined'
            ? isHorizontal
                ? window.innerWidth * 0.9
                : window.innerHeight * 0.9
            : 1200);

    const startResize = (e: React.PointerEvent) => {
        startPos.current = isHorizontal ? e.clientX : e.clientY;
        startSize.current = size;

        const onMove = (ev: PointerEvent) => {
            const currentPos = isHorizontal ? ev.clientX : ev.clientY;

            let delta = currentPos - startPos.current;

            if (placement === 'right' || placement === 'bottom') {
                delta = -delta;
            }

            const next = Math.min(resolvedMaxSize, Math.max(minSize, startSize.current + delta));

            setSize(next);
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    useEffect(() => {
        if (!actualOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (onOpenChange) {
                    onOpenChange(false);
                } else {
                    setOpen(false);
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [actualOpen, onOpenChange]);

    const panelStyle: React.CSSProperties = isHorizontal ? { width: size } : { height: size };

    const panelPosition =
        placement === 'right'
            ? 'right-0 top-0 h-full'
            : placement === 'left'
              ? 'left-0 top-0 h-full'
              : placement === 'top'
                ? 'top-0 left-0 w-full'
                : 'bottom-0 left-0 w-full';

    const handlePosition =
        placement === 'right'
            ? 'left-0 top-0 h-full w-2 -translate-x-1/2 cursor-col-resize'
            : placement === 'left'
              ? 'right-0 top-0 h-full w-2 translate-x-1/2 cursor-col-resize'
              : placement === 'top'
                ? 'bottom-0 left-0 h-2 w-full translate-y-1/2 cursor-row-resize'
                : 'top-0 left-0 h-2 w-full -translate-y-1/2 cursor-row-resize';

    const handleLine = isHorizontal
        ? 'mx-auto h-full w-1 bg-gray-300 group-hover:bg-blue-500'
        : 'my-auto h-1 w-full bg-gray-300 group-hover:bg-blue-500';

    return (
        <>
            <div onClick={toggleOpenPanel}>{trigger}</div>

            {actualOpen && (
                <div className="fixed inset-0 z-2147483639">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={toggleOpenPanel}
                    />

                    <div
                        className={`absolute bg-white shadow-2xl border ${panelPosition}`}
                        style={panelStyle}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div
                            className={`group absolute ${handlePosition}`}
                            onPointerDown={startResize}
                        >
                            <div className={handleLine} />
                        </div>

                        <button
                            type="button"
                            onClick={toggleOpenPanel}
                            className="rounded p-2 hover:bg-gray-100 absolute right-0 top-0"
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        <div className={isHorizontal ? 'h-screen overflow-auto' : 'overflow-auto'}>
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
