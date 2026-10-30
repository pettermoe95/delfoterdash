type ConceptStatsItemProps = {
    title: string;
    value: string;
};

export function ConceptStatsItem({ title, value }: ConceptStatsItemProps) {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex text-brand-secondary bv-display-font-md-regular">
                {value}
            </div>
            <div className="text-center text-quaternary bv-text-font-sm-regular">
                {title}
            </div>
        </div>
    );
}
