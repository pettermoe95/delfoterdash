import { Avatar } from '@brilliant/bds-core';
import { CellContent } from '@bv/ui';
import type { CellContext } from '@tanstack/react-table';
import type { UserItem } from '../../api/schema';

export const UserNameCell = (cell: CellContext<UserItem, unknown>) => {
    const { first_name, last_name, picture_url, email } = cell.row.original;
    const fullName = `${first_name} ${last_name}`.trim();

    return (
        <CellContent className="gap-md">
            <Avatar name={fullName} src={picture_url} size="sm" />
            <div className="ml-2">
                <span className="bv-text-font-md-medium">{fullName}</span>
                <p className="bv-text-font-xs-regular">
                    {email.toLocaleLowerCase()}
                </p>
            </div>
        </CellContent>
    );
};
