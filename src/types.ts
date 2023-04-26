import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface CdpQuery extends DataQuery {
  path: string;
  capacity: number;
  fs: number,
  sampleRate: number
}

export const CdpDefaultQuery: Partial<CdpQuery> = {
  path: '',
  capacity: 10000,
  fs: 10,
  sampleRate: 10
}

export interface CdpVariableQuery {
  path: string;
  modelNames: string;
  removedPrefix: string;
}

export interface CdpDataSourceOptions extends DataSourceJsonData {
  host: string;
}
