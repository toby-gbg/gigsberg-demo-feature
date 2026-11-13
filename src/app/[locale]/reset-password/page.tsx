import { redirect } from 'next/navigation';

import { getUserToken } from '@/services/server/users';

import ResetPasswordSendOTPModal from '@/components/modals/ResetPasswordSendOTPModal';

export default async function FallbackLostPassword() {
    const token = await getUserToken();
    if (token) return redirect('/');
    return <ResetPasswordSendOTPModal />;
}
