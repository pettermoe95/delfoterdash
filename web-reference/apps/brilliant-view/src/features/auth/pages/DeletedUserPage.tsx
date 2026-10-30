import { Button } from '@brilliant/bds-core';
import DarkLogo from '~/assets/viewlogo_blue.png';
import WhiteLogo from '~/assets/viewlogo_white.svg';
import { useActiveTheme } from '~/stores/system';
import { useNavigate } from 'react-router-dom';

export function DeletedUserPage() {
    const theme = useActiveTheme();
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen bg-primary text-primary">
            <main className="relative z-[1] flex min-h-screen items-center justify-center p-xl">
                <div className="flex w-full max-w-[400px] flex-col items-center gap-3xl rounded-sm border border-primary bg-secondary p-4xl text-center">
                    <img
                        src={theme === 'dark' ? WhiteLogo : DarkLogo}
                        alt="Brilliant View"
                        width={250}
                        className="max-w-full"
                    />
                    <div className="flex flex-col gap-lg">
                        <h1 className="text-xl font-semibold">
                            Your user has been deleted
                        </h1>
                        <p className="text-md text-secondary">
                            An administrator has deleted your Brilliant View
                            user. You can return to the login screen to sign in
                            with a different Microsoft account.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={() => navigate('/login', { replace: true })}
                    >
                        Back to login
                    </Button>
                </div>
            </main>
        </div>
    );
}
