import { createSafeContext } from '@brilliant/bds-core';
import type { PropsWithChildren } from 'react';
import { useMemo, useState } from 'react';

export type ProgressIndicatorStep = {
    key: string;
    label: string;
    description?: string;
    onClick?: (step: ProgressIndicatorStep) => void;
};

type ProgressIndicatorProps = PropsWithChildren & {
    steps: ProgressIndicatorStep[];
    vertical?: boolean;
    defaultActiveIndex?: number;
};

type ProgressIndicatorContext = ProgressIndicatorProps & {
    activeStep: ProgressIndicatorStep;
    activeStepIndex: number;
    isLastStep: boolean;
    isFirstStep: boolean;
    handleNext: () => void;
    handlePrevious: () => void;
    handleReset: () => void;
    handleSetActive: (step: string | ProgressIndicatorStep) => void;
    handleIsActive: (step: ProgressIndicatorStep) => boolean;
    vertical: boolean;
};

const [ProgressIndicatorProvider, useProgressSteps] =
    createSafeContext<ProgressIndicatorContext>(
        'No ProgressIndicator component found in the tree'
    );
export { useProgressSteps };

export function ProgressIndicator({
    steps,
    children,
    vertical = false,
    defaultActiveIndex = 0,
}: ProgressIndicatorProps) {
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

    function handleSetActive(step: string | ProgressIndicatorStep) {
        const stepKey = typeof step === 'string' ? step : step.key;
        const stepIndex = steps.findIndex((s) => s.key === stepKey);
        setActiveIndex(stepIndex);
    }

    function handleIsActive(step: ProgressIndicatorStep) {
        const stepIndex = steps.findIndex((s) => s.key === step.key);
        return stepIndex <= activeIndex;
    }

    const { activeStep, activeStepIndex } = useMemo(() => {
        return {
            activeStep: steps[activeIndex]!,
            activeStepIndex: activeIndex,
        };
    }, [activeIndex, steps]);

    return (
        <ProgressIndicatorProvider
            value={{
                steps,
                activeStep,
                activeStepIndex,
                vertical,
                isFirstStep: activeIndex === 0,
                isLastStep: activeIndex === steps.length - 1,
                handleIsActive,
                handleNext: () =>
                    activeIndex < steps.length - 1 &&
                    setActiveIndex(activeIndex + 1),
                handlePrevious: () =>
                    activeIndex > 0 && setActiveIndex(activeIndex - 1),
                handleReset: () => setActiveIndex(0),
                handleSetActive,
            }}
        >
            {children}
        </ProgressIndicatorProvider>
    );
}
