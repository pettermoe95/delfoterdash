import { useCookie } from 'react-use';
import { useEffect, useState } from 'react';

/**
 * Automatically converts cookie string to generic type extending string
 * @param name Name/key of stored cookie
 * @param options Allowed cookie values
 * @param defaultValue Default cookie value
 * @returns Validated cookie and setter [typedCookie, setTypedCookie]
 */
export function useTypedOptionsCookie<T extends string>(name: string, options: T[], defaultValue: T) {
    const [cookie, setCookie] = useCookie(name);
    const typedCookie: T = options.includes(cookie as T) ? (cookie as T) : defaultValue;

    function setTypedCookie(value: T) {
        if (options.includes(value)) {
            setCookie(cookie as T);
        }
    }

    return [typedCookie, setTypedCookie];
}

export function useMousePosition(track = true, stopProp = false, preventDefault = false): { x: number; y: number } {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    // Mouse movement listener
    useEffect(() => {
        function handleMouseMove(event: MouseEvent) {
            if (track) {
                setPos({ x: event.clientX, y: event.clientY });
                if (stopProp) {
                    event.stopPropagation();
                }
                if (preventDefault) {
                    event.preventDefault();
                }
            }
        }
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [track, setPos, stopProp, preventDefault]);
    return pos;
}
