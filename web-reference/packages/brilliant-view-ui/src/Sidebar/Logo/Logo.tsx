import { Link } from 'react-router-dom';
import { useSidebarContext } from '../Sidebar.context';

type SiderbarLogoProps = {
    src?: string;
};

export function SidebarLogo({ src }: SiderbarLogoProps) {
    const { minified } = useSidebarContext();

    if (minified)
        return (
            <div className="flex h-10 w-10 items-center justify-center gap-sm">
                <Link to="/">
                    <img
                        src={src}
                        className="h-10 w-10 cursor-pointer object-contain"
                    />
                </Link>
            </div>
        );

    return (
        <div className="flex h-14 items-center justify-center gap-sm">
            <Link to="/">
                <img src={src} className="h-14 cursor-pointer object-contain" />
            </Link>
        </div>
    );
}
