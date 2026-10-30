type DropIndicatorProps = {
    active: boolean;
    onDragOverCapture: (event: React.DragEvent<HTMLDivElement>) => void;
    onDropCapture: (event: React.DragEvent<HTMLDivElement>) => void;
};

export function DropIndicator({
    active,
    onDragOverCapture,
    onDropCapture,
}: DropIndicatorProps) {
    return (
        <div
            className={`-mx-1 flex h-6 items-center rounded transition-all ${
                active ? 'bg-brand-primary/30' : 'bg-transparent'
            }`}
            onDragOverCapture={onDragOverCapture}
            onDropCapture={onDropCapture}
        >
            <div
                className={`h-1 w-full rounded-full bg-brand-primary transition-all duration-150 ${
                    active ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </div>
    );
}
