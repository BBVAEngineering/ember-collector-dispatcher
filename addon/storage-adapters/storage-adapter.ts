import EmberObject from '@ember/object';

export interface StorageAdapterInterface extends EmberObject {
	count(): Promise<number>;
	push(...items: any[]): Promise<boolean>;
	unshift(...items: any[]): Promise<boolean>;
	pop(count?: number): Promise<any[]>;
	shift(count?: number): Promise<any[]>;
}

