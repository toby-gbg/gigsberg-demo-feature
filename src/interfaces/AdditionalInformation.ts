export type AdditionalFieldValidation =
    | 'required'
    | 'is_valid_name'
    | 'is_valid_email'
    | 'is_valid_phone'
    | 'is_phone'
    | 'is_valid_date'
    | 'is_iso_3166_1_alpha_3'
    | 'is_iso_8601'
    | 'is_alphanumeric'
    | `is_enum:${string}`;

export interface AdditionalField {
    type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'enum';
    unique_name: string;
    validations: AdditionalFieldValidation[];
    display_name: string;
    is_per_ticket?: number;
    is_show_seller: number;
    value?: string;
}

export interface ExtraInfoSchema {
    text: string;
    fields: AdditionalField[];
}

export interface AdditionalInformationResponse {
    extraInformationAdded: boolean;
    extraInfoGiven: AdditionalField[];
    extraInfoSchema: ExtraInfoSchema;
    ticketQuantity: number;
}
