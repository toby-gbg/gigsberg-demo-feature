import { Link } from '@/i18n/routing';
import { MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { cn } from '@/lib/cn';

import MainContainer from '@/components/MainContainer';
import { Button } from '@/components/ui/Button';

export default async function FaqFootnote() {
    const t = await getTranslations();

    return (
        <MainContainer>
            <div className={cn('rounded-xl text-on-header p-8 mb-4 bg-header')}>
                <div className="font-black text-2xl">{t('faq_footnote_title')}</div>
                <div className="text-lg opacity-85">{t('faq_footnote_subtitle')}</div>
                <div className="flex flex-col md:flex-row flex-wrap md:items-center gap-2 mt-8">
                    <Link href="https://wa.me/+16316869478" className="w-fit">
                        <Button className="h-10 px-6 flex items-center gap-2 bg-[#25D366] rounded-4xl">
                            <MessageCircle
                                size={20}
                                aria-hidden="true"
                                className="group-hover:rotate-12 transition-transform"
                            />
                            {t('whatsapp_us')}
                        </Button>
                    </Link>
                    <Link href="https://direct.lc.chat/14198268/" className="w-fit">
                        <Button variant="outline" className="h-10 px-6 text-on-header rounded-4xl">
                            {t('livechat')}
                        </Button>
                    </Link>
                    <Link href="mailto:support@gigsberg.com" className="w-fit">
                        <Button variant="outline" className="h-10 px-6 text-on-header rounded-4xl">
                            support@gigsberg.com
                        </Button>
                    </Link>
                </div>
            </div>
        </MainContainer>
    );
}
