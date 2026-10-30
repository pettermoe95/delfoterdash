import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import { Column } from '../../../Layout';
import styles from './Tooltip.module.scss';

export type TooltipProps = {
    trigger: ReactNode;
    children: ReactNode;
};

/**
 * Radix-based tooltip component
 */
export function Tooltip({ trigger, children }: TooltipProps) {
    return (
        <RadixTooltip.Provider>
            <RadixTooltip.Root>
                {trigger !== undefined && <RadixTooltip.Trigger>{trigger}</RadixTooltip.Trigger>}
                <RadixTooltip.Portal>
                    <RadixTooltip.Content className={styles.content} side="top">
                        <RadixTooltip.Arrow className={styles.arrow} />
                        {/*<RadixPopover.Close className={styles.close} aria-label="Close">
                            <Icon icon="carbon:close-filled" />
                        </RadixPopover.Close>*/}
                        <Column width="100%" align="flex-start">
                            {children}
                        </Column>
                    </RadixTooltip.Content>
                </RadixTooltip.Portal>
            </RadixTooltip.Root>
        </RadixTooltip.Provider>
    );
}
