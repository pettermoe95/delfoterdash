import * as RadixCheckbox from '@radix-ui/react-checkbox';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { Icon } from '../../Theme';
import { ActionText } from '../ActionText/ActionText';
import styles from './Checkbox.module.scss';

const checkboxStyles = cva(styles.Checkbox, {
    variants: {
        size: {
            sm: styles['Checkbox--sm'],
            md: styles['Checkbox--md'],
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

type CheckboxProps = {
    text?: string;
    supporting?: string;
} & VariantProps<typeof checkboxStyles> &
    RadixCheckbox.CheckboxProps;

export function Checkbox({
    id = 'Checkbox',
    text,
    size,
    supporting,
    checked,
    ...props
}: CheckboxProps) {
    return (
        <div className={checkboxStyles({ size })}>
            <RadixCheckbox.Root
                id={id}
                className={styles.CheckboxRoot}
                checked={checked}
                {...props}
            >
                <RadixCheckbox.Indicator className={styles.CheckboxIndicator}>
                    <Icon
                        icon={
                            checked === 'indeterminate'
                                ? 'mdi:minus'
                                : 'mdi:check'
                        }
                    />
                </RadixCheckbox.Indicator>
            </RadixCheckbox.Root>
            <ActionText
                parentId={id}
                text={text}
                supporting={supporting}
                size={size}
            />
        </div>
    );
}
