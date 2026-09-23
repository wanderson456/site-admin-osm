export interface OSMLeague {
  id: number | string;
  name: string;
  code: string;
  team_count: number;
  weeks: number;
}

export interface OSMTeam {
  id: number | string;
  name: string;
  squad_value?: number;
}
