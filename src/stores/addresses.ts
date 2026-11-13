import { atom } from 'nanostores';

import Address from '@/interfaces/Address';

export const $addresses = atom<Address[]>([]);

export const setAddresses = (addresses: Address[]) => $addresses.set(addresses);

export const appendAddresses = (addresses: Address[]) =>
    $addresses.set([
        ...$addresses.get(),
        ...addresses.filter(
            (address) => !$addresses.get().some((current) => current.id === address.id)
        ),
    ]);

export const addAddress = (address: Address) =>
    $addresses.set([
        ...$addresses
            .get()
            .map((current) => (address.isDefault ? { ...current, isDefault: false } : current)),
        address,
    ]);

export const removeAddress = (id: number) =>
    $addresses.set($addresses.get().filter((address) => address.id !== id));

export const setAddressFavorite = (id: number, isFavorite: boolean) =>
    $addresses.set(
        $addresses
            .get()
            .map((address) =>
                address.id === id ? { ...address, is_favorite: isFavorite } : address
            )
    );

export const setDefaultAddress = (id: number | undefined) =>
    $addresses.set(
        $addresses.get().map((address) => ({ ...address, isDefault: address.id === id }))
    );
