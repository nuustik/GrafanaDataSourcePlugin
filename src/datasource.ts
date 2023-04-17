import {
  CircularDataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  LoadingState,
} from '@grafana/data';

import { CdpQuery, CdpDataSourceOptions, CdpDefaultQuery } from './types';
import { merge, Observable } from 'rxjs';
import { defaults } from 'lodash';
import studio from 'cdp-client';

export class DataSource extends DataSourceApi<CdpQuery, CdpDataSourceOptions> {
  host: string;

  constructor(instanceSettings: DataSourceInstanceSettings<CdpDataSourceOptions>) {
    super(instanceSettings);
    this.host = instanceSettings.jsonData.host!;
  }

  query(options: DataQueryRequest<CdpQuery>): Observable<DataQueryResponse> {
    const client = new studio.api.Client(this.host);
    const observables = options.targets.map((target) => {
      const query = defaults(target, CdpDefaultQuery);

      return new Observable<DataQueryResponse>((subscriber) => {
        const frame = new CircularDataFrame({
          append: 'tail',
          capacity: query.capacity,
        });

        frame.refId = query.refId;
        frame.addField({ name: 'time', type: FieldType.time });
        frame.addField({ name: 'value', type: FieldType.number });

        let lastMs = 0;
        client.find(query.path).then((sine: any) => {
          sine.subscribeToValues((value: any, timestamp: any) => {
            const timeMs = Math.floor(timestamp/1000/1000);
            if (timeMs !== lastMs)
            {
              lastMs = timeMs;
              frame.add({ time: timeMs, value: value });
    
              subscriber.next({
                data: [frame],
                key: query.refId,
                state: LoadingState.Streaming,
              });
            }
          }, target.fs, target.sampleRate);
        });
      });
    });

    return merge(...observables);
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
