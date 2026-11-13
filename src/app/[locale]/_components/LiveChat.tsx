'use client';

import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import Script from 'next/script';

import LoadingDots from './LoadingDots';

export default function LiveChat() {
    const [on, setOn] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const hide = () => setReady(true);
        window.addEventListener('livechat-ready', hide);
        return () => window.removeEventListener('livechat-ready', hide);
    }, []);

    return (
        <Fragment>
            {on && (
                <Script id="livechat-widget" strategy="afterInteractive">
                    {`
                    window.__lc = window.__lc || {};
                    window.__lc.license = 14198268;
                    window.__lc.integration_name = "manual_channels";
                    window.__lc.product_name = "livechat";
                    ;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice))
                    LiveChatWidget.on('ready', function () {
                        LiveChatWidget.call('maximize', { startChat: true });
                        window.dispatchEvent(new Event('livechat-ready'));
                    });
                `}
                </Script>
            )}
            {!ready && (
                <button
                    type="button"
                    aria-label="Chat with us"
                    data-ddv-hide-during-fullscreen
                    className="right-2 bottom-4 z-9999 fixed size-15 cursor-pointer rounded-full bg-[#0059E1]"
                    onClick={() => {
                        setOn(true);
                    }}
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Image alt="icon" src="/live-chat.svg" width={28} height={28} />
                        {on && (
                            <>
                                <div className="absolute m-auto mb-0.5 size-5 bg-white" />

                                <LoadingDots
                                    className="absolute m-auto mb-0.5"
                                    dotClassName="bg-[#0059E1] opacity-100 animate-chat-dot"
                                />
                            </>
                        )}
                    </div>
                </button>
            )}
        </Fragment>
    );
}
