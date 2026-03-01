import { o as createSubsystemLogger } from "./entry.js";
import "./auth-profiles-Cn5oo5Dj.js";
import "./exec-CBKBIMpA.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-F21xRiu_.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./model-BipDi6tz.js";
import "./pi-model-discovery-C5wXDGiT.js";
import "./frontmatter-DRl3Sa-X.js";
import "./skills-BNzMUqt1.js";
import "./manifest-registry-CYUiqtAr.js";
import { i as loadConfig } from "./config-jQwklJz3.js";
import "./client-2MqiYqWH.js";
import "./call-BR4c_EVb.js";
import "./message-channel-B9mgJ1nn.js";
import { h as loadOpenClawPlugins } from "./subagent-registry-D7Kcs6_x.js";
import "./sessions-BWXx5F6h.js";
import "./tokens-MGcNqlE_.js";
import "./accounts-BSDGn_Eo.js";
import "./normalize-BOd1bq0W.js";
import "./bindings-D1UzUf2-.js";
import "./logging-CcxUDNcI.js";
import "./send-CHxWu5j9.js";
import "./plugins-skOiRwEk.js";
import "./send-D74zNYX3.js";
import "./with-timeout-C8se1a2W.js";
import "./deliver-BnwrOgnW.js";
import "./diagnostic-CBjdyWIE.js";
import "./diagnostic-session-state-DqgfGYqZ.js";
import "./accounts-Cavy4S5h.js";
import "./send-Cghzrzv0.js";
import "./image-ops-DOCAfk8A.js";
import "./pi-embedded-helpers-B4acisFt.js";
import "./sandbox-BebvjdmS.js";
import "./chrome-BjOblpOF.js";
import "./tailscale-ByXUFHKh.js";
import "./auth-QhLPyF5J.js";
import "./server-context-UYMAxauw.js";
import "./routes-Sab6rxkx.js";
import "./redact-BHDVlHmj.js";
import "./errors-BtWNsPzQ.js";
import "./paths-DGpfJD4j.js";
import "./ssrf-MofQSeTB.js";
import "./store-DM25NjFE.js";
import "./ports-B-sNNAH_.js";
import "./trash-CkoTsduV.js";
import "./dock-BoYjClAF.js";
import "./accounts-CYoNNt2n.js";
import "./paths-CJeHSIux.js";
import "./tool-images-DGv31LBz.js";
import "./thinking-BMF5Lj9k.js";
import "./models-config-D9Ip2qwj.js";
import "./reply-prefix-D0pmm6mE.js";
import "./memory-cli-OT5sZsYA.js";
import "./manager-BHnukXwM.js";
import "./sqlite-D5NWcoFL.js";
import "./retry-BqINXZ-d.js";
import "./common-DVcTPREx.js";
import "./chunk-CSqoZaa2.js";
import "./markdown-tables-C-U6wHaa.js";
import "./fetch-guard-CFsdMv4v.js";
import "./fetch-zMf2in8v.js";
import "./ir-DrrI_z93.js";
import "./render-BvFSFJZW.js";
import "./commands-registry-Ddi9Nj4_.js";
import "./image-BCRMWkdO.js";
import "./tool-display-VGkGf5S9.js";
import "./runner-DJEAnxWi.js";
import "./model-catalog-DYzUm_ve.js";
import "./session-utils-Bfyg_T1T.js";
import "./skill-commands-DQY5gtSv.js";
import "./workspace-dirs-DbV1rwga.js";
import "./pairing-store-CWbTPkUY.js";
import "./fetch-RhTQDQbf.js";
import "./nodes-screen-DcirdJP7.js";
import "./session-cost-usage-BR5wNTCV.js";
import "./control-service-DBE1_5Lf.js";
import "./stagger-BCQzFuQi.js";
import "./channel-selection-CZ7KSohZ.js";
import "./send-D_cwx0gg.js";
import "./outbound-attachment-DUd64aSq.js";
import "./delivery-queue-BTFZ_82k.js";
import "./send-CL9ABZxd.js";
import "./resolve-route-tL4VOGBX.js";
import "./channel-activity-DmCSK7Gk.js";
import "./tables-BEnNqdOL.js";
import "./proxy-1gf4gtkD.js";
import "./links-rnbUL9h5.js";
import "./cli-utils-f9j-_1VT.js";
import "./help-format-5GFCgEVf.js";
import "./progress-Clpi3Ckj.js";
import "./replies-BFcCU9NN.js";
import "./pi-tools.policy-qbAa35WM.js";
import "./onboard-helpers-C223CFn-.js";
import "./prompt-style-B_yUCLn4.js";
import "./pairing-labels-3nsEq_HC.js";

//#region src/plugins/cli.ts
const log = createSubsystemLogger("plugins");
function registerPluginCliCommands(program, cfg) {
	const config = cfg ?? loadConfig();
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	const logger = {
		info: (msg) => log.info(msg),
		warn: (msg) => log.warn(msg),
		error: (msg) => log.error(msg),
		debug: (msg) => log.debug(msg)
	};
	const registry = loadOpenClawPlugins({
		config,
		workspaceDir,
		logger
	});
	const existingCommands = new Set(program.commands.map((cmd) => cmd.name()));
	for (const entry of registry.cliRegistrars) {
		if (entry.commands.length > 0) {
			const overlaps = entry.commands.filter((command) => existingCommands.has(command));
			if (overlaps.length > 0) {
				log.debug(`plugin CLI register skipped (${entry.pluginId}): command already registered (${overlaps.join(", ")})`);
				continue;
			}
		}
		try {
			const result = entry.register({
				program,
				config,
				workspaceDir,
				logger
			});
			if (result && typeof result.then === "function") result.catch((err) => {
				log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
			});
			for (const command of entry.commands) existingCommands.add(command);
		} catch (err) {
			log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
		}
	}
}

//#endregion
export { registerPluginCliCommands };