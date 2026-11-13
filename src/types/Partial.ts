type PartialOnly<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export default PartialOnly;
