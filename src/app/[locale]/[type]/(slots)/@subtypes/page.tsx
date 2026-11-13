import { typeApi } from '@/services/server/type';

import TypePageAllSubtypes from './_components/TypePageAllSubtypes';

export default async function Page({ params }: PageProps<'/[locale]/[type]'>) {
    const { type } = await params;
    const subtypes = await typeApi.getSubtypes({ type });

    if (!subtypes) return null;

    return <TypePageAllSubtypes type={type} subtypes={subtypes} />;
}
