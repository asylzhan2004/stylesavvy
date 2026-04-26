import { useRef, useCallback } from 'react';

export interface GestureState {
    dragging: boolean;
    startX: number;
    startY: number;
    startElX: number;
    startElY: number;
    startDist: number;
    startScale: number;
    startAngle: number;
    startElRotation: number;
    startElW: number;
    startElH: number;
    pinching: boolean;
}

interface UseTouchGestureOptions {
    onMove?: (dx: number, dy: number) => void;
    onScale?: (scaleDelta: number) => void;
    onRotate?: (angleDelta: number) => void;
}

function getDistance(t0: React.Touch | Touch, t1: React.Touch | Touch) {
    const dx = t1.clientX - t0.clientX;
    const dy = t1.clientY - t0.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getAngle(t0: React.Touch | Touch, t1: React.Touch | Touch) {
    return Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX) * (180 / Math.PI);
}

/**
 * Returns touch event handlers that support:
 * - Single finger drag → onMove(dx, dy)
 * - Two finger pinch  → onScale(delta)
 * - Two finger twist  → onRotate(angleDelta in degrees)
 */
export function useTouchGesture({ onMove, onScale, onRotate }: UseTouchGestureOptions) {
    const state = useRef({
        active: false,
        startX: 0,
        startY: 0,
        prevDist: 0,
        prevAngle: 0,
        pinching: false,
    });

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();
        const s = state.current;
        s.active = true;
        if (e.touches.length === 1) {
            s.pinching = false;
            s.startX = e.touches[0].clientX;
            s.startY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            s.pinching = true;
            s.prevDist = getDistance(e.touches[0], e.touches[1]);
            s.prevAngle = getAngle(e.touches[0], e.touches[1]);
        }
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        const s = state.current;
        if (!s.active) return;
        e.stopPropagation();
        // Only prevent default when actively handling a gesture (pinch/rotate)
        // to avoid blocking native page/sidebar scroll on single-finger touch
        if (s.pinching) {
            e.preventDefault();
        }

        if (e.touches.length === 1 && !s.pinching) {
            const dx = e.touches[0].clientX - s.startX;
            const dy = e.touches[0].clientY - s.startY;
            s.startX = e.touches[0].clientX;
            s.startY = e.touches[0].clientY;
            onMove?.(dx, dy);
        } else if (e.touches.length === 2) {
            s.pinching = true;
            const newDist = getDistance(e.touches[0], e.touches[1]);
            const newAngle = getAngle(e.touches[0], e.touches[1]);

            const distDelta = newDist - s.prevDist;
            const angleDelta = newAngle - s.prevAngle;

            s.prevDist = newDist;
            s.prevAngle = newAngle;

            if (Math.abs(distDelta) > 0.5) {
                // scale: 1px distance = roughly 0.005 scale delta
                onScale?.(distDelta * 0.005);
            }
            if (Math.abs(angleDelta) > 0.3) {
                onRotate?.(angleDelta);
            }
        }
    }, [onMove, onScale, onRotate]);

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();
        if (e.touches.length < 2) {
            state.current.pinching = false;
        }
        if (e.touches.length === 0) {
            state.current.active = false;
        }
    }, []);

    return { onTouchStart, onTouchMove, onTouchEnd };
}
