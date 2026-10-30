import { cva } from 'class-variance-authority';
import { Button } from '../../Buttons';
import type { TextFieldSize } from './TextField';
import styles from './TextField.module.scss';

const copyButtonStyles = cva(styles.TextFieldAction, {
    variants: {
        size: {
            sm: styles['TextFieldAction--sm'],
            md: styles['TextFieldAction--md'],
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

type TextFieldCopyProps = {
    value?: string | number;
    size?: TextFieldSize;
    copyable?: boolean;
};
export function TextFieldCopyButton({
    value,
    size,
    copyable,
}: TextFieldCopyProps) {
    if (!copyable) return null;
    return (
        <Button
            className={copyButtonStyles({ size })}
            color="gray"
            leftIcon="bv:copy"
            variant="outlined"
            size={size}
            onClick={() => copyToClipboard(value)}
            disabled={!value?.toString().length}
        >
            Copy
        </Button>
    );
}

const copyToClipboard = async (value: TextFieldCopyProps['value']) => {
    try {
        const permissions = await navigator.permissions.query({
            name: 'clipboard-write' as PermissionName,
        });
        if (permissions.state === 'granted' || permissions.state === 'prompt') {
            await navigator.clipboard.writeText(value?.toString() ?? '');
        } else {
            throw new Error(
                "Can't access the clipboard. Check your browser permissions."
            );
        }
    } catch (error) {
        console.error('Error copying to clipboard', error);
    }
};
