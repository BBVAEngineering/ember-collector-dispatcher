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
	public isRunning = false;
	public isDispatching = false;
	public abstract dispatch(items: any[]): Promise<any[]>;
	// @ts-ignore
	public maxTimeout: number = this.maxTimeout || MAX_TIMEOUT;
	// @ts-ignore
	public maxConcurrent: number = this.maxConcurrent || MAX_CONCURRENT;

	async start() {
		this.isRunning = true;

		this.waitAndSendMessage();
	}

	async stop() {
		this.isRunning = false;
	}

	private waitAndSendMessage() {
		const callback = window.requestIdleCallback || window.requestAnimationFrame;

		callback(async () => {
			if (this.isRunning && !(this.isDestroying || this.isDestroyed)) {
				const collector = this.get('collector'); // getter for lts versions

				this.isDispatching = true;

				const items = await collector.shift(this.maxConcurrent);
				const hasItems = items && items.length > 0;

				if (hasItems) {
					const itemsReturned = await this.dispatch(items);

					if (itemsReturned && itemsReturned.length > 0) {
						await collector.unshift(...itemsReturned);
					}
				}

				this.isDispatching = false;

				this.waitAndSendMessage();
			}
		}, { timeout: this.maxTimeout });
	}
}

declare module '@ember/service' {
	interface Registry {
		'dispatcher': DispatcherInterface;
	}
}
