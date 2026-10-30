import type { IconProps as IconifyIconProps } from '@iconify/react';
import { addCollection, Icon as IconifyIcon } from '@iconify/react';
import { brilliantViewIcons } from '../brilliantViewIcons';

type IconProps = IconifyIconProps & {
    // Add your custom props here, for example:
    color?: string;
};

addCollection({
    prefix: 'bv',
    icons: brilliantViewIcons,
    width: 24,
    height: 24,
});
//border: borderColor && `1px solid ${borderColor}`,
export function Icon(props: IconProps) {
    const { color, ...restProps } = props;
    return color !== undefined ? (
        <IconifyIcon
            strokeWidth={1.5}
            {...restProps}
            data-color={color || 'none'}
        />
    ) : (
        <IconifyIcon strokeWidth={1.5} {...props} />
    );
}
