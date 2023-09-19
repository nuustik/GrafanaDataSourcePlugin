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
  type: 'Names' | 'Values' | 'JSON';
}

export const CdpDefaultVariableQuery: Partial<CdpVariableQuery> = {
  path: '',
  modelNames: '',
  removedPrefix: '', 
  type: 'Names'
}

export interface CdpDataSourceOptions extends DataSourceJsonData {
  host: string;
  username: string;
  password: string;
}
