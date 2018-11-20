import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';

export const version = 1;
export const tableName = 'logs';
export const schema = {
	[tableName]: '_id'
};

export interface IndexedDbInterface extends StorageAdapterInterface {
	database: string;
	table: string;
}

export default class IndexedDb extends EmberObject {

}

