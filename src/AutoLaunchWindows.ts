import { existsSync } from "fs";
import { join, dirname, basename } from "path";
import Winreg, { HKCU, REG_SZ } from "winreg";

const regKey = new Winreg({
	hive: HKCU,
	key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
});

export interface AutoLaunchWindows {
	enable: typeof enable;
	disable: typeof disable;
	isEnabled: typeof isEnabled;
}

export function enable({ appName, appPath, isHiddenOnLaunch }: {
	appName: string;
	appPath: string;
	isHiddenOnLaunch: boolean;
}) {
	return new Promise<boolean | Error>(function (resolve, reject) {
		let pathToAutoLaunchedApp = appPath;
		let args = "";
		const updateDotExe = join(
			dirname(process.execPath),
			"..",
			"update.exe"
		);

		// If they're using Electron and Squirrel.Windows, point to its Update.exe instead
		// Otherwise, we'll auto-launch an old version after the app has updated
		if (
			(process.versions != null
				? process.versions.electron
				: undefined) != null &&
			existsSync(updateDotExe)
		) {
			pathToAutoLaunchedApp = updateDotExe;
			args = ` --processStart \"${basename(process.execPath)}\"`;
			if (isHiddenOnLaunch) {
				args += ' --process-start-args "--hidden"';
			}
		} else {
			if (isHiddenOnLaunch) {
				args += " --hidden";
			}
		}

		return regKey.set(
			appName,
			REG_SZ,
			`\"${pathToAutoLaunchedApp}\"${args}`,
			function (err) {
				if (err != null) {
					return reject(err);
				}
				return resolve(true);
			}
		);
	});
}
export function disable(appName: string) {
	return new Promise<boolean | Error>((resolve, reject) =>
		regKey.remove(appName, function (err) {
			if (err != null) {
				// The registry key should exist but in case it fails because it doesn't exist, resolve false instead
				// rejecting with an error
				if (
					err.message.indexOf(
						"The system was unable to find the specified registry key or value"
					) !== -1
				) {
					return resolve(false);
				}
				return reject(err);
			}
			return resolve(true);
		})
	);
}
export function isEnabled(appName: string) {
	return new Promise<boolean>((resolve) =>
		regKey.get(appName, function (err, item) {
			if (err != null) {
				return resolve(false);
			}
			return resolve(item != null);
		})
	);
}
