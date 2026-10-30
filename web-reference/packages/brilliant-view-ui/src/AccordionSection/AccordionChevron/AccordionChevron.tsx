import type { FC, SVGProps } from 'react';

type AccordionChevronProps = {
    ChevronUp: FC<SVGProps<SVGSVGElement>>;
    ChevronDown: FC<SVGProps<SVGSVGElement>>;
};

export function AccordionChevron({
    ChevronUp,
    ChevronDown,
}: AccordionChevronProps) {
    return (
        <div className="mr-1.5 flex items-center rounded-sm border border-transparent p-1 transition-all group-focus:border-primary group-focus:shadow-brand">
            <span className="block group-data-[state=open]:hidden">
                <ChevronDown />
            </span>
            <span className="hidden group-data-[state=open]:block">
                <ChevronUp />
            </span>
        </div>
    );
}
