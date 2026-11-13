export type OptionalNonNullable<T> = {
    [K in keyof T]?: NonNullable<T[K]>;
};
