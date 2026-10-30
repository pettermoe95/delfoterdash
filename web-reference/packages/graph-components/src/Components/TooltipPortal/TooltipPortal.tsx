import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './TooltipPortal.module.scss';

/**
 * Lightweight portal container for graph tooltips.
 * Creates a fixed-position overlay div appended to document.body so content isn't clipped
 * by overflow:hidden ancestors. Cleans up on unmount.
 */
const PORTAL_ID = 'graph-tooltips-root';

export const TooltipPortal: React.FC<{
    children: React.ReactNode;
    className?: string;
    /** override stacking order if needed */
    zIndex?: number;
}> = ({ children, className, zIndex = 20000 }) => {
    const [el, setEl] = useState<HTMLDivElement | null>(null);
    const requestedZ = useRef(zIndex);
    requestedZ.current = zIndex;

    useEffect(() => {
        if (el) return; // already mounted
        let root = document.getElementById(PORTAL_ID) as HTMLDivElement | null;
        if (!root) {
            root = document.createElement('div');
            root.id = PORTAL_ID;
            root.dataset.graphTooltip = 'true';
            document.body.appendChild(root);
        }
        // Ensure base class
        if (styles.root) {
            root.classList.add(styles.root);
        }
        if (className) root.classList.add(className);
        // Apply z-index via CSS variable so theme overrides possible
        const existingZ = parseInt(
            root.style.getPropertyValue('--graph-tooltip-z') || '0',
            10
        );
        if (existingZ < requestedZ.current) {
            root.style.setProperty(
                '--graph-tooltip-z',
                String(requestedZ.current)
            );
        }
        setEl(root);
    }, [el, className]);

    // Update zIndex variable if raised later
    useEffect(() => {
        if (el) {
            const existingZ = parseInt(
                el.style.getPropertyValue('--graph-tooltip-z') || '0',
                10
            );
            if (existingZ < requestedZ.current) {
                el.style.setProperty(
                    '--graph-tooltip-z',
                    String(requestedZ.current)
                );
            }
        }
    }, [zIndex, el]);

    if (!el) return null;
    return createPortal(children, el);
};

export default TooltipPortal;
