import * as Switch from '@radix-ui/react-switch';
import { cva } from 'class-variance-authority';
import { ActionText } from '../ActionText/ActionText';
import styles from './Toggle.module.scss';

type ToggleSize = 'sm' | 'md';
const toggleStyles = cva(styles.toggle, {
    variants: {
        size: {
            sm: styles['toggle--sm'],
            md: styles['toggle--md'],
        },
    },
});

type ToggleProps = {
    text?: string;
    supporting?: string;
    size?: ToggleSize;
    disabled?: boolean;
} & Switch.SwitchProps;

export function Toggle({
    id = 'toggle',
    text,
    supporting,
    size,
    disabled,
    ...switchProps
}: ToggleProps) {
    return (
        <div className={toggleStyles({ size })}>
            <Switch.Root
                id={id}
                className={styles.switchRoot}
                disabled={disabled}
                {...switchProps}
            >
                <Switch.Thumb className={styles.switchThumb} />
            </Switch.Root>
            <ActionText
                parentId={id}
                text={text}
                supporting={supporting}
                size={size}
            />
        </div>
    );
}
