import Path from "path";
import { AutoLaunchLinux } from "./AutoLaunchLinux";
import { AutoLaunchMac } from "./AutoLaunchMac";
import { AutoLaunchWindows } from "./AutoLaunchWindows";

export default class AutoLaunch {

	api: AutoLaunchLinux | AutoLaunchMac | AutoLaunchWindows | null;
	options: {
		appName: string;
		appPath: string;
		isHiddenOnLaunch: boolean;
		mac: {
			useLaunchAgent?: boolean;
		};
	};
	isHidden?: boolean;
	mac?: Object;

	constructor({ name, isHidden, mac, path }: {
		name: string;
		isHidden: boolean;
		mac: Object;
		path: string;
	}) {

		this.enable = this.enable.bind(this);
		this.disable = this.disable.bind(this);
		this.isEnabled = this.isEnabled.bind(this);
		this.fixLinuxExecPath = this.fixLinuxExecPath.bind(this);
		this.fixOpts = this.fixOpts.bind(this);
		if (name == null) {
			throw new Error("You must specify a name");
		}

		this.options = {
			appName: name,
			appPath: '',
			isHiddenOnLaunch: isHidden != null ? isHidden : false,
			mac: mac != null ? mac : {},
		};

		const versions =
			typeof process !== "undefined" && process !== null
				? process.versions
				: undefined;
		if (path != null) {
			// Verify that the path is absolute
			if (!Path.isAbsolute(path)) {
				throw new Error("path must be absolute");
			}
			this.options.appPath = path;
		} else if (
			versions != null &&
			(versions.nw != null ||
				versions["node-webkit"] != null ||
				versions.electron != null)
		) {
			this.options.appPath = process.execPath;
		} else {
			throw new Error(
				"You must give a path (this is only auto-detected for NW.js and Electron apps)"
			);
		}

		this.fixOpts();
		this.fixLinuxExecPath();

		this.api = null;
		if (/^win/.test(process.platform)) {
			this.api = require("./AutoLaunchWindows");
		} else if (/darwin/.test(process.platform)) {
			this.api = require("./AutoLaunchMac");
		} else if (/linux/.test(process.platform)) {
			this.api = require("./AutoLaunchLinux");
		} else {
			throw new Error("Unsupported platform");
		}
	}

	enable() {
		if (!this.api) return null;
		return this.api.enable(this.options);
	}

	disable() {
		if (!this.api) return null;
		return this.api.disable(this.options.appName, this.options.mac);
	}

	// Returns a Promise which resolves to a {Boolean}
	isEnabled() {
		if (!this.api) return null;
		return this.api.isEnabled(this.options.appName, this.options.mac);
	}

	/* Private */

	// Corrects the path to point to the outer .app
	// path - {String}
	// macOptions - {Object}
	// Returns a {String}
	fixMacExecPath(path: string, macOptions: typeof this.options.mac): string {
		// This will match apps whose inner app and executable's basename is the outer app's basename plus "Helper"
		// (the default Electron app structure for example)
		// It will also match apps whose outer app's basename is different to the rest but the inner app and executable's
		// basenames are matching (a typical distributed NW.js app for example)
		// Does not match when the three are different
		// Also matches when the path is pointing not to the exectuable in the inner app at all but to the Electron
		// executable in the outer app
		path = path.replace(
			/(^.+?[^\/]+?\.app)\/Contents\/(Frameworks\/((\1|[^\/]+?) Helper)\.app\/Contents\/MacOS\/\3|MacOS\/Electron)/,
			"$1"
		);
		// When using a launch agent, it needs the inner executable path
		if (!macOptions.useLaunchAgent) {
			path = path.replace(/\.app\/Contents\/MacOS\/[^\/]*$/, ".app");
		}
		return path;
	}

	fixLinuxExecPath(): string | undefined {
		// This is going to escape the spaces in the executable path
		// Fixing all problems with unescaped paths for Linux
		if (/linux/.test(process.platform) && this.options.appPath) {
			return (this.options.appPath = this.options.appPath.replace(
				/(\s+)/g,
				"\\$1"
			));
		}
	}

	fixOpts() {
		let tempPath;

		if (!this.options.appPath) return false;

		this.options.appPath = this.options.appPath.replace(/\/$/, "");

		if (/darwin/.test(process.platform)) {
			this.options.appPath = this.fixMacExecPath(
				this.options.appPath,
				this.options.mac
			);
		}

		if (this.options.appPath.indexOf("/") !== -1) {
			tempPath = this.options.appPath.split("/");
			this.options.appName = tempPath[tempPath.length - 1];
		} else if (this.options.appPath.indexOf("\\") !== -1) {
			tempPath = this.options.appPath.split("\\");
			this.options.appName = tempPath[tempPath.length - 1];
			this.options.appName = this.options.appName.substr(
				0,
				this.options.appName.length - ".exe".length
			);
		}

		if (/darwin/.test(process.platform)) {
			// Remove ".app" from the appName if it exists
			if (
				this.options.appName.indexOf(
					".app",
					this.options.appName.length - ".app".length
				) !== -1
			) {
				return (this.options.appName = this.options.appName.substr(
					0,
					this.options.appName.length - ".app".length
				));
			}
		}
	}
};
