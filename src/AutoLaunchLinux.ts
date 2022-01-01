import untildify from "untildify";
import {
	createFile,
	removeFile,
	isEnabled as _isEnabled,
} from "./fileBasedUtilities";

export interface AutoLaunchLinux {
	enable: typeof enable;
	disable: typeof disable;
	isEnabled: typeof isEnabled;
	getDirectory: typeof getDirectory;
	getFilePath: typeof getFilePath;
};

export function enable({ appName, appPath, isHiddenOnLaunch }: {
	appName: string;
	appPath: string;
	isHiddenOnLaunch: boolean;
}) {
	const hiddenArg = isHiddenOnLaunch ? " --hidden" : "";

	const data = `
		[Desktop Entry]
		Type=Application
		Version=1.0
		Name=${appName}
		Comment=${appName}startup script
		Exec=${appPath}${hiddenArg}
		StartupNotify=false
		Terminal=false
	`;

	return createFile({
		data,
		directory: getDirectory(),
		filePath: getFilePath(appName),
	});
}
export function disable(appName: string) {
	return removeFile(getFilePath(appName));
}
export function isEnabled(appName: string) {
	return _isEnabled(getFilePath(appName));
}
export function getDirectory() {
	return untildify("~/.config/autostart/");
}
export function getFilePath(appName: string) {
	return `${getDirectory()}${appName}.desktop`;
}
