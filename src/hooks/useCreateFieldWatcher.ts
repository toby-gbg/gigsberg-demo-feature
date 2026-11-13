'use client';

import { useRef } from 'react';
import isEqual from 'lodash-es/isEqual';
import { FieldValues, Path, PathValue, useFormContext, useWatch } from 'react-hook-form';
import { useUpdateEffect } from 'react-use';

export default function useCreateFieldWatcher<TFormValues extends FieldValues>() {
    return function useFieldWatcher<TFieldName extends Path<TFormValues>>(
        name: TFieldName,
        callback: (value: PathValue<TFormValues, TFieldName>) => void
    ) {
        const { control } = useFormContext<TFormValues>();
        const value = useWatch({ control, name }) as PathValue<TFormValues, TFieldName>;
        const previousValue = useRef(value);

        useUpdateEffect(() => {
            if (!isEqual(previousValue.current, value)) {
                callback(value);
            }

            previousValue.current = value;
        }, [value]);
    };
}
