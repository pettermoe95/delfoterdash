import viewerRole from '../viewerRole.png';

type ViewerProps = {
    width?: number | string;
    height?: number | string;
    className?: string;
};

export function ViewerUser({
    width = 30,
    height = 30,
    className,
}: ViewerProps) {
    return (
        <img
            src={viewerRole}
            alt="Viewer icon"
            height={height}
            width={width}
            className={className}
        />
    );
}
