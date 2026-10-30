import { Avatar, IconButton } from '@brilliant/bds-core';
import type { BaseAccount } from '@bv/api';
import { useSidebarContext } from './Sidebar.context';

export function AccountCard() {
    const { account, handleLogOut, minified } = useSidebarContext();

    // Just for memes
    const src = getAvatarUrl(account);
    if (minified)
        return (
            <div className="border-t border-secondary pt-xl">
                <Avatar name={account?.full_name} src={src} />
            </div>
        );

    return (
        <div className="flex items-center justify-between border-t border-secondary pt-xl">
            <Avatar name={account?.full_name} src={src} />
            <div className="flex flex-1 overflow-hidden pl-lg pr-xs">
                <div className="flex flex-col overflow-hidden">
                    <div className="text-secondary bv-text-font-sm-medium">
                        {account?.first_name ?? 'Loading...'}
                    </div>
                    <div className="text-quaternary bv-text-font-sm-regular">
                        {account?.last_name ?? 'Loading...'}
                    </div>
                </div>
            </div>
            <IconButton
                icon="bv:log-out"
                variant="ghost"
                color="gray"
                size="sm"
                onClick={handleLogOut}
            />
        </div>
    );
}

export function getAvatarUrl(account: BaseAccount | undefined) {
    if (!account?.picture_url) return undefined;
    return account.picture_url;
}
