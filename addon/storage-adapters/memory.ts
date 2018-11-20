import { StorageAdapterInterface } from './storage-adapter';
import EmberObject from '@ember/object';

export interface MemoryInterface extends StorageAdapterInterface {}

export default class Memory extends EmberObject {

}

