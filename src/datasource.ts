import {
  CircularDataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  LoadingState,
} from '@grafana/data';

import { CdpQuery, CdpDataSourceOptions, CdpDefaultQuery, CdpVariableQuery } from './types';
import { getTemplateSrv } from '@grafana/runtime';
import { merge, Observable } from 'rxjs';
import { defaults } from 'lodash';
import studio from 'cdp-client';

export class DataSource extends DataSourceApi<CdpQuery, CdpDataSourceOptions> {
  client: any;

  constructor(instanceSettings: DataSourceInstanceSettings<CdpDataSourceOptions>) {
    super(instanceSettings);
    this.client = new studio.api.Client(instanceSettings.jsonData.host);
  }

  async fetchChildrenNames(path: string, modelName: string): Promise<string[]> {
    let names: string[] = [];
    await this.client.find(path).then((node: any) => {
      node.forEachChild((child: any) => {
        if (!modelName) {
          names.push(child.name());
        } else if (child.info().type_name === modelName) {
          names.push(child.name());
        }
      });
    });
    return names;
  }

  async metricFindQuery(query: CdpVariableQuery, options?: any) {
    const names = await this.fetchChildrenNames(query.path, query.modelName);
    const values = names.map(n => ({ text: n }));
    return values;
  }

  resolveQueryPath(query: string): string[] {
    //resolve query paths like SineApp.Sine{1,2}.{Output,Process Timer} in case Grafana variables are used
    const cdpPaths = query.split('.').reduce((result: string[], part: string) => {
      let newResult: string[] = [];
      let matches = part.match(/[^{}]+(?=})/g);
      let match = matches ? matches.join() : '';
      match.split(',').forEach((m: string) => {
        let r = part.replace('{'+match+'}', m.trim());
        if (result.length === 0) {
          newResult.push(r);
        } else {
          result.forEach((p: string) => {
            newResult.push(p.trim() + '.' + r);
          });
        }
      });
      return newResult;
    }, []);
    return cdpPaths;
  }

  query(options: DataQueryRequest<CdpQuery>): Observable<DataQueryResponse> {
    let observables: Array<Observable<DataQueryResponse>> = [];
    options.targets.map((target) => {
      const query = defaults(target, CdpDefaultQuery);
      const cdpPaths = this.resolveQueryPath(getTemplateSrv().replace(query.path, options.scopedVars));
      cdpPaths.forEach((path: string) => {
        const observable = new Observable<DataQueryResponse>((subscriber) => {
          let lastMs = 0;
          this.client.find(path).then((node: any) => {
            const frame = new CircularDataFrame({
              append: 'tail',
              capacity: query.capacity,
            });

            frame.name = node.name();
            frame.refId = path;
            frame.addField({ name: 'time', type: FieldType.time });
            frame.addField({ name: 'value', type: FieldType.number });

            node.subscribeToValues((value: any, timestamp: any) => {
              const timeMs = Math.floor(timestamp/1000/1000);
              if (timeMs !== lastMs)
              {
                lastMs = timeMs;
                frame.add({ time: timeMs, value: value });
      
                subscriber.next({
                  data: [frame],
                  key: path,
                  state: LoadingState.Streaming,
                });
              }
            }, target.fs, target.sampleRate);
          });
        });
        observables.push(observable);
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
