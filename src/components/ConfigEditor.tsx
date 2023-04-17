import React, { ChangeEvent } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { CdpDataSourceOptions } from '../types';

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

  const { jsonData } = options;

  return (
    <div className="gf-form-group">
      <InlineField label="Host" labelWidth={9}>
        <Input
          onChange={onHostChange}
          value={jsonData.host || ''}
          placeholder="Enter an host address to connect to"
          width={40}
        />
      </InlineField>
    </div>
  );
}
