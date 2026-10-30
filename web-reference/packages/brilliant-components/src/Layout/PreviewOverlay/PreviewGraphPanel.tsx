import { PreviewOverlay } from './PreviewOverlay';
import type { ReactNode } from 'react';

interface PreviewGraphPanelProps {
    className?: string;
    children?: ReactNode;
    styles?: React.CSSProperties;
}
const PreviewGraphPanel = ({ children, className, styles }: PreviewGraphPanelProps) => {
    return (
        <PreviewOverlay className={className} styles={styles}>
            {children}
        </PreviewOverlay>
    );
};

export default PreviewGraphPanel;
export { PreviewGraphPanel };
