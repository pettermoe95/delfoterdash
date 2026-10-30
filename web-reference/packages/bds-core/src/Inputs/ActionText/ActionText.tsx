import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import styles from './ActionText.module.scss';

const textStyles = cva(styles.TextGroup, {
    variants: {
        size: {
            sm: styles['TextGroup--sm'],
            md: styles['TextGroup--md'],
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

type ActionTextProps = {
    parentId: string;
    text?: string;
    supporting?: string;
} & VariantProps<typeof textStyles>;

export function ActionText({
    parentId,
    text,
    supporting,
    size,
}: ActionTextProps) {
    if (!text && !supporting) return null;
    return (
        <div className={textStyles({ size })}>
            {text && (
                <label htmlFor={parentId} className={styles.MainText}>
                    {text}
                </label>
            )}
            {supporting && (
                <p className={styles.SupportingText}>{supporting}</p>
            )}
        </div>
    );
}
