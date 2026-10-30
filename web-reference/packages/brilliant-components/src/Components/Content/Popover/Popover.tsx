import * as RadixPopover from '@radix-ui/react-popover';
import styles from './Popover.module.scss';
import type { ReactNode } from 'react';
import { Column } from '../../../Layout';

export type PopoverProps = {
    trigger: ReactNode;
    anchor?: ReactNode;
    children: ReactNode;
};

/**
 * Radix-based popover component
 */
export function Popover({ trigger, anchor, children }: PopoverProps) {
    return (
        <RadixPopover.Root>
            {trigger !== undefined && <RadixPopover.Trigger>{trigger}</RadixPopover.Trigger>}
            {anchor !== undefined && <RadixPopover.Anchor>{anchor}</RadixPopover.Anchor>}
            <RadixPopover.Portal>
                <RadixPopover.Content className={styles.content} side="top">
                    <RadixPopover.Arrow className={styles.arrow} />
                    {/*<RadixPopover.Close className={styles.close} aria-label="Close">
                        <Icon icon="carbon:close-filled" />
                    </RadixPopover.Close>*/}
                    <Column width="100%" align="flex-start">
                        {children}
                    </Column>
                </RadixPopover.Content>
            </RadixPopover.Portal>
        </RadixPopover.Root>
    );
}
