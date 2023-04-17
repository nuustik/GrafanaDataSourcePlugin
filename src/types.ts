import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface CdpQuery extends DataQuery {
  path: string;
  capacity: number;
  fs: number,
  sampleRate: number
}

export const CdpDefaultQuery: Partial<CdpQuery> = {
  capacity: 10000,
  fs: 10,
  sampleRate: 10
}

/**
 * These are options configured for each DataSource instance
 */
export interface CdpDataSourceOptions extends DataSourceJsonData {
  host: string;
}
