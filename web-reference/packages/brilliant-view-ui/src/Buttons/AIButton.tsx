import { forwardRef, useState } from 'react';
import { AssistantIcon } from './AssistantIcon';

type AIButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    highlighted?: boolean;
    pressed?: boolean;
};

export const AIButton = forwardRef<HTMLButtonElement, AIButtonProps>(
    ({ disabled, highlighted, pressed, ...props }, ref) => {
        const [hovered, setHovered] = useState(false);

        return (
            <button
                ref={ref}
                disabled={disabled}
                className="cursor-pointer rounded-sm p-xxs text-fg-tertiary hover:bg-brand-primary active:bg-brand-primary"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                {...props}
            >
                <AssistantIcon
                    pressed={hovered || Boolean(pressed)}
                    highlighted={Boolean(highlighted)}
                />
            </button>
        );
    }
);
