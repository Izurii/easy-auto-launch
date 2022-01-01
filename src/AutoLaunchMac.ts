

import { execString } from "applescript";
import untildify from "untildify";
import {
	createFile,
	removeFile,
	isEnabled as _isEnabled,
} from "./fileBasedUtilities";

export interface AutoLaunchMac {
	enable: typeof enable;
	disable: typeof disable;
	isEnabled: typeof isEnabled;
	execApplescriptCommand: typeof execApplescriptCommand;
	getDirectory: typeof getDirectory;
	getFilePath: typeof getFilePath;

};

export function enable({ appName, appPath, isHiddenOnLaunch, mac }: {
	appName: string;
	appPath: string;
	isHiddenOnLaunch: boolean;
	mac: any
}) {
	// Add the file if we're using a Launch Agent
	if (mac.useLaunchAgent) {
		const programArguments = [appPath];
		if (isHiddenOnLaunch) {
			programArguments.push("--hidden");
		}
		const programArgumentsSection = programArguments
			.map((argument) => `    <string>${argument}</string>`)
			.join("\n");

		const data = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${appName}</string>
  <key>ProgramArguments</key>
  <array>
  ${programArgumentsSection}
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>`;

		return createFile({
			data,
			directory: getDirectory(),
			filePath: getFilePath(appName),
		});
	}

	// Otherwise, use default method; use AppleScript to tell System Events to add a Login Item
	const isHiddenValue = isHiddenOnLaunch ? "true" : "false";
	const properties = `{path:\"${appPath}\", hidden:${isHiddenValue}, name:\"${appName}\"}`;

	return execApplescriptCommand(
		`make login item at end with properties ${properties}`
	);
}
export function disable(appName: string, mac: any) {
	// Delete the file if we're using a Launch Agent
	if (mac.useLaunchAgent) {
		return removeFile(getFilePath(appName));
	}

	// Otherwise remove the Login Item
	return execApplescriptCommand(`delete login item \"${appName}\"`);
}
export function isEnabled(appName: string, mac: any) {
	// Check if the Launch Agent file exists
	if (mac.useLaunchAgent) {
		return _isEnabled(getFilePath(appName));
	}

	// Otherwise check if a Login Item exists for our app
	return execApplescriptCommand("get the name of every login item").then(
		(loginItems: Array<any>) =>
			loginItems != null && Array.from(loginItems).includes(appName)
	);
}
export function execApplescriptCommand(commandSuffix: string) {
	return new Promise<any>((resolve, reject) =>
		execString(
			`tell application \"System Events\" to ${commandSuffix}`,
			function (err: Error, result: any) {
				if (err != null) {
					return reject(err);
				}
				return resolve(result);
			}
		)
	);
}
export function getDirectory() {
	return untildify("~/Library/LaunchAgents/");
}
export function getFilePath(appName: string) {
	return `${getDirectory()}${appName}.plist`;
}
