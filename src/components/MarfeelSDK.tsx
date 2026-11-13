'use client';

import Script from 'next/script';

const MARFEEL_BY_DOMAIN: Record<string, number> = {
    Marca: 2165,
    Metropoli: 2298,
};

type whileLableName = {
    name: string;
};

export default function MarfeelSDK({ name }: whileLableName) {
    const accountId = MARFEEL_BY_DOMAIN[name];
    if (!accountId) return null;

    return (
        <Script id="marfeel-sdk" strategy="lazyOnload">
            {`
        !function(){"use strict";
          function e(e,t){
            var c=document.createElement("script");
            c.src=e;
            t?c.type="module":(c.async=!0,c.type="text/javascript",c.setAttribute("nomodule",""));
            var n=document.getElementsByTagName("script")[0];
            n.parentNode.insertBefore(c,n)
          }
          !function(t,c,n){
            (t.marfeel=t.marfeel||{}).cmd=(t.marfeel.cmd||[]);
            t.marfeel.config=n;
            var i="https://sdk.mrf.io/statics";
            e(i+"/marfeel-sdk.js?id="+c,!0);
            e(i+"/marfeel-sdk.es5.js?id="+c,!1);
          }(window, ${accountId}, {});
        }();
      `}
        </Script>
    );
}
