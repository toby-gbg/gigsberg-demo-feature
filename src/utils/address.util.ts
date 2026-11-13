import type Address from '@/interfaces/Address';

import type { FloatingSelectOption } from '@/components/FloatingSelect';

export function mapAddressToSelectOption(address: Address): FloatingSelectOption {
    return {
        value: address.id,
        label: address.address_line1 || address.address_line2,
    };
}
