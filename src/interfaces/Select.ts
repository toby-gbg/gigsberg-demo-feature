export interface SelectCategory<O> {
    label: string;
    options: O[];
}

export interface TranslatableOption<V> {
    key: string;
    label: string;
    value: V;
}

export default interface Select<V> {
    value: V;
    label: string;
}
