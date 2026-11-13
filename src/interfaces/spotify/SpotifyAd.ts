export interface SpotifyCheckoutStartedPayload {
    event_id: number;
    value: number;
    currency: string;
    quantity: string;
}

export interface SpotifyCheckoutSuccessfulPayload {
    event_id: number;
    value: number;
    currency: string;
    quantity: number;
    order_id: number;
    is_new_customer: boolean;
    line_items: {
        value: number;
        quantity: number;
    }[];
}
