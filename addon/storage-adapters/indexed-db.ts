import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';

export interface IndexedDbInterface extends StorageAdapterInterface {
	database: string;
	table: string;
}

export default class IndexedDb extends EmberObject {

}

