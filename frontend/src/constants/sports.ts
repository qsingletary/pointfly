export const SPORT_DISPLAY_NAMES: Record<string, string> = {
  basketball_nba: 'NBA',
  americanfootball_nfl: 'NFL',
  icehockey_nhl: 'NHL',
  baseball_mlb: 'MLB',
  soccer_usa_mls: 'MLS',
};

export function getSportDisplayName(sportKey: string | undefined): string {
  if (!sportKey) return 'Not set';
  return SPORT_DISPLAY_NAMES[sportKey] ?? sportKey;
}
