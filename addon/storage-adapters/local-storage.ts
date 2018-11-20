import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';

export interface LocalStorageInterface extends StorageAdapterInterface {
	key: string;
}

export default class LocalStorage extends EmberObject {

}

