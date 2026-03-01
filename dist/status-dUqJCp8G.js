import { o as createSubsystemLogger } from "./entry.js";
import { E as resolveDefaultAgentWorkspaceDir, c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-F21xRiu_.js";
import { i as loadConfig } from "./config-jQwklJz3.js";
import { h as loadOpenClawPlugins } from "./subagent-registry-D7Kcs6_x.js";

//#region src/plugins/status.ts
const log = createSubsystemLogger("plugins");
function buildPluginStatusReport(params) {
	const config = params?.config ?? loadConfig();
	const workspaceDir = params?.workspaceDir ? params.workspaceDir : resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config)) ?? resolveDefaultAgentWorkspaceDir();
	return {
		workspaceDir,
		...loadOpenClawPlugins({
			config,
			workspaceDir,
			logger: {
				info: (msg) => log.info(msg),
				warn: (msg) => log.warn(msg),
				error: (msg) => log.error(msg),
				debug: (msg) => log.debug(msg)
			}
		})
	};
}

//#endregion
export { buildPluginStatusReport as t };