import { Button } from '@brilliant/bds-core';
import DarkLogo from '~/assets/viewlogo_blue.png';
import WhiteLogo from '~/assets/viewlogo_white.svg';
import { useAuth } from '~/features/auth';
import { useActiveTheme } from '~/stores/system';
import { useState } from 'react';
import styles from './Splash.module.scss';

export function LoginPage() {
    const { logIn } = useAuth();
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const theme = useActiveTheme();

    function handleLoginAccount() {
        setIsAuthorizing(true);
        logIn();
    }

    const logoSrc = theme === 'dark' ? WhiteLogo : DarkLogo;

    return (
        <div className={styles.root}>
            <div className="relative z-[1] flex h-screen w-screen items-center justify-center">
                <div className="flex aspect-[4/3] w-[400px] flex-col justify-between rounded-sm border border-primary bg-secondary p-4xl">
                    <div className="flex justify-center p-xl">
                        <img src={logoSrc} width={250} />
                    </div>

                    <Button
                        type="button"
                        leftIcon={
                            isAuthorizing ? 'bv:loading' : 'mdi:microsoft'
                        }
                        style={{ alignSelf: 'center' }}
                        disabled={isAuthorizing}
                        variant="outlined"
                        onClick={() => handleLoginAccount()}
                    >
                        {isAuthorizing
                            ? 'Logging in...'
                            : 'Login with Microsoft'}
                    </Button>
                </div>
            </div>
            <DynamicBackground />
        </div>
    );
}

export function DynamicBackground() {
    return (
        <div className={styles.background}>
            {Array.from(new Array(26).keys()).map((index) => (
                <span key={index} />
            ))}
        </div>
    );
}
