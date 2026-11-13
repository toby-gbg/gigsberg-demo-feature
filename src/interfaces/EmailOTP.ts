export default interface EmailOTP {
    id: number;
    user_id: number;
    otp: number;
    verified: boolean;
    resend_at: string;
    created_at: string;
}
