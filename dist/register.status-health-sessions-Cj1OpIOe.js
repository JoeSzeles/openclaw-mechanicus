import { Dt as theme, _ as defaultRuntime, xt as setVerbose } from "./entry.js";
import "./auth-profiles-Cn5oo5Dj.js";
import "./exec-CBKBIMpA.js";
import "./agent-scope-F21xRiu_.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./model-BipDi6tz.js";
import "./pi-model-discovery-C5wXDGiT.js";
import "./frontmatter-DRl3Sa-X.js";
import "./skills-BNzMUqt1.js";
import "./manifest-registry-CYUiqtAr.js";
import "./skills-status-DkWJrm56.js";
import "./config-jQwklJz3.js";
import "./client-2MqiYqWH.js";
import "./call-BR4c_EVb.js";
import "./message-channel-B9mgJ1nn.js";
import "./subagent-registry-D7Kcs6_x.js";
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
import { t as formatDocsLink } from "./links-rnbUL9h5.js";
import { n as runCommandWithRuntime } from "./cli-utils-f9j-_1VT.js";
import { t as formatHelpExamples } from "./help-format-5GFCgEVf.js";
import "./progress-Clpi3Ckj.js";
import "./replies-BFcCU9NN.js";
import "./pi-tools.policy-qbAa35WM.js";
import "./onboard-helpers-C223CFn-.js";
import "./prompt-style-B_yUCLn4.js";
import "./pairing-labels-3nsEq_HC.js";
import "./dangerous-tools-B7yH-Zod.js";
import "./skill-scanner-tAtylXb-.js";
import "./channels-status-issues-IxMnCiES.js";
import { n as parsePositiveIntOrUndefined } from "./helpers-B7ilMWgy.js";
import "./runtime-guard-DcwOrtgH.js";
import "./systemd-BYZv1bwz.js";
import "./service-DKWwofhD.js";
import "./diagnostics-CbZXTGkO.js";
import "./table-Ca0mornk.js";
import "./audit-FqKfu9R2.js";
import { n as statusCommand } from "./status-CLVkPBFl.js";
import { r as healthCommand } from "./health-roHfvCop.js";
import "./update-check-SdAaZd6e.js";
import "./node-service-lGnE9n8K.js";
import "./status.update-BcOdnOPp.js";
import { t as sessionsCommand } from "./sessions-W2Xy4eL3.js";

//#region src/cli/program/register.status-health-sessions.ts
function resolveVerbose(opts) {
	return Boolean(opts.verbose || opts.debug);
}
function parseTimeoutMs(timeout) {
	const parsed = parsePositiveIntOrUndefined(timeout);
	if (timeout !== void 0 && parsed === void 0) {
		defaultRuntime.error("--timeout must be a positive integer (milliseconds)");
		defaultRuntime.exit(1);
		return null;
	}
	return parsed;
}
function registerStatusHealthSessionsCommands(program) {
	program.command("status").description("Show channel health and recent session recipients").option("--json", "Output JSON instead of text", false).option("--all", "Full diagnosis (read-only, pasteable)", false).option("--usage", "Show model provider usage/quota snapshots", false).option("--deep", "Probe channels (WhatsApp Web + Telegram + Discord + Slack + Signal)", false).option("--timeout <ms>", "Probe timeout in milliseconds", "10000").option("--verbose", "Verbose logging", false).option("--debug", "Alias for --verbose", false).addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw status", "Show channel health + session summary."],
		["openclaw status --all", "Full diagnosis (read-only)."],
		["openclaw status --json", "Machine-readable output."],
		["openclaw status --usage", "Show model provider usage/quota snapshots."],
		["openclaw status --deep", "Run channel probes (WA + Telegram + Discord + Slack + Signal)."],
		["openclaw status --deep --timeout 5000", "Tighten probe timeout."]
	])}`).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/status", "docs.openclaw.ai/cli/status")}\n`).action(async (opts) => {
		const verbose = resolveVerbose(opts);
		setVerbose(verbose);
		const timeout = parseTimeoutMs(opts.timeout);
		if (timeout === null) return;
		await runCommandWithRuntime(defaultRuntime, async () => {
			await statusCommand({
				json: Boolean(opts.json),
				all: Boolean(opts.all),
				deep: Boolean(opts.deep),
				usage: Boolean(opts.usage),
				timeoutMs: timeout,
				verbose
			}, defaultRuntime);
		});
	});
	program.command("health").description("Fetch health from the running gateway").option("--json", "Output JSON instead of text", false).option("--timeout <ms>", "Connection timeout in milliseconds", "10000").option("--verbose", "Verbose logging", false).option("--debug", "Alias for --verbose", false).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/health", "docs.openclaw.ai/cli/health")}\n`).action(async (opts) => {
		const verbose = resolveVerbose(opts);
		setVerbose(verbose);
		const timeout = parseTimeoutMs(opts.timeout);
		if (timeout === null) return;
		await runCommandWithRuntime(defaultRuntime, async () => {
			await healthCommand({
				json: Boolean(opts.json),
				timeoutMs: timeout,
				verbose
			}, defaultRuntime);
		});
	});
	program.command("sessions").description("List stored conversation sessions").option("--json", "Output as JSON", false).option("--verbose", "Verbose logging", false).option("--store <path>", "Path to session store (default: resolved from config)").option("--active <minutes>", "Only show sessions updated within the past N minutes").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw sessions", "List all sessions."],
		["openclaw sessions --active 120", "Only last 2 hours."],
		["openclaw sessions --json", "Machine-readable output."],
		["openclaw sessions --store ./tmp/sessions.json", "Use a specific session store."]
	])}\n\n${theme.muted("Shows token usage per session when the agent reports it; set agents.defaults.contextTokens to cap the window and show %.")}`).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/sessions", "docs.openclaw.ai/cli/sessions")}\n`).action(async (opts) => {
		setVerbose(Boolean(opts.verbose));
		await sessionsCommand({
			json: Boolean(opts.json),
			store: opts.store,
			active: opts.active
		}, defaultRuntime);
	});
}

//#endregion
export { registerStatusHealthSessionsCommands };