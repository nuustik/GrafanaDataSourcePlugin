import React, { ChangeEvent } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { CdpDataSourceOptions } from '../types';
import { InlineField, Input } from '@grafana/ui';

interface Props extends DataSourcePluginOptionsEditorProps<CdpDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;

  const onHostChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      host: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  return (
    <div className="gf-form-group">
      <InlineField label="Host" labelWidth={9}>
        <Input
          onChange={onHostChange}
          value={options.jsonData.host || ''}
          placeholder="Enter an host address to connect to"
          width={40}
        />
      </InlineField>
    </div>
  );
}
