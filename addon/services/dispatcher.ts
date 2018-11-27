import Service from '@ember/service';
import { MAX_TIMEOUT, MAX_CONCURRENT } from '../constants';
import { CollectorInterface } from './collector';

export interface DispatcherInterface extends Service {
	collector: CollectorInterface;
	maxTimeout: number;
	maxConcurrent: number;
	isRunning: boolean;
	isDispatching: boolean;
	start(): Promise<void>;
	stop(): Promise<void>;
	dispatch(items: any[]): Promise<any[]>;
}

export default abstract class Dispatcher extends Service implements DispatcherInterface {
	public abstract collector: CollectorInterface;
	public maxTimeout = MAX_TIMEOUT;
	public maxConcurrent = MAX_CONCURRENT;
	public isRunning = false;
	public isDispatching = false;
	public abstract dispatch(items: any[]): Promise<any[]>;

	async start() {
		this.isRunning = true;

		this.waitAndSendMessage();
	}

	async stop() {
		this.isRunning = false;
	}

	private waitAndSendMessage() {
		setTimeout(async() => {
			if (this.isRunning) {
				this.isDispatching = true;

				const items = await this.collector.shift(this.maxConcurrent);
				const hasItems = items && items.length > 0;

				if (hasItems) {
					const itemsReturned = await this.dispatch(items);

					if (itemsReturned && itemsReturned.length > 0) {
						await this.collector.unshift(...itemsReturned);
					}

					this.waitAndSendMessage();
				}

				this.isDispatching = false;
			}
		}, this.maxTimeout);
	}
}

declare module '@ember/service' {
	interface Registry {
		'dispatcher': DispatcherInterface;
	}
}
