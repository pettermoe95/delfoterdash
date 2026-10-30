import { version } from '../../package.json';

const debugInfo = {
    version,
    env: process.env.NODE_ENV,
    commitHash: __COMMIT_HASH__,
};

export function DebugPage() {
    return (
        <div className="p-4xl">
            <h1 className="mb-4 px-1 bv-display-font-md-regular">Debug Info</h1>
            <div className="w-fit rounded-md border border-primary bg-primary">
                <table className="table table-auto border-collapse rounded-md border border-primary">
                    <tbody>
                        {Object.entries(debugInfo).map(([key, value]) => (
                            <tr key={key} className="bv-text-font-sm-regular">
                                <td className="border border-primary px-2 py-1 font-bold">
                                    {key[0].toUpperCase() + key.slice(1)}
                                </td>
                                <td className="border border-primary px-2 py-1">
                                    {value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
