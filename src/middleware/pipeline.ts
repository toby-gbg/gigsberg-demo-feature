import { ProxyContext, ProxyMiddleware } from '@/interfaces/Middleware';

export async function executePipeline(ctx: ProxyContext, middlewares: ProxyMiddleware[]) {
    for (const middleware of middlewares) {
        const response = await middleware(ctx);

        if (response) return response;
    }
}
