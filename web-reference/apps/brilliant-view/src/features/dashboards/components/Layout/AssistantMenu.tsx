import { Popover, PopoverContent, PopoverTrigger } from '@brilliant/bds-core';
import { AIButton } from '@bv/ui';
import zebriSrc from '~/assets/zebri.png';
import { useToggle } from 'react-use';

export function AssistantMenu() {
    const [open, toggle] = useToggle(false);

    return (
        <Popover open={open} onOpenChange={toggle}>
            <PopoverTrigger asChild>
                <AIButton highlighted pressed={open} />
            </PopoverTrigger>
            <PopoverContent>
                <div className="space-y-md">
                    <h2 className="text-brand-secondary-alt">AI Assistant</h2>
                    <hr />
                    <div className="grid grid-cols-3">
                        <img src={zebriSrc} />
                        <p className="col-span-2 bv-text-font-sm-regular">
                            I'm Zebri, your <strong>AI assistant</strong>. My
                            magic is brewing, and soon I'll help you build
                            dashboards! Have a nice day! 🦄
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
