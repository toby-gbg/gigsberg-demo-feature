import { format, isValid, parse } from 'date-fns';

const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '\-]+[\p{L}\p{M}]+)*$/u;
const PERSON_NAME_FIELD_PATTERN = /^(?:first|last|full)_?name$/i;
const DATE_OF_BIRTH_FIELD_PATTERN = /^(?:date_?of_?birth|birth_?date|birthday|dob)$/i;
const COUNTRY_OF_RESIDENCE_FIELD_PATTERN = /^country_?of_?residence$/i;

export const normalizeFormValue = (value: string) => value.trim();

export const isValidCountrySelection = (
    value: string,
    countryOptions: { value: string | number }[]
) => countryOptions.some((option) => option.value === value);

export const isDateOfBirthField = (fieldName: string) =>
    DATE_OF_BIRTH_FIELD_PATTERN.test(fieldName);

export const isCountryOfResidenceField = (fieldName: string) =>
    COUNTRY_OF_RESIDENCE_FIELD_PATTERN.test(fieldName);

export const isPersonNameField = (fieldName: string) => PERSON_NAME_FIELD_PATTERN.test(fieldName);

export const shouldValidatePersonName = (fieldName: string, validations: readonly string[]) =>
    validations.includes('is_valid_name') || isPersonNameField(fieldName);

export type PersonNameValidationError = 'invalid_characters' | 'minimum_words' | 'too_long';

export const getPersonNameValidationError = (
    value: string,
    fieldName: string
): PersonNameValidationError | null => {
    const normalizedValue = normalizeFormValue(value).normalize('NFC');
    const isFullName = /^full_?name$/i.test(fieldName);
    const maximumLength = isFullName ? 100 : 50;
    const length = [...normalizedValue].length;

    if (!NAME_PATTERN.test(normalizedValue)) return 'invalid_characters';
    if (isFullName && normalizedValue.split(/\s+/).length < 2) return 'minimum_words';
    if (length > maximumLength) return 'too_long';

    return null;
};

export const isValidPersonName = (value: string, fieldName: string) =>
    getPersonNameValidationError(value, fieldName) === null;

export const isValidIsoCalendarDate = (value: string) => {
    const date = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(date) && format(date, 'yyyy-MM-dd') === value;
};

export const isValidDateOfBirth = (value: string, now = new Date()) => {
    if (!isValidIsoCalendarDate(value)) return false;

    return value <= format(now, 'yyyy-MM-dd');
};
