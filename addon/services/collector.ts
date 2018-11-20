import Service from '@ember/service';
import { StorageAdapterInterface } from '../storage-adapters/storage-adapter';

export interface CollectorInterface extends Service {
	storageAdapter: StorageAdapterInterface;
	count(): Promise<number>;
	push(...items: any[]): Promise<boolean>;
	unshift(...items: any[]): Promise<boolean>;
	pop(count: number): Promise<any[]>;
	shift(count: number): Promise<any[]>;
}

export default class Collector extends Service {

}

declare module '@ember/service' {
  interface Registry {
    'collector': CollectorInterface;
  }
}
