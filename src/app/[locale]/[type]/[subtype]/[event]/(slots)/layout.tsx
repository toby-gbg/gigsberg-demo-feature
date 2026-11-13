import { ReactNode } from 'react';

import { entityApi } from '@/services/server/entity';

import MainContainer from '@/components/MainContainer';
import TrustBenefitStrip from '@/components/TrustBenefitStrip';

import { EntityProvider } from '../_providers/EntityProvider';

export default async function EventLayout({
    header,
    list,
    spotlight,
    ads,
    suggestion,
    jsonld,
    children,
    params,
}: {
    header: ReactNode;
    list: ReactNode;
    spotlight: ReactNode;
    ads: ReactNode;
    suggestion: ReactNode;
    jsonld: ReactNode;
    children: ReactNode;
    params: Promise<{ locale: string; type: string; subtype: string; event: string }>;
}) {
    const { type, subtype, event } = await params;
    const entityMetadata = await entityApi.getEntityMetadata({
        url: event,
        type,
        subtype,

        debug: { callPoint: '[event] layout.tsx' },
    });

    return (
        <EntityProvider entityMetadata={entityMetadata} type={type} subtype={subtype} event={event}>
            <MainContainer className="pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 mx-auto py-6 w-full">
                    <div className="flex xl:flex-row flex-col gap-3 grid-cols-1 lg:grid-cols-12 lg:col-span-12 mt-6 lg:mt-8">
                        <div className="flex-1 space-y-6 lg:col-span-12 min-w-0">
                            {header}
                            {list}
                        </div>
                        {entityMetadata?.type === 'performer' && (
                            <div className="lg:col-span-1 w-auto shrink">
                                <div className="top-4 left-0 xl:sticky flex flex-col gap-3 mx-auto w-full md:w-[60%] xl:w-87">
                                    {spotlight}
                                    {ads}
                                </div>
                            </div>
                        )}
                    </div>

                    {entityMetadata?.type === 'performer' && suggestion}
                </div>

                <TrustBenefitStrip />
            </MainContainer>

            {jsonld}
            {children}
        </EntityProvider>
    );
}
