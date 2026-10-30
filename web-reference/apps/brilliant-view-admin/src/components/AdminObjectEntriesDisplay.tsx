type AdminObjectEntriesDisplayProps<T extends Record<string, unknown>> = {
    object: T;
    omit?: (keyof T)[];
};

export function AdminObjectEntriesDisplay<T extends Record<string, unknown>>({
    object,
    omit = [],
}: AdminObjectEntriesDisplayProps<T>) {
    return (
        <div className="flex flex-wrap">
            {Object.keys(object)
                .filter((key) => !omit.includes(key as keyof T))
                .map((key) => {
                    const typedKey = key as keyof T;
                    return (
                        <div
                            key={key}
                            className="m-1 grid overflow-hidden rounded border border-gray-300 bg-gray-100"
                            style={{ gridTemplateColumns: 'auto 1fr' }}
                        >
                            <button className="user-select-none border-r bg-gray-100 px-2 text-sm hover:bg-gray-50 active:bg-gray-200">
                                {key}
                            </button>
                            <div className="bg-gray-50 px-2 text-right text-sm">
                                {JSON.stringify(object[typedKey])}
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}
