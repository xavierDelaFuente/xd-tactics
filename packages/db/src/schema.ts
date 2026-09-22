import type { ColumnType } from 'kysely';

export interface SetDataUnitsTable {
  patch: string;
  api_name: string;
  name: string;
  cost: number;
  data: unknown; // jsonb — the full adapted Unit, validated on the way out via parseUnit
}

export interface MatchQueueTable {
  match_id: string;
  puuid: string;
  // Only ever written by the DB default (now()); never set on insert, never updated.
  discovered_at: ColumnType<Date, never, never>;
}

export interface Database {
  set_data_units: SetDataUnitsTable;
  match_queue: MatchQueueTable;
}
