export type SvgNode = {
    id: string;
    name: string;
    isLeaf: boolean;
    children: SvgNode[];
};

export type BlockKeyIdentity = {
    rawKey: string;
    normalizedKey: string;
};
