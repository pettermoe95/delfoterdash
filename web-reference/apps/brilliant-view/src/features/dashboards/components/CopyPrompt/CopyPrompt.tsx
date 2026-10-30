import { Icon } from '@brilliant/bds-core';
import { useState } from 'react';

type CopyPromptProps = {
    prompt: string;
};

export function CopyPrompt({ prompt }: CopyPromptProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <li className="flex items-center justify-between gap-2 rounded-md px-3 py-2">
            <span className="text-md text-primary">{prompt}</span>
            <button
                onClick={handleCopy}
                className="text-secondary transition hover:cursor-pointer hover:text-primary"
                aria-label="Copy prompt"
            >
                <Icon
                    icon={copied ? 'bv:check' : 'bv:copy'}
                    width={18}
                    height={18}
                />
            </button>
        </li>
    );
}
