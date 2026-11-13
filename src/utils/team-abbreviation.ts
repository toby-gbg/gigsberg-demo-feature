import { TEAM_ABBREVIATION_OVERRIDES } from '@/constants/team-abbreviations';

export const getTeamAbbreviation = (name: string) => {
    if (!name) return 'UNK';

    return TEAM_ABBREVIATION_OVERRIDES[name] ?? name.slice(0, 3).toUpperCase();
};
