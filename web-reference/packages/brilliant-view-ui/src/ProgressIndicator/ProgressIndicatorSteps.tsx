import { Checkbox, cn } from '@brilliant/bds-core';
import type { ProgressIndicatorStep } from './ProgressIndicator';
import { useProgressSteps } from './ProgressIndicator';

type ProgressIndicatorControlsProps = {
    className?: string;
    stepClassName?: string;
    truncateLabel?: string;
};

export function ProgressIndicatorSteps({
    className,
    stepClassName,
}: ProgressIndicatorControlsProps) {
    const { steps, vertical: isVertical } = useProgressSteps();

    return (
        <div
            className={cn(
                'flex items-center justify-between gap-xs',
                isVertical && 'max-w-20 flex-col items-end',
                className
            )}
        >
            {steps.map((step, idx) => (
                <IndicatorStep
                    key={idx}
                    className={stepClassName}
                    step={step}
                    showLine={idx < steps.length - 1}
                />
            ))}
        </div>
    );
}

type IndicatorStepProps = {
    step: ProgressIndicatorStep;
    showLine: boolean;
    truncate?: boolean;
    className?: string;
};

function IndicatorStep({
    step,
    showLine,
    truncate,
    className,
}: IndicatorStepProps) {
    const { vertical, handleIsActive, handleSetActive } = useProgressSteps();
    const isActive = handleIsActive(step);

    const labelClasses = vertical ? '' : 'absolute -top-6 w-max';
    const truncateClasses =
        truncate && (vertical ? 'truncate' : 'truncate max-w-16');
    const directionClasses =
        vertical && 'flex-row gap-sm justify-end self-stretch';

    function handleStepClick() {
        if (step.onClick) {
            return step.onClick(step);
        }
        handleSetActive(step);
    }

    return (
        <>
            <div
                key={step.key}
                className={cn(
                    'flex flex-col items-center gap-xs',
                    'relative text-secondary bv-text-font-xs-regular',
                    truncateClasses,
                    directionClasses,
                    !isActive && 'text-disabled',
                    className
                )}
            >
                <div className={labelClasses}>{step.label}</div>
                <Checkbox checked={isActive} onClick={handleStepClick} />
            </div>
            <IndicatorSeparator showLine={showLine} vertical={vertical} />
        </>
    );
}

function IndicatorSeparator(props: { showLine: boolean; vertical: boolean }) {
    if (!props.showLine) return null;
    if (props.vertical)
        return (
            <div className="mx-2.5 min-h-4 w-0.5 flex-1 bg-primary-gray-300 dark:bg-primary-grayDark-600" />
        );
    return (
        <div className="bg-brand h-0.5 w-full bg-primary-gray-300 dark:bg-primary-grayDark-600"></div>
    );
}
