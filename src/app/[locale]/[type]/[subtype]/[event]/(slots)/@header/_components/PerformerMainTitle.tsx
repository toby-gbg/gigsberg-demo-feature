import { cn } from '@/lib/cn';
import { capitalizeWords, REGEXP_PREPOSITIONS_MATCH } from '@/utils/common';

type Props = {
    title: string;
    useBrandStyling: boolean;
    sectionTitleFontClassName: string;
};

const PerformerMainTitle = ({ title, useBrandStyling, sectionTitleFontClassName }: Props) => {
    return (
        <h1
            className={cn(
                'mb-0! font-bold text-primary text-ellipsis line-clamp-2 leading-10 md:leading-16',
                {
                    'text-[26px] md:text-[32px]!': !!sectionTitleFontClassName,
                    'text-[#0A3D84]': useBrandStyling,
                },
                sectionTitleFontClassName
            )}
        >
            {capitalizeWords(title || '', REGEXP_PREPOSITIONS_MATCH)}
        </h1>
    );
};

export default PerformerMainTitle;
