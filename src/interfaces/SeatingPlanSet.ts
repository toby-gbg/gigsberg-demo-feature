export interface POSSeatingPlanSet {
    category_id: string;
    blocks: string;
    name: string;
    min_price: number;
}

export default interface SeatingPlanSet {
    id?: number;
    blocks: string;
    color: string;
    type: string;
    name: string;
    allways_uk?: 1 | 0;
    attached_to?: string | null;
}
