declare module 'applescript' {
	export function execString(command: string, callback: (...args: any) => any): Promise<string>;
}