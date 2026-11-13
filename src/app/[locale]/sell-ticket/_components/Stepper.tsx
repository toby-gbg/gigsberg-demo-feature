'use client';

import { cloneElement, FC, ReactElement, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { getIsGradient } from '@/utils/website';

import { useSite } from '@/providers/SiteProvider';

type StepperProps = {
    children: ReactElement<StepProps>[];
    SummarySection?: ReactNode;
    onNextStep: () => void;
    activeStep: number;
    showSummaryFromStep?: number;
};

type StepProps = {
    label?: string;
    onStep?: (index: number) => void;
    children: ReactElement<{ onNextStep: () => void }>;
};

const Step: FC<StepProps> = ({ children }) => {
    return children;
};

const Stepper: FC<StepperProps> & { Step: FC<StepProps> } = ({
    children,
    activeStep,
    SummarySection,
    onNextStep,
    showSummaryFromStep = 0,
}) => {
    const isGradient = getIsGradient(useSite().website);
    const t = useTranslations();

    const shouldShowSummary = Boolean(SummarySection && activeStep >= showSummaryFromStep);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {shouldShowSummary && (
                <div className="col-span-1 rounded-lg lg:col-span-4">{SummarySection}</div>
            )}
            <div
                className={cn('col-span-1', {
                    'lg:col-span-8': shouldShowSummary,
                    'lg:col-span-12': !shouldShowSummary,
                })}
            >
                {children[activeStep].props.label && (
                    <div className="flex flex-col">
                        <h1
                            className={cn(
                                'bg-gradient self-start rounded-t px-10 py-2 text-white',
                                {
                                    'text-on-main!': !isGradient,
                                }
                            )}
                        >
                            {t('sell_your_tickets')}
                        </h1>
                        <div className="flex items-center justify-center gap-5 bg-white py-5">
                            {children.map(
                                (child, index) =>
                                    child.props.label && (
                                        <button
                                            type="button"
                                            key={index}
                                            className={cn(
                                                'flex h-[110px] flex-1 flex-col items-center justify-center rounded bg-zinc-300 text-center text-gray-500',
                                                {
                                                    'bg-gradient text-white': index === activeStep,
                                                    'hover:bg-gradient cursor-pointer transition-all duration-100 hover:text-white':
                                                        index != activeStep,
                                                    'pointer-events-none': index > activeStep,
                                                    'text-on-main!': !isGradient,
                                                }
                                            )}
                                            onClick={() => child.props.onStep?.(index)}
                                        >
                                            <h2 className="text-sm sm:text-xl">
                                                {t('step_with_number', {
                                                    number: children[0].props.label
                                                        ? index + 1
                                                        : index,
                                                })}
                                            </h2>
                                            {child.props.label && (
                                                <span className="mt-3 text-sm">
                                                    {child.props.label}
                                                </span>
                                            )}
                                        </button>
                                    )
                            )}
                        </div>
                    </div>
                )}
                <div className="w-full">
                    {children[activeStep] &&
                        cloneElement(children[activeStep].props.children, { onNextStep })}
                </div>
            </div>
        </div>
    );
};

Stepper.Step = Step;

export default Stepper;
