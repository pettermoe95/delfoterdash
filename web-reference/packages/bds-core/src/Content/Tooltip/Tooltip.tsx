import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { PropsWithChildren } from 'react';
import styles from './Tooltip.module.scss';

export type TooltipProps = RadixTooltip.TooltipContentProps & {
    title: string;
    description?: React.ReactNode;
    triggerAsChild?: boolean;
    hideArrow?: boolean;
    open?: boolean;
} & RadixTooltip.TooltipProps;

/**
 * A Tooltip component for displaying a title and description
 *
 * The tooltip is triggered by hovering on the trigger.
 *
 * Note: The trigger component must support the `ref` prop, i.e. wrapped with `forwardRef`,
 * unless `triggerAsChild` is set to `false`, in which the children will be wrapped in a button element.
 */
export const Tooltip = ({
    // Tooltip Root Props
    open,
    onOpenChange,
    // Tooltip Content Props
    side,
    align,
    title,
    description,
    hideArrow,
    // Tooltip Trigger Props
    children,
    triggerAsChild = true,
}: TooltipProps) => {
    return (
        <RadixTooltip.Provider>
            <RadixTooltip.Root open={open} onOpenChange={onOpenChange}>
                <RadixTooltip.Trigger asChild={triggerAsChild}>
                    {children}
                </RadixTooltip.Trigger>
                <RadixTooltip.Portal>
                    <RadixTooltip.Content
                        className={styles.TooltipContent}
                        sideOffset={hideArrow ? 7 : 2}
                        side={side}
                        align={align}
                    >
                        <TooltipDefaultWrapper>
                            <TooltipTitle>{title}</TooltipTitle>
                            <TooltipDescription>
                                {description}
                            </TooltipDescription>
                        </TooltipDefaultWrapper>
                        {!hideArrow && (
                            <RadixTooltip.Arrow
                                className={styles.TooltipArrow}
                            />
                        )}
                    </RadixTooltip.Content>
                </RadixTooltip.Portal>
            </RadixTooltip.Root>
        </RadixTooltip.Provider>
    );
};

type TooltipTextProps = PropsWithChildren;

function TooltipDefaultWrapper({ children }: TooltipTextProps) {
    return <div className={styles.TooltipTextWrapper}>{children}</div>;
}
function TooltipTitle({ children }: TooltipTextProps) {
    return <p className={styles.TooltipTitle}>{children}</p>;
}
function TooltipDescription({ children }: TooltipTextProps) {
    if (!children) return null;
    return <p className={styles.TooltipDescription}>{children}</p>;
}
