import React from 'react';

export default function TableFooter({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mt-0 border-t border-primary p-2 pt-2 text-tertiary">
            {children}
        </div>
    );
}
