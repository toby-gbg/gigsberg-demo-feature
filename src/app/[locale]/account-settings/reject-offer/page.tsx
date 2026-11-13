import OfferActionView from '../accept-offer/_components/OfferActionView';
import { offerActionSearchParamsCache } from '../accept-offer/_searchParams';

const RejectOfferPage = async ({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
    await offerActionSearchParamsCache.parse(searchParams);
    return <OfferActionView action="reject" />;
};

export default RejectOfferPage;
