import { EventDetail } from '@/interfaces/Event';
import { ListingRestriction } from '@/interfaces/Listing';

const primaryTeams = [
    {
        name: 'Fc Barcelona',
    },
    {
        name: 'Atletico madrid',
    },
    {
        name: 'Real Betis',
    },
];

export const isPrimaryTeamEvent = (event: EventDetail) => {
    return primaryTeams.some((team) =>
        event.performer1_name?.toLowerCase().includes(team.name.toLowerCase())
    );
};

const STANDING_KEYWORDS = ['standing', 'general admission', 'floor'];
const STANDING_RESTRICTION_IDS = [37, 51, 52];

export const isStanding = ({
    restrictions,
    category,
    block,
}: {
    restrictions: ListingRestriction[];
    category?: string | null;
    block?: string | null;
}) => {
    const categoryName = category?.toLowerCase() || '';
    const blockName = block?.toLowerCase() || '';

    return (
        //Check if the text includes standing, and check if they are of known standing restriction ids
        restrictions.some(
            ({ name, id }) =>
                name.toLowerCase().includes('standing') || STANDING_RESTRICTION_IDS.includes(id)
        ) ||
        STANDING_KEYWORDS.some((keyword) => categoryName.includes(keyword)) ||
        STANDING_KEYWORDS.some((keyword) => blockName.includes(keyword))
    );
};
