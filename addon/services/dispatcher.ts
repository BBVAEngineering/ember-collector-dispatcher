import Service from '@ember/service';
import RSVP from 'rsvp';
import { CollectorInterface } from './collector';

export interface DispatcherInterface extends Service {
	collector: CollectorInterface;
	isRunning: boolean;
	isDispatching: boolean;
	setOptions(options: any): void;
	start(): RSVP.Promise<undefined>;
	stop(): RSVP.Promise<undefined>;
}

export default class Dispatcher extends Service {

}

declare module '@ember/service' {
  interface Registry {
    'dispatcher': DispatcherInterface;
  }
}
