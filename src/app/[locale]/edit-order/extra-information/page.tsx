import { editExtraInfoSearchParamsCache } from './_searchParams';
import EditOrderExtraInfo from './content';

const PaperTicketBillingAddress = async ({
    searchParams,
}: PageProps<'/[locale]/edit-order/extra-information'>) => {
    const { token, order_id } = await editExtraInfoSearchParamsCache.parse(searchParams);

    if (!token || !order_id) throw new Error('Missing token and order_id');
    return <EditOrderExtraInfo />;
};

export default PaperTicketBillingAddress;
