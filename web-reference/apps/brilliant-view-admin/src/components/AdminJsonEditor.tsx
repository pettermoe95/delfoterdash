import { useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';
import { cn } from '@bv/ui';

type AdminJsonEditorProps = {
    title?: string;
    json: string;
    autoSave?: boolean;
    maxLines?: number;
    className?: string;
    onSave?: (json: string) => void;
    enabled?: boolean;
    validateValue?: (value: unknown) => boolean;
};

type EditJson = {
    json: string;
    isValid: boolean;
};

export function AdminJsonEditor({
    title = 'JSON Editor',
    autoSave = true,
    enabled = true,
    maxLines = 25,
    className,
    json,
    onSave,
    validateValue,
}: AdminJsonEditorProps) {
    const [originalJson] = useState(json);
    const [editedJson, setEditedJson] = useState(autoFormatJson(json));

    function autoFormatJson(json: string): EditJson {
        try {
            const object: unknown = JSON.parse(json);
            const formatted = JSON.stringify(object, null, '\t');
            return {
                json: formatted,
                isValid: validateValue?.(object) ?? true,
            };
        } catch {
            return { json, isValid: false };
        }
    }
    return (
        <div
            className={cn({
                'flex h-full w-full flex-col rounded-lg border-2 border-gray-200 bg-white':
                    true,
                'border-2 border-red-500': enabled && !editedJson.isValid,
                [className ?? '']: true,
            })}
        >
            <div className="border-b border-gray-200 px-3 py-1 text-gray-600">
                {title}
            </div>
            <div className="h-full w-full p-2">
                <AceEditor
                    mode="json"
                    value={editedJson.json}
                    style={{ width: '100%' }}
                    onChange={(value) => {
                        const changed = autoFormatJson(value);
                        setEditedJson(changed);
                        if (autoSave && changed.isValid) {
                            onSave?.(changed.json);
                        }
                    }}
                    setOptions={{
                        showGutter: false,
                        readOnly: !enabled,
                        maxLines,
                    }}
                    debounceChangePeriod={700}
                    theme="tomorrow"
                />
            </div>
            {!autoSave && enabled && (
                <div className="flex justify-between border-t border-gray-200 px-3 py-2">
                    <button
                        disabled={!editedJson.isValid}
                        className="cursor-pointer text-green-500"
                        onClick={() => {
                            onSave?.(editedJson.json);
                        }}
                    >
                        Save
                    </button>
                    <button
                        className="cursor-pointer text-red-500"
                        onClick={() => {
                            setEditedJson(autoFormatJson(originalJson));
                        }}
                    >
                        Revert
                    </button>
                </div>
            )}
        </div>
    );
}
