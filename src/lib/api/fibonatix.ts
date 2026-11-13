import 'server-only';

import { FibonatixStatusGroup } from '@/interfaces/Fibonatix';

const statusGroups: Record<string, FibonatixStatusGroup> = {
    '10': 'Received',
    '11': 'Resolved',
    '20': 'Approved',
    '30': 'Pending',
    '41': 'Declined by Validation',
    '42': 'Declined by Risk Management',
    '43': 'Declined by Authentication',
    '44': 'Declined by Processor',
    '45': 'Declined by Issuer',
    '46': 'Declined by Technical Error',
};

export default class FibonatixUtils {
    static getStatusGroup(code: string | number): FibonatixStatusGroup {
        return statusGroups[String(code).slice(0, 2)] ?? 'Unknown';
    }
}
