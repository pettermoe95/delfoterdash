import type { ReactNode } from 'react';
import { cn } from '../../Utils/styles';
import styles from './Preview.module.scss';

type PreviewOverlayProps = {
    className?: string;
    children?: ReactNode;
    styles?: React.CSSProperties;
};

export function PreviewOverlay({ className, children, styles: inlineStyles }: PreviewOverlayProps) {
    return (
        <div className={cn(styles.previewOverlay, className)} style={inlineStyles}>
            {children}
        </div>
    );
}
