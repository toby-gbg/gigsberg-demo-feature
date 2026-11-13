import { SEO, SeoHeadings } from '@/interfaces/SEO';
import Subtype from '@/interfaces/Subtype';

export function headingMapper(seo: SEO): SeoHeadings {
    const { seo_item = {}, entity } = seo;

    return {
        h1: seo_item?.headings,
        entity,
    };
}

export const getHeadingParams = (subtype: Subtype): Record<string, string> => {
    const { type, type_name_url, name_url } = subtype;
    const paramsMap: Record<string, Record<string, string>> = {
        type: { type: type_name_url },
        subtype: { type: `${type_name_url}/${name_url}` },
    };
    return paramsMap[type ?? ''] ?? { type: `${type_name_url}/${name_url}` };
};

export const getEventHeadingParams = (
    type: string,
    subtype: string,
    event: string
): Record<string, string> => ({
    type,
    subtype,
    event,
});
