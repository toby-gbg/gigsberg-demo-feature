'use client';

import { FC, FormHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';

type DivProps = {
    asForm?: false;
} & HTMLAttributes<HTMLDivElement>;

type FormProps = {
    asForm: true;
} & FormHTMLAttributes<HTMLFormElement>;

type AccountSettingsSectionProps = {
    title: string;
    isRequired?: boolean;
    onAddClick?: () => void;
    children: ReactNode;
} & (DivProps | FormProps);

const AccountSettingsSection: FC<AccountSettingsSectionProps> = ({
    title,
    isRequired,
    onAddClick,
    children,
    asForm = false,
    ...props
}) => {
    const t = useTranslations();

    const Wrapper = asForm ? 'form' : 'div';

    return (
        <div className="flex flex-col rounded-lg">
            <div className="flex items-center justify-between">
                <h1 className="bg-gradient text-on-main self-stretch px-2 md:px-10 py-2 text-sm rounded-t-md md:text-base flex justify-center items-center">
                    {title}
                </h1>
                {onAddClick && (
                    <Button
                        className="min-w-24 rounded-bl-none rounded-br-none text-sm"
                        onClick={onAddClick}
                    >
                        {t('add_new')}
                    </Button>
                )}
            </div>
            {/* eslint-disable @typescript-eslint/no-explicit-any */}
            <Wrapper className="grid grid-cols-12 gap-4 bg-white p-5 shadow-lg" {...(props as any)}>
                {isRequired && (
                    <div className="col-span-12 text-right text-sm text-black">
                        <span className="text-danger">*</span> {t('indicate_require_field')}
                    </div>
                )}
                {children}
            </Wrapper>
        </div>
    );
};

export default AccountSettingsSection;
