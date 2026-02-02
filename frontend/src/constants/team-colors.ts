export interface TeamColors {
  name: string;
  primary: string;
  secondary: string;
}

// NBA team colors
const NBA_TEAM_COLORS: Record<string, TeamColors> = {
  // Atlantic Division
  'Boston Celtics': { name: 'Boston Celtics', primary: '#007A33', secondary: '#BA9653' },
  'Brooklyn Nets': { name: 'Brooklyn Nets', primary: '#000000', secondary: '#FFFFFF' },
  'New York Knicks': { name: 'New York Knicks', primary: '#006BB6', secondary: '#F58426' },
  'Philadelphia 76ers': { name: 'Philadelphia 76ers', primary: '#006BB6', secondary: '#ED174C' },
  'Toronto Raptors': { name: 'Toronto Raptors', primary: '#CE1141', secondary: '#000000' },
  // Central Division
  'Chicago Bulls': { name: 'Chicago Bulls', primary: '#CE1141', secondary: '#000000' },
  'Cleveland Cavaliers': { name: 'Cleveland Cavaliers', primary: '#860038', secondary: '#FDBB30' },
  'Detroit Pistons': { name: 'Detroit Pistons', primary: '#C8102E', secondary: '#1D42BA' },
  'Indiana Pacers': { name: 'Indiana Pacers', primary: '#002D62', secondary: '#FDBB30' },
  'Milwaukee Bucks': { name: 'Milwaukee Bucks', primary: '#00471B', secondary: '#EEE1C6' },
  // Southeast Division
  'Atlanta Hawks': { name: 'Atlanta Hawks', primary: '#E03A3E', secondary: '#C1D32F' },
  'Charlotte Hornets': { name: 'Charlotte Hornets', primary: '#1D1160', secondary: '#00788C' },
  'Miami Heat': { name: 'Miami Heat', primary: '#98002E', secondary: '#F9A01B' },
  'Orlando Magic': { name: 'Orlando Magic', primary: '#0077C0', secondary: '#C4CED4' },
  'Washington Wizards': { name: 'Washington Wizards', primary: '#002B5C', secondary: '#E31837' },
  // Northwest Division
  'Denver Nuggets': { name: 'Denver Nuggets', primary: '#0E2240', secondary: '#FEC524' },
  'Minnesota Timberwolves': {
    name: 'Minnesota Timberwolves',
    primary: '#0C2340',
    secondary: '#236192',
  },
  'Oklahoma City Thunder': {
    name: 'Oklahoma City Thunder',
    primary: '#007AC1',
    secondary: '#EF3B24',
  },
  'Portland Trail Blazers': {
    name: 'Portland Trail Blazers',
    primary: '#E03A3E',
    secondary: '#000000',
  },
  'Utah Jazz': { name: 'Utah Jazz', primary: '#002B5C', secondary: '#F9A01B' },
  // Pacific Division
  'Golden State Warriors': {
    name: 'Golden State Warriors',
    primary: '#1D428A',
    secondary: '#FFC72C',
  },
  'Los Angeles Clippers': {
    name: 'Los Angeles Clippers',
    primary: '#C8102E',
    secondary: '#1D428A',
  },
  'Los Angeles Lakers': { name: 'Los Angeles Lakers', primary: '#552583', secondary: '#FDB927' },
  'Phoenix Suns': { name: 'Phoenix Suns', primary: '#1D1160', secondary: '#E56020' },
  'Sacramento Kings': { name: 'Sacramento Kings', primary: '#5A2D81', secondary: '#63727A' },
  // Southwest Division
  'Dallas Mavericks': { name: 'Dallas Mavericks', primary: '#00538C', secondary: '#002B5E' },
  'Houston Rockets': { name: 'Houston Rockets', primary: '#CE1141', secondary: '#000000' },
  'Memphis Grizzlies': { name: 'Memphis Grizzlies', primary: '#5D76A9', secondary: '#12173F' },
  'New Orleans Pelicans': {
    name: 'New Orleans Pelicans',
    primary: '#0C2340',
    secondary: '#C8102E',
  },
  'San Antonio Spurs': { name: 'San Antonio Spurs', primary: '#C4CED4', secondary: '#000000' },
};

export const TEAM_COLORS: Record<string, TeamColors> = {
  ...NBA_TEAM_COLORS,
};

export const getTeamColors = (teamName: string): TeamColors | null => {
  return TEAM_COLORS[teamName] || null;
};

export const DEFAULT_TEAM_COLORS: TeamColors = {
  name: 'Default',
  primary: '#1a1a1a',
  secondary: '#666666',
};
