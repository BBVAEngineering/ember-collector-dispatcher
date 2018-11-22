import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { MAX_TIMEOUT, MAX_CONCURRENT } from '../constants';
import { CollectorInterface } from './collector';
interface ChannelInterface {
	postMessage(path: string, data: any): Promise<any>;
	terminate(): Promise<any>;
}

interface WorkerInterface {
	open(name: string): Promise<ChannelInterface>;
}
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
	public dispatcherPath!: string;
	public maxTimeout = MAX_TIMEOUT;
	public maxConcurrent = MAX_CONCURRENT;
	public isRunning = false;
	public isDispatching = false;
	public options!: Object;
	private channel: ChannelInterface | undefined;
	public abstract dispatch(items: any[]): Promise<any[]>;

	async start() {
		if (!this.dispatcherPath) {
			throw new Error('You must define `dispatcherPath` property on your configuration');
		}

		this.isRunning = true;

		const channel = await this.worker.open('dispatcher');
		const options = {
			dispatcherPath: this.dispatcherPath
		};

		this.channel = channel;
		channel.postMessage('install', { options });

		this.waitAndSendMessage();
	}

	async stop() {
		this.isRunning = false;

		if(this.channel) {
			await this.channel.terminate();
		}
	}

	setOptions(options: Object) {
		this.options = { options };
	}

	waitAndSendMessage() {
		const channel = this.channel;

		if(channel) {
			setTimeout(async () => {
				if(this.isRunning) {
					const items = await this.collector.shift(this.maxConcurrent);
					const hasItems = items && items.length > 0;

					if(hasItems) {
						const data = { items };
						this.isDispatching = true;

						if(this.options) {
							Object.assign(data, this.options);
						}

						channel.postMessage('dispatch', data);

						// re qeueue collector
					} else {
						this.isDispatching = false;
					}

					this.waitAndSendMessage();
				}
			}, this.maxTimeout);
		}
	}
}

declare module '@ember/service' {
	interface Registry {
		'dispatcher': DispatcherInterface;
	}
}
