import { t as runCommandWithTimeout } from "./exec-CBKBIMpA.js";
import { o as fileExists } from "./install-safe-path-DtQvjXWL.js";
import fs from "node:fs/promises";

//#region src/infra/install-package-dir.ts
async function installPackageDir(params) {
	params.logger?.info?.(`Installing to ${params.targetDir}…`);
	let backupDir = null;
	if (params.mode === "update" && await fileExists(params.targetDir)) {
		backupDir = `${params.targetDir}.backup-${Date.now()}`;
		await fs.rename(params.targetDir, backupDir);
	}
	const rollback = async () => {
		if (!backupDir) return;
		await fs.rm(params.targetDir, {
			recursive: true,
			force: true
		}).catch(() => void 0);
		await fs.rename(backupDir, params.targetDir).catch(() => void 0);
	};
	try {
		await fs.cp(params.sourceDir, params.targetDir, { recursive: true });
	} catch (err) {
		await rollback();
		return {
			ok: false,
			error: `${params.copyErrorPrefix}: ${String(err)}`
		};
	}
	try {
		await params.afterCopy?.();
	} catch (err) {
		await rollback();
		return {
			ok: false,
			error: `post-copy validation failed: ${String(err)}`
		};
	}
	if (params.hasDeps) {
		params.logger?.info?.(params.depsLogMessage);
		const npmRes = await runCommandWithTimeout([
			"npm",
			"install",
			"--omit=dev",
			"--silent",
			"--ignore-scripts"
		], {
			timeoutMs: Math.max(params.timeoutMs, 3e5),
			cwd: params.targetDir
		});
		if (npmRes.code !== 0) {
			await rollback();
			return {
				ok: false,
				error: `npm install failed: ${npmRes.stderr.trim() || npmRes.stdout.trim()}`
			};
		}
	}
	if (backupDir) await fs.rm(backupDir, {
		recursive: true,
		force: true
	}).catch(() => void 0);
	return { ok: true };
}

//#endregion
//#region src/infra/npm-registry-spec.ts
function validateRegistryNpmSpec(rawSpec) {
	const spec = rawSpec.trim();
	if (!spec) return "missing npm spec";
	if (/\s/.test(spec)) return "unsupported npm spec: whitespace is not allowed";
	if (spec.includes("://")) return "unsupported npm spec: URLs are not allowed";
	if (spec.includes("#")) return "unsupported npm spec: git refs are not allowed";
	if (spec.includes(":")) return "unsupported npm spec: protocol specs are not allowed";
	const at = spec.lastIndexOf("@");
	const hasVersion = at > 0;
	const name = hasVersion ? spec.slice(0, at) : spec;
	const version = hasVersion ? spec.slice(at + 1) : "";
	if (!(name.startsWith("@") ? /^@[a-z0-9][a-z0-9-._~]*\/[a-z0-9][a-z0-9-._~]*$/.test(name) : /^[a-z0-9][a-z0-9-._~]*$/.test(name))) return "unsupported npm spec: expected <name> or <name>@<version> from the npm registry";
	if (hasVersion) {
		if (!version) return "unsupported npm spec: missing version/tag after @";
		if (/[\\/]/.test(version)) return "unsupported npm spec: invalid version/tag";
	}
	return null;
}

//#endregion
export { installPackageDir as n, validateRegistryNpmSpec as t };