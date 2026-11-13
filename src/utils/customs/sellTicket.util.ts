import { C } from '@/interfaces/Currency';
import { SellForm } from '@/interfaces/Sell';

export default class SellTicketUtil {
    static buildFormData(form: SellForm, eventId: number, currencies: C): FormData {
        const formData = new FormData();
        // Map SellForm fields to ListingDTO keys
        formData.append('eventId', String(eventId));
        // categoryId is not available, so we skip it
        formData.append('categoryId', String(form.category ?? 0));
        formData.append('row', String(form.row ?? ''));
        formData.append('block', String(form.block ?? ''));
        form.seat_to && formData.append('seatStart', String(form.seat_from ?? ''));
        form.seat_from && formData.append('seatEnd', String(form.seat_to ?? ''));
        formData.append('faceValue', String(form.face_value ?? ''));
        formData.append(
            'faceValueCurrencyId',
            String(currencies[form.face_value_currency]?.id ?? '')
        );
        formData.append('price', String(form.ticket_price));
        formData.append('currencyId', String(currencies[form.ticket_price_currency]?.id ?? '')); // Assuming currencies is a map with currency codes as keys
        formData.append('ticketTypeId', String(form.ticket_type));
        formData.append('listingSplitTypeCode', form.split_type);

        if (form.additional_relevant_information) {
            form.additional_relevant_information.forEach((item) => {
                formData.append('listingRestrictionIds', item.value.toString());
            });
        }
        formData.append('quantity', String(form.quantity));

        if (form.address_id) formData.append('addressId', String(form.address_id));
        formData.append('presentAddressId', String(form.address_id ?? 0));

        //If there is no addressId => use plain address that user manually entered
        if (!form.address_id) {
            const { fullname, city, postcode, country, address_line1, address_line2 } = form;
            formData.append('fullname', fullname);
            formData.append('city', city);
            formData.append('postcode', postcode);
            formData.append('country', String(country.code));
            formData.append('isAddressDefault', 'true');
            address_line1 && formData.append('address_line1', String(address_line1));
            address_line2 && formData.append('address_line2', String(address_line2));
        }

        formData.append('isSellerConnectedToEvent', String(form.is_seller_connected_to_event));
        formData.append('presentedQuantity', String(form.presented_quantity));
        form.mobile_ticket_app_id &&
            formData.append('mobileTicketAppId', String(form.mobile_ticket_app_id));
        formData.append('links', ''); // Assuming no links
        formData.append('active', '1'); // Assuming active is true by default
        formData.append('ukCompliant', 'false');

        form.identify_document?.forEach((file) => {
            formData.append('identify_document', file);
        });
        form.purchase_document?.forEach((file) => {
            formData.append('purchase_document', file);
        });

        return formData;
    }
}
