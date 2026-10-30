import { Button } from '@brilliant/bds-core';
import { AICard, cn } from '@bv/ui';
import wand from '~/assets/wand.png';

type EditGraphButtonProps = {
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    text?: string;
};

export function EditGraphButton({
    onClick,
    isLoading,
    disabled,
    text,
}: EditGraphButtonProps) {
    return (
        <div className="flex justify-end">
            <AICard>
                <AICard.Content
                    className={cn({
                        'bg-disabled-subtle': disabled || isLoading,
                    })}
                >
                    <Button
                        variant="ghost"
                        color="secondary"
                        leftIcon={
                            isLoading ? 'svg-spinner:6-dots-rotate' : undefined
                        }
                        size="sm"
                        className="w-max"
                        type="button"
                        style={{
                            padding: '8px 10px 8px 12px',
                            borderRadius: '4px',
                        }}
                        disabled={disabled}
                        isLoading={isLoading}
                        onClick={onClick}
                    >
                        {isLoading ? null : <img src={wand} className="" />}
                        {text ?? 'Generate graph'}
                    </Button>
                </AICard.Content>
            </AICard>
        </div>
    );
}
