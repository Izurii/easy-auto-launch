export type ConstructorType = {
	name: string;
	isHidden?: boolean;
	mac?: Object;
	path?: string;
}

declare module 'easy-auto-launch' {
	export class AutoLaunch {
		constructor(options: ConstructorType);
		enable(): Promise<void>;
		disable(): Promise<void>;
		isEnabled(): Promise<boolean>;
		fixLinuxExecPath(): Promise<void>;
		fixOpts(): Promise<void>;
	}
}