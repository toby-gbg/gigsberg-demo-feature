import { redirect } from 'next/navigation';

import { getUserToken } from '@/services/server/users';

import ResetPasswordModal from '@/components/modals/ResetPasswordModal';

export default async function FallbackLostPassword() {
    const token = await getUserToken();
    if (token) return redirect('/');
    return <ResetPasswordModal />;
}
