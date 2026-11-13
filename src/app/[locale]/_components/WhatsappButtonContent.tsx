'use client';

import { FC } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsappButtonContent: FC = () => {
    return (
        <div
            id="whatsapp-chat"
            data-ddv-hide-during-fullscreen
            className="right-2 bottom-20 z-9999 fixed" // slightly better spacing
        >
            <a
                href="https://wa.me/+16316869478"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex justify-center items-center bg-[#25D366] shadow-lg hover:shadow-2xl rounded-full w-16 h-16 text-white hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="Contact us on WhatsApp"
                title="Contact us on WhatsApp"
            >
                <MessageCircle
                    size={36}
                    aria-hidden="true"
                    className="group-hover:rotate-12 transition-transform"
                />
            </a>
        </div>
    );
};

export default WhatsappButtonContent;
