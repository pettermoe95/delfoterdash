import { mdiDotsHorizontal } from '@mdi/js';
import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { ButtonIcon } from './ButtonIcon';

type MoreMenuProps = { children: ReactNode };

export function MoreMenu({ children }: MoreMenuProps) {
    const menu = useRef<HTMLDetailsElement>(null);
    useEffect(() => {
        const dismissOutside = (event: Event) => {
            if (
                menu.current?.open &&
                event.target instanceof Node &&
                !menu.current.contains(event.target)
            )
                menu.current.open = false;
        };
        const dismissOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && menu.current?.open) {
                event.preventDefault();
                menu.current.open = false;
                menu.current.querySelector('summary')?.focus();
            }
        };
        document.addEventListener('pointerdown', dismissOutside, true);
        document.addEventListener('focusin', dismissOutside);
        document.addEventListener('keydown', dismissOnEscape);
        return () => {
            document.removeEventListener('pointerdown', dismissOutside, true);
            document.removeEventListener('focusin', dismissOutside);
            document.removeEventListener('keydown', dismissOnEscape);
        };
    }, []);
    const closeAfterAction = (event: MouseEvent<HTMLDivElement>) => {
        if (
            event.target instanceof Element &&
            event.target.closest('button:not(:disabled)') &&
            menu.current
        )
            menu.current.open = false;
    };
    return (
        <details className="we-more" ref={menu}>
            <summary>
                <ButtonIcon path={mdiDotsHorizontal} /> More
            </summary>
            <div onClick={closeAfterAction}>{children}</div>
        </details>
    );
}
