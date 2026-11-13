import OfferActionView from './_components/OfferActionView';
import { offerActionSearchParamsCache } from './_searchParams';

const AcceptOfferPage = async ({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
    await offerActionSearchParamsCache.parse(searchParams);
    return <OfferActionView action="accept" />;
};

export default AcceptOfferPage;
