import { redirect } from 'next/navigation';

import { getUserToken } from '@/services/server/users';

import RegisterModal from '@/components/modals/RegisterModal';

export default async function FallbackRegisterPage() {
    const token = await getUserToken();
    if (token) return redirect('/');
    return <RegisterModal />;
}
