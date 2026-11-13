export interface TypeUrl {
    [key: string]: {
        [key: string]: {
            [key: string]: number[];
        } | null;
    };
}
