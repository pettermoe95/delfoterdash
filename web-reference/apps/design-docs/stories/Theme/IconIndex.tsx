import type { BVIconName } from '@brilliant/bds-core';
import { bvIconNames, Icon, TextField, Tooltip } from '@brilliant/bds-core';
import React, { useMemo, useState } from 'react';

export function BVIconIndex() {
    const [search, setSearch] = useState('');

    const filteredIconNames = useMemo(() => {
        if (search.length === 0) return bvIconNames;
        return bvIconNames.filter((icon) =>
            icon.includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <div className="flex flex-col gap-4">
            <div className="w-[300px]">
                <TextField
                    label="Search"
                    name="icon-search"
                    value={search}
                    size="sm"
                    leftIcon="bv:search"
                    placeholder="Search for an icon..."
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-4">
                {filteredIconNames.map((icon) => (
                    <IconPreview key={icon} icon={icon} />
                ))}
            </div>
        </div>
    );
}

function IconPreview({ icon }: { icon: BVIconName }) {
    return (
        <Tooltip title={icon} triggerAsChild={false} side="bottom">
            <Icon name={icon} icon={`bv:${icon}`} fontSize={24} />
        </Tooltip>
    );
}
