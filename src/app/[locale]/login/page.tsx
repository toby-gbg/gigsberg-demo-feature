import { redirect } from 'next/navigation';

import { getUserToken } from '@/services/server/users';

import LoginModal from '@/components/modals/LoginModal';

export default async function FallbackLoginPage() {
    const token = await getUserToken();
    if (token) return redirect('/');
    return <LoginModal />;
}
