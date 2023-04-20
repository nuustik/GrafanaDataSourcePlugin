import React, { ChangeEvent } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { CdpDataSourceOptions, CdpQuery, CdpDefaultQuery } from '../types';

type Props = QueryEditorProps<DataSource, CdpQuery, CdpDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, path: event.target.value === '' ? CdpDefaultQuery.path ?? '' : event.target.value});
    // executes the query
    onRunQuery();
  };

  const onCapacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, capacity: event.target.value === '' ? CdpDefaultQuery.capacity ?? 0 : parseFloat(event.target.value)});
    // executes the query
    onRunQuery();
  };
  
  const onFsChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, fs: event.target.value === '' ? CdpDefaultQuery.fs ?? 0 : parseFloat(event.target.value)});
    // executes the query
    onRunQuery();
  };

  const onSampleRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, sampleRate: event.target.value === '' ? CdpDefaultQuery.sampleRate ?? 0 : parseFloat(event.target.value)});
    // executes the query
    onRunQuery();
  };

  return (
    <div className="gf-form">
      <InlineField label="CDP Routing" labelWidth={16} tooltip="Path to the CDP value node to fetch the value from.">
        <Input onChange={onPathChange} value={query.path ?? CdpDefaultQuery.path} width={64} />
      </InlineField>
      <InlineField label="Fs" labelWidth={8} tooltip="Maximum frequency that value updates are expected (controls how many changes are sent in a single packet). Defaults to 5 hz.">
        <Input onChange={onFsChange} value={query.fs ?? CdpDefaultQuery.fs} width={8} />
      </InlineField>
      <InlineField label="Sample Rate" labelWidth={16} tooltip="Maximum amount of value updates sent per second (controls the amount of data transferred). Zero means all samples must be provided. Defaults to 0.">
        <Input onChange={onSampleRateChange} value={query.sampleRate ?? CdpDefaultQuery.sampleRate} width={8} />
      </InlineField>
      <InlineField label="Buffer Size" labelWidth={16} tooltip="Buffer size for historical data. Usually needed by different types of plots and graphing panels.">
        <Input onChange={onCapacityChange} value={query.capacity ?? CdpDefaultQuery.capacity} width={16} />
      </InlineField>
    </div>
  );
}
