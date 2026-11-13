export interface FeedbackForm {
    token: string;
    rate: number;
    comment: string;
}

export interface FeedbackSubmitResponse {
    success?: boolean;
    feedbackId?: number;
    orderId?: number;
    redirectUrl?: string;
}
