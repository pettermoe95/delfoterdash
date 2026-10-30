import type { SortingFn } from '@tanstack/react-table';
import type { UserItem } from '../../api/schema';

const getFullName = ({ first_name, last_name }: UserItem) =>
    `${first_name} ${last_name}`.trim();

export const compareUsersByName = (userA: UserItem, userB: UserItem) => {
    const fullNameComparison = getFullName(userA).localeCompare(
        getFullName(userB),
        undefined,
        { sensitivity: 'base' }
    );

    if (fullNameComparison !== 0) {
        return fullNameComparison;
    }

    return userA.email.localeCompare(userB.email, undefined, {
        sensitivity: 'base',
    });
};

export const userNameSortingFn: SortingFn<UserItem> = (rowA, rowB) =>
    compareUsersByName(rowA.original, rowB.original);
