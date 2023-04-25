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

  escapeRegExp(string: string): string {
    return string.replace(/[*.+?^${}()|[\]\\]/g, '\\$&');
  }

  async fetchChildrenNames(query: string): Promise<string[]> {
    const parts = query.split('.');
    if (parts.length === 0) {
      return [];
    }
      
    return await parts.slice(0).reduce(async (promise: Promise<string[]>, part: string) => {
      const paths = await promise;
      const promises = paths.map(async (path: string) => {
        let newPaths: string[] = [];
        let node: any;
        if (path.length === 0) {
          node = await this.client.root();
        } else {
          node = await this.client.find(path);
        }
        node.forEachChild((child: any) => {       
          let regExp: string;
          let longName: string;
          if (path.length === 0) {
            regExp = part.replace('*', '.*');
            longName =  child.name();
          }
          else {
            regExp = this.escapeRegExp(path + '.') + part.replace('*', '.*');
            longName =  path + '.' + child.name();
          }
          const matches = longName.match(regExp);
          if (matches) {
            newPaths.push(matches[0]);
          }
        });
        return newPaths;
      });
      return await Promise.all(promises).then<string[]>((paths: string[][]) => {
        return paths.flat(1);
      });
    }, Promise.resolve(['']));
  }

  async filterByModelName(cdpPaths: string[], modelName: string) {
    if (!modelName) {
      return cdpPaths;
    }
    const promises = cdpPaths.map(async (path: any) => {
      const node = await this.client.find(path);
      if (node.info().type_name === modelName) {
        return path;
      }
      return undefined;
    });
    return await Promise.all(promises).then<string[]>((paths: string[]) => {
      return paths.flat(1).filter(path => !!path);
    });
  }

  removePrefixes(paths: string[], removedPrefix: string) {
    let cdpPaths: string[] = [];
    paths.forEach((path: string) => {
      if (path.startsWith(removedPrefix)) {
        cdpPaths.push(path.slice(removedPrefix.length));
      }
      else {
        cdpPaths.push(path);
      }
    });
    return cdpPaths;
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

  async metricFindQuery(query: CdpVariableQuery, options?: any) {
    const cdpPaths = await this.fetchChildrenNames(query.path);
    const filteredPaths = await this.filterByModelName(cdpPaths, query.modelName);
    const removedPrefixes = this.removePrefixes(filteredPaths, query.removedPrefix);
    const values = removedPrefixes.map(n => ({ text: n }));
    return values;
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
