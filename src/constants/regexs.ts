export const LATIN_REGEX = /^[a-zA-Z0-9\s]+$/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\p{P}\p{S}]).{8,}$/u;

export const FIRST_NAME_REGEX = /^[\p{L}\p{M}-]+(?:\s[\p{L}\p{M}-]+)*$/u;
export const LAST_NAME_REGEX = /^[\p{L}\p{M}'’-]+(?:\s[\p{L}\p{M}'’-]+)*$/u;
