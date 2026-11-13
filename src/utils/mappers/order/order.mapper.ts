'use client';

import AccountSettingOrder from '@/interfaces/account-settings/AccountSettingOrder';

export default class OrderMapper {
    static toSalesTable({
        id,
        purchaseDate,
        statusId,
        totalPrice,
        currencyCode,
        trackingNumber,
        listingId,
        quantity,
        category,
        block,
        row,
        seatStart,
        seatEnd,
        payoutAmount,
    }: AccountSettingOrder): Partial<AccountSettingOrder> {
        return {
            orderNumber: id,
            purchaseDate,
            statusId,
            totalPrice,
            payoutAmount,
            currencyCode,
            trackingNumber,
            listingId,
            quantity,
            category,
            block,
            row,
            seatStart,
            seatEnd,
        };
    }

    static toPurchasesTable({
        id,
        email,
        purchaseDate,
        statusId,
        totalPrice,
        currencyCode,
        trackingNumber,
        listingId,
        quantity,
        category,
        block,
        row,
        seatStart,
        seatEnd,
    }: AccountSettingOrder): Partial<AccountSettingOrder> {
        return {
            orderNumber: id,
            email,
            purchaseDate,
            statusId,
            totalPrice,
            currencyCode,
            trackingNumber,
            listingId,
            quantity,
            category,
            block,
            row,
            seatStart,
            seatEnd,
        };
    }
}
