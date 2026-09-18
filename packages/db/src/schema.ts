export interface SetDataUnitsTable {
  patch: string;
  api_name: string;
  name: string;
  cost: number;
  data: unknown; // jsonb — the full adapted Unit, validated on the way out via parseUnit
}

export interface Database {
  set_data_units: SetDataUnitsTable;
}
