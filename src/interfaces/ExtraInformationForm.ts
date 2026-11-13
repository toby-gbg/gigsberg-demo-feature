import { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, FieldError } from 'react-hook-form';

import { AdditionalField } from './AdditionalInformation';

export interface ExtraInformationSelectOption {
    label: string;
    value: string | number;
}

export interface GeneratedField extends AdditionalField {
    fieldName: string;
    displayLabel: string;
    ticketIndex: number;
}

export interface FieldRendererContext {
    field: GeneratedField;
    rhfField: ControllerRenderProps<Record<string, string>, string>;
    error: FieldError | undefined;
    selectOptions?: ExtraInformationSelectOption[];
    t: ReturnType<typeof useTranslations>;
}

export interface FieldRendererStrategy {
    matches: (field: GeneratedField) => boolean;
    render: (ctx: FieldRendererContext) => ReactElement;
}
