import Icon from '@mdi/react';

type ButtonIconProps = { path: string };

export function ButtonIcon({ path }: ButtonIconProps) {
    return (
        <Icon
            path={path}
            size="18px"
            className="we-button-icon"
            aria-hidden="true"
        />
    );
}
