import { Nt as resolvePreferredOpenClawTmpDir } from "./entry.js";
import path from "node:path";

//#region src/browser/paths.ts
const DEFAULT_BROWSER_TMP_DIR = resolvePreferredOpenClawTmpDir();
const DEFAULT_TRACE_DIR = DEFAULT_BROWSER_TMP_DIR;
const DEFAULT_DOWNLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "downloads");
const DEFAULT_UPLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "uploads");
function resolvePathWithinRoot(params) {
	const root = path.resolve(params.rootDir);
	const raw = params.requestedPath.trim();
	if (!raw) {
		if (!params.defaultFileName) return {
			ok: false,
			error: "path is required"
		};
		return {
			ok: true,
			path: path.join(root, params.defaultFileName)
		};
	}
	const resolved = path.resolve(root, raw);
	const rel = path.relative(root, resolved);
	if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return {
		ok: false,
		error: `Invalid path: must stay within ${params.scopeLabel}`
	};
	return {
		ok: true,
		path: resolved
	};
}
function resolvePathsWithinRoot(params) {
	const resolvedPaths = [];
	for (const raw of params.requestedPaths) {
		const pathResult = resolvePathWithinRoot({
			rootDir: params.rootDir,
			requestedPath: raw,
			scopeLabel: params.scopeLabel
		});
		if (!pathResult.ok) return {
			ok: false,
			error: pathResult.error
		};
		resolvedPaths.push(pathResult.path);
	}
	return {
		ok: true,
		paths: resolvedPaths
	};
}

//#endregion
export { resolvePathsWithinRoot as a, resolvePathWithinRoot as i, DEFAULT_TRACE_DIR as n, DEFAULT_UPLOAD_DIR as r, DEFAULT_DOWNLOAD_DIR as t };