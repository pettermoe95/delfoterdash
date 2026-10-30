import { Button } from '@brilliant/bds-core';
import { AICard, cn } from '@bv/ui';
import { useLocalize } from '~/i18n/I18nContext';

type GenerateGraphButtonProps = {
    isLoading?: boolean;
    disabled?: boolean;
    text?: string;
};

export function GenerateGraphButton({
    isLoading,
    disabled,
    text,
}: GenerateGraphButtonProps) {
    const localize = useLocalize();
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
                        rightIcon="bv:arrow-right"
                        size="sm"
                        className="w-max"
                        type="submit"
                        style={{
                            padding: '8px 10px 8px 12px',
                            borderRadius: '4px',
                        }}
                        disabled={disabled}
                        isLoading={isLoading}
                    >
                        {text ?? localize('dashboards.aiBuilder.generate')}
                    </Button>
                </AICard.Content>
            </AICard>
        </div>
    );
}
