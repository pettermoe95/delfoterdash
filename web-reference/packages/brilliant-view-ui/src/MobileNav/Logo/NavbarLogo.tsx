import { Link } from 'react-router-dom';

type NavbarLogoProps = {
    src: string;
};
export function NavbarLogo({ src }: NavbarLogoProps) {
    return (
        <div className="ml-2">
            <Link to="/">
                <img src={src} className="h-8" alt="Brilliant logo" />
            </Link>
        </div>
    );
}
