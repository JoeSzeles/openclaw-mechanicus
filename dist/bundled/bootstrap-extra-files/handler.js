import "../../paths-CyR9Pa1R.js";
import { y as isAgentBootstrapEvent } from "../../registry-B3v_dMjW.js";
import "../../subsystem-12Cr1qkN.js";
import "../../exec-BcuB7agq.js";
import { d as loadExtraBootstrapFiles, u as filterBootstrapFilesForSession } from "../../workspace-BBSUSFTB.js";
import "../../boolean-CE7i9tBR.js";
import "../../frontmatter-BPvsEU3m.js";
import { t as resolveHookConfig } from "../../config-DmMe1tf9.js";

//#region src/hooks/bundled/bootstrap-extra-files/handler.ts
const HOOK_KEY = "bootstrap-extra-files";
function normalizeStringArray(value) {
	if (!Array.isArray(value)) return [];
	return value.map((v) => typeof v === "string" ? v.trim() : "").filter(Boolean);
}
function resolveExtraBootstrapPatterns(hookConfig) {
	const fromPaths = normalizeStringArray(hookConfig.paths);
	if (fromPaths.length > 0) return fromPaths;
	const fromPatterns = normalizeStringArray(hookConfig.patterns);
	if (fromPatterns.length > 0) return fromPatterns;
	return normalizeStringArray(hookConfig.files);
}
const bootstrapExtraFilesHook = async (event) => {
	if (!isAgentBootstrapEvent(event)) return;
	const context = event.context;
	const hookConfig = resolveHookConfig(context.cfg, HOOK_KEY);
	if (!hookConfig || hookConfig.enabled === false) return;
	const patterns = resolveExtraBootstrapPatterns(hookConfig);
	if (patterns.length === 0) return;
	try {
		const extras = await loadExtraBootstrapFiles(context.workspaceDir, patterns);
		if (extras.length === 0) return;
		context.bootstrapFiles = filterBootstrapFilesForSession([...context.bootstrapFiles, ...extras], context.sessionKey);
	} catch (err) {
		console.warn(`[bootstrap-extra-files] failed: ${String(err)}`);
	}
};

//#endregion
export { bootstrapExtraFilesHook as default };