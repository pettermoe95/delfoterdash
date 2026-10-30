import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Icon,
    IconButton,
} from '@brilliant/bds-core';
import { CellContent } from '@bv/ui';
import type { CellContext } from '@tanstack/react-table';
import { PERMISSION, useAccount } from '~/features/auth';
import { useState } from 'react';
import type { UserItem } from '../../api/schema';
import { EditUserDialog } from '../EditUserDialog/EditUserDialog';

export function EditUserCell<T extends UserItem>(
    cell: CellContext<T, number | null>
) {
    const { hasPermission } = useAccount();
    const userData = cell.row.original as UserItem;
    const [isUserDialogOpen, setIsUserDialogOpen] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    function handleOpenDropdownMenu() {
        setIsMenuOpen(false);
        setIsUserDialogOpen(true);
    }

    return (
        <CellContent
            hierarchy="secondary"
            className="mr-2 flex items-center justify-end gap-0 bv-text-font-sm-regular hover:cursor-pointer"
        >
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger
                    asChild
                    className={`${!hasPermission(PERMISSION.USERS_SET_ROLES) ? 'hidden' : 'block'} p-2`}
                    disabled={!hasPermission(PERMISSION.USERS_SET_ROLES)}
                >
                    <IconButton
                        icon="bv:dots-horizontal"
                        variant="ghost"
                        size="sm"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onSelect={handleOpenDropdownMenu}
                        disabled={!hasPermission(PERMISSION.USERS_SET_ROLES)}
                    >
                        <Icon icon="bv:pen" />
                        Edit user role
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <EditUserDialog
                isDialogOpen={isUserDialogOpen}
                onOpenDialogChange={setIsUserDialogOpen}
                userData={userData}
            />
        </CellContent>
    );
}
