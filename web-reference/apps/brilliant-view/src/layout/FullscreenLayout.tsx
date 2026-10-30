import { Outlet } from 'react-router-dom';

/**
 * Minimal fullscreen layout
 */
export function FullscreenLayout() {
    return (
        <div className="h-screen w-screen">
            <div className="h-full w-full p-0">
                <Outlet />
            </div>
        </div>
    );
}
