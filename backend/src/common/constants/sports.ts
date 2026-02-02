/**
 * Sports configuration for The Odds API.
 * Each sport has a key (matching Odds API sport_key) and a list of valid team names.
 *
 * To add a new sport:
 * 1. Add the sport config to SPORTS_CONFIG below
 * 2. Team names MUST match exactly what The Odds API returns
 *
 * Find sport keys at: https://the-odds-api.com/sports-odds-data/sports-apis.html
 */

export interface SportConfig {
  key: string; // Odds API sport key (e.g., 'basketball_nba')
  name: string; // Display name (e.g., 'NBA')
  teams: readonly string[];
}

export const SPORTS_CONFIG: Record<string, SportConfig> = {
  basketball_nba: {
    key: 'basketball_nba',
    name: 'NBA',
    teams: [
      // Atlantic Division
      'Boston Celtics',
      'Brooklyn Nets',
      'New York Knicks',
      'Philadelphia 76ers',
      'Toronto Raptors',
      // Central Division
      'Chicago Bulls',
      'Cleveland Cavaliers',
      'Detroit Pistons',
      'Indiana Pacers',
      'Milwaukee Bucks',
      // Southeast Division
      'Atlanta Hawks',
      'Charlotte Hornets',
      'Miami Heat',
      'Orlando Magic',
      'Washington Wizards',
      // Northwest Division
      'Denver Nuggets',
      'Minnesota Timberwolves',
      'Oklahoma City Thunder',
      'Portland Trail Blazers',
      'Utah Jazz',
      // Pacific Division
      'Golden State Warriors',
      'Los Angeles Clippers',
      'Los Angeles Lakers',
      'Phoenix Suns',
      'Sacramento Kings',
      // Southwest Division
      'Dallas Mavericks',
      'Houston Rockets',
      'Memphis Grizzlies',
      'New Orleans Pelicans',
      'San Antonio Spurs',
    ],
  },

  // Add more sports here as needed:
  // americanfootball_nfl: {
  //   key: 'americanfootball_nfl',
  //   name: 'NFL',
  //   teams: [...],
  // },
  // icehockey_nhl: {
  //   key: 'icehockey_nhl',
  //   name: 'NHL',
  //   teams: [...],
  // },
  // soccer_usa_mls: {
  //   key: 'soccer_usa_mls',
  //   name: 'MLS',
  //   teams: [...],
  // },
};

/**
 * Get all supported sport keys.
 */
export const getSupportedSports = (): string[] => {
  return Object.keys(SPORTS_CONFIG);
};

/**
 * Get sport configuration by key.
 */
export const getSportConfig = (sportKey: string): SportConfig | undefined => {
  return SPORTS_CONFIG[sportKey];
};

/**
 * Get all teams for a specific sport.
 */
export const getTeamsForSport = (sportKey: string): readonly string[] => {
  return SPORTS_CONFIG[sportKey]?.teams ?? [];
};

/**
 * Check if a team is valid for a given sport.
 */
export const isValidTeamForSport = (
  sportKey: string,
  teamName: string,
): boolean => {
  const teams = getTeamsForSport(sportKey);
  return teams.includes(teamName);
};

/**
 * Get all teams across all sports (for backwards compatibility).
 */
export const getAllTeams = (): string[] => {
  return Object.values(SPORTS_CONFIG).flatMap((sport) => [...sport.teams]);
};
