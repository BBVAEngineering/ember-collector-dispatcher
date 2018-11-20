import EmberObject from '@ember/object';

export interface StorageAdapterInterface extends EmberObject {
	count(): Promise<number>;
	push(...items: any[]): Promise<void>;
	unshift(...items: any[]): Promise<void>;
	pop(count?: number): Promise<any[]>;
	shift(count?: number): Promise<any[]>;
}

