import 'server-only';

import { NextRequest } from 'next/server';

export default class Path {
    private segments: string[];

    constructor(protected request: NextRequest) {
        this.segments = request.nextUrl.pathname.split('/').filter(Boolean);
    }

    get type(): string | undefined {
        return this.segments[0];
    }

    get subtype(): string | undefined {
        return this.segments[1];
    }

    get event(): string | undefined {
        return this.segments[2];
    }

    get listing(): string | undefined {
        return this.segments[3];
    }
}
