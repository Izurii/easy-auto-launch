type ConstructorType = {
	name: string;
	isHidden?: boolean;
	mac?: Object;
	path?: string;
}
declare module "easy-auto-launch" {
	class AutoLaunch {
		constructor(options: ConstructorType);
		enable(): Promise<void>;
		disable(): Promise<void>;
		isEnabled(): Promise<boolean>;
		fixLinuxExecPath(): Promise<void>;
		fixOpts(): Promise<void>;
	}
	export = AutoLaunch;
}