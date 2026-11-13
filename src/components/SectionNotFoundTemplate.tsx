import Image from 'next/image';

const NoMatchingFound = '/no-matching-found.webp';

interface Props {
    alt: string;
    title: string;
    description: string;
    hasFilters?: boolean;
    clearFilters?: () => void;
}

export const SectionNotFoundTemplate = (props: Props) => {
    const { alt, title, description } = props;

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="flex flex-col items-center justify-center">
                <Image
                    src={NoMatchingFound}
                    width={176}
                    height={176}
                    alt={alt}
                    className="aspect-square object-contain"
                />
            </div>
            <div className="flex max-w-117.5 flex-col items-center justify-center">
                <h4 className="text-2xl font-semibold text-text-tertiary text-center">{title}</h4>
                <p className="text-base text-text-tertiary text-center">{description}</p>
            </div>
        </div>
    );
};
