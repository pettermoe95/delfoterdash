import { TextField } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

type SearchInputBoxProps = {
    search: string;
    setSearch: (value: string) => void;
    placeholder?: string;
};

export function SearchInputBox({
    search,
    setSearch,
    placeholder,
}: SearchInputBoxProps) {
    const localize = useLocalize();
    return (
        <div className="flex w-full max-w-[480px] items-center justify-between">
            <div className="flex-1">
                <TextField
                    name="search-users"
                    size="md"
                    leftIcon="bv:search"
                    placeholder={placeholder ?? localize('users.searchUsers')}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>
        </div>
    );
}
