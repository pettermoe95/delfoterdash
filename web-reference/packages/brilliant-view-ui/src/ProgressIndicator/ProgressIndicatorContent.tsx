import { useProgressSteps } from './ProgressIndicator';

type ProgressIndicatorContentProps = {
    step: string;
    children: React.ReactNode;
};

export function ProgressIndicatorContent({
    step: key,
    children,
}: ProgressIndicatorContentProps) {
    const { activeStep } = useProgressSteps();

    console.log({ activeStep, key });

    if (activeStep.key !== key) return null;

    return <>{children}</>;
}
