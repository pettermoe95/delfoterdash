import * as Accordion from '@radix-ui/react-accordion';
import type { FC, PropsWithChildren, SVGProps } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { AccordionChevron } from './AccordionChevron/AccordionChevron';

type AccordionSectionProps = PropsWithChildren & {
    title: React.ReactNode;
    value: string;
    ChevronUp: FC<SVGProps<SVGSVGElement>>;
    ChevronDown: FC<SVGProps<SVGSVGElement>>;
    startOpened?: boolean;
};

const AccordionWrapper = Accordion.Root;

export function AccordionSection({
    title,
    value,
    children,
    ChevronUp,
    ChevronDown,
    startOpened = false,
}: AccordionSectionProps) {
    return (
        <AccordionWrapper
            type="multiple"
            defaultValue={startOpened ? [value] : []}
        >
            <Accordion.Item value={value} className="group">
                <Accordion.Header
                    className={twMerge(
                        'pl-md hover:cursor-pointer hover:bg-secondary',
                        'border border-transparent focus-within:border-primary focus-within:shadow-brand',
                        'transition-all duration-150'
                    )}
                >
                    <Accordion.Trigger
                        className={twMerge(
                            'group flex w-full items-center justify-between py-xs text-sm text-fg-tertiary',
                            'text-secondary bv-text-font-sm-medium focus:outline-none'
                        )}
                    >
                        <div
                            className="flex items-center gap-4"
                            data-componentname="accordion-section-title"
                        >
                            {title}
                        </div>
                        <AccordionChevron
                            ChevronUp={ChevronUp}
                            ChevronDown={ChevronDown}
                        />
                    </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down mt-md flex flex-col gap-1.5 px-md pb-sm">
                    {children}
                </Accordion.Content>
            </Accordion.Item>
        </AccordionWrapper>
    );
}
