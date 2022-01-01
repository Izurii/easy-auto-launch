import { writeFile, stat as _stat, unlink } from "fs";
import mkdirp from "mkdirp";

export function createFile({ directory, filePath, data }: { directory: string; filePath: string; data: string }) {
	return new Promise<boolean | NodeJS.ErrnoException>((resolve, reject) =>
		mkdirp(directory).then(
			() => {
				return writeFile(filePath, data, function (writeErr) {
					if (writeErr != null) {
						return reject(writeErr);
					}
					return resolve(true);
				});
			},
			(mkdirErr) => reject(mkdirErr)
		)
	);
}
export function isEnabled(filePath: string) {
	return new Promise<boolean>((resolve) => {
		return _stat(filePath, function (err, stat) {
			if (err != null) {
				return resolve(false);
			}
			return resolve(stat != null);
		});
	});
}
export function removeFile(filePath: string) {
	return new Promise<boolean>((resolve, reject) => {
		return _stat(filePath, function (statErr) {

			if (statErr != null) {
				return resolve(true);
			}

			return unlink(filePath, function (unlinkErr) {
				if (unlinkErr != null) {
					return reject(unlinkErr);
				}
				return resolve(true);
			});
		});
	});
}
