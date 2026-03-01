import { Dt as theme, _ as defaultRuntime, ut as shortenHomePath } from "./entry.js";
import "./auth-profiles-Cn5oo5Dj.js";
import "./exec-CBKBIMpA.js";
import { S as ensureAgentWorkspace, p as DEFAULT_AGENT_WORKSPACE_DIR } from "./agent-scope-F21xRiu_.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./model-BipDi6tz.js";
import "./pi-model-discovery-C5wXDGiT.js";
import "./frontmatter-DRl3Sa-X.js";
import "./skills-BNzMUqt1.js";
import "./manifest-registry-CYUiqtAr.js";
import { l as writeConfigFile, r as createConfigIO } from "./config-jQwklJz3.js";
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
import { o as resolveSessionTranscriptsDir } from "./paths-CJeHSIux.js";
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
import "./help-format-5GFCgEVf.js";
import "./progress-Clpi3Ckj.js";
import "./replies-BFcCU9NN.js";
import "./pi-tools.policy-qbAa35WM.js";
import "./onboard-helpers-C223CFn-.js";
import "./prompt-style-B_yUCLn4.js";
import "./pairing-labels-3nsEq_HC.js";
import "./note-zyFEolLt.js";
import "./clack-prompter-BevfCaG8.js";
import { t as hasExplicitOptions } from "./command-options-CfOi1C4x.js";
import "./daemon-runtime-orUyUdW6.js";
import "./runtime-guard-DcwOrtgH.js";
import "./systemd-BYZv1bwz.js";
import "./service-DKWwofhD.js";
import "./health-roHfvCop.js";
import "./onboarding-CwsQx2dI.js";
import "./shared-wRpn8Uwz.js";
import "./auth-token-BXxdQVkS.js";
import { n as logConfigUpdated, t as formatConfigPath } from "./logging-PVQxLC6I.js";
import "./openai-model-default-B2AOEoxB.js";
import "./vllm-setup-m_p7CwCY.js";
import "./systemd-linger-f_4e32sx.js";
import "./model-picker-BtjffL8b.js";
import "./onboard-custom-Jzr4h0v-.js";
import { t as onboardCommand } from "./onboard-Dz55YmLg.js";
import JSON5 from "json5";
import fs from "node:fs/promises";

//#region src/commands/setup.ts
async function readConfigFileRaw(configPath) {
	try {
		const raw = await fs.readFile(configPath, "utf-8");
		const parsed = JSON5.parse(raw);
		if (parsed && typeof parsed === "object") return {
			exists: true,
			parsed
		};
		return {
			exists: true,
			parsed: {}
		};
	} catch {
		return {
			exists: false,
			parsed: {}
		};
	}
}
async function setupCommand(opts, runtime = defaultRuntime) {
	const desiredWorkspace = typeof opts?.workspace === "string" && opts.workspace.trim() ? opts.workspace.trim() : void 0;
	const configPath = createConfigIO().configPath;
	const existingRaw = await readConfigFileRaw(configPath);
	const cfg = existingRaw.parsed;
	const defaults = cfg.agents?.defaults ?? {};
	const workspace = desiredWorkspace ?? defaults.workspace ?? DEFAULT_AGENT_WORKSPACE_DIR;
	const next = {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				workspace
			}
		}
	};
	if (!existingRaw.exists || defaults.workspace !== workspace) {
		await writeConfigFile(next);
		if (!existingRaw.exists) runtime.log(`Wrote ${formatConfigPath(configPath)}`);
		else logConfigUpdated(runtime, {
			path: configPath,
			suffix: "(set agents.defaults.workspace)"
		});
	} else runtime.log(`Config OK: ${formatConfigPath(configPath)}`);
	const ws = await ensureAgentWorkspace({
		dir: workspace,
		ensureBootstrapFiles: !next.agents?.defaults?.skipBootstrap
	});
	runtime.log(`Workspace OK: ${shortenHomePath(ws.dir)}`);
	const sessionsDir = resolveSessionTranscriptsDir();
	await fs.mkdir(sessionsDir, { recursive: true });
	runtime.log(`Sessions OK: ${shortenHomePath(sessionsDir)}`);
}

//#endregion
//#region src/cli/program/register.setup.ts
function registerSetupCommand(program) {
	program.command("setup").description("Initialize ~/.openclaw/openclaw.json and the agent workspace").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/setup", "docs.openclaw.ai/cli/setup")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace; stored as agents.defaults.workspace)").option("--wizard", "Run the interactive onboarding wizard", false).option("--non-interactive", "Run the wizard without prompts", false).option("--mode <mode>", "Wizard mode: local|remote").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").action(async (opts, command) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const hasWizardFlags = hasExplicitOptions(command, [
				"wizard",
				"nonInteractive",
				"mode",
				"remoteUrl",
				"remoteToken"
			]);
			if (opts.wizard || hasWizardFlags) {
				await onboardCommand({
					workspace: opts.workspace,
					nonInteractive: Boolean(opts.nonInteractive),
					mode: opts.mode,
					remoteUrl: opts.remoteUrl,
					remoteToken: opts.remoteToken
				}, defaultRuntime);
				return;
			}
			await setupCommand({ workspace: opts.workspace }, defaultRuntime);
		});
	});
}

//#endregion
export { registerSetupCommand };