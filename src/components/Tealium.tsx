'use client';

import { Fragment } from 'react';

export default function Tealium() {
    return (
        <Fragment>
            <script
                src="https://tags.tiqcdn.com/utag/unidadeditorial/elmundo/prod/utag.js"
                type="text/javascript"
                async
            />
            <script
                src="https://tags.tiqcdn.com/utag/unidadeditorial/elmundo/prod/utag.sync.js"
                type="text/javascript"
                async
            />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        while(fx=window.qJq.pop(0)){fx();}
                        var utag_data = {};
                        (function(a, b, c, d) {
                            a = 'https://tags.tiqcdn.com/utag/unidadeditorial/elmundo/prod/utag.js';
                            b = document;
                            c = 'script';
                            d = b.createElement(c);
                            d.src = a;
                            d.type = 'text/java' + c;
                            d.async = true;
                            a = b.getElementsByTagName(c)[0];
                            a.parentNode.insertBefore(d, a);
                        })();
                    `,
                }}
            />
        </Fragment>
    );
}
