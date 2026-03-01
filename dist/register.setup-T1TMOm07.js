import "./paths-B4BZAPZh.js";
import { B as theme, C as shortenHomePath } from "./utils-CFnnyoTP.js";
import "./thinking-EAliFiVK.js";
import "./reply-CdswmPvF.js";
import "./registry-D74-I5q-.js";
import { f as defaultRuntime } from "./subsystem-oVAQxyhr.js";
import "./exec-i2CMvUxK.js";
import { S as ensureAgentWorkspace, p as DEFAULT_AGENT_WORKSPACE_DIR } from "./agent-scope-CrP-i2MF.js";
import "./model-selection-CqXyRThV.js";
import "./github-copilot-token-D2zp6kMZ.js";
import "./boolean-BsqeuxE6.js";
import "./env-BV0iTNjd.js";
import { l as writeConfigFile, r as createConfigIO } from "./config-i7AorPvh.js";
import "./manifest-registry-DoaWeDHN.js";
import "./runner-DchbsNd6.js";
import "./image-Bqk8GHw8.js";
import "./models-config-BPPFB5li.js";
import "./pi-model-discovery-DX1x3UsN.js";
import "./pi-embedded-helpers-ClaUaHjK.js";
import "./sandbox-DslYImdg.js";
import "./chrome-DuvmuAVy.js";
import "./tailscale-B2RP0O39.js";
import "./auth-Kz-t4hed.js";
import "./server-context-AyirCMgd.js";
import "./frontmatter-DrdSsH4-.js";
import "./skills-CL_0AHFf.js";
import "./routes-BKooeuMt.js";
import "./redact-CjJyQlVU.js";
import "./errors-CdJjJ1Jq.js";
import "./paths-CWc9mjAN.js";
import "./ssrf-Bhv0qRd-.js";
import "./image-ops-ib1_UDIa.js";
import "./store-CHQKN-y-.js";
import "./ports-Dru7vIR6.js";
import "./trash-DhlImRqi.js";
import "./message-channel-B11syIWY.js";
import "./sessions-B7E6-emA.js";
import "./dock-Bdl338Dx.js";
import "./accounts-BWv_S14y.js";
import "./normalize-C23emibo.js";
import "./accounts-FP3Dx3m5.js";
import "./accounts-CgV6POP2.js";
import "./bindings-CssSUqXx.js";
import "./logging-D3KTM1pH.js";
import "./send-BIdX5vie.js";
import "./plugins-MECKrdj4.js";
import "./send-BiJ2KuXW.js";
import { o as resolveSessionTranscriptsDir } from "./paths-gjLMn4eA.js";
import "./tool-images-DFl3AXDm.js";
import "./tool-display-BRqP7S2f.js";
import "./fetch-guard-fVA6JVFp.js";
import "./fetch-DlQT4W4E.js";
import "./model-catalog-BTBFlq8q.js";
import "./tokens-sV_zGSb7.js";
import "./with-timeout-BS9rKTwQ.js";
import "./deliver-AZBeUz22.js";
import "./diagnostic-B81gAc3S.js";
import "./diagnostic-session-state-d6bm-JJd.js";
import "./send-5pxMz8H0.js";
import "./model-BiTxa1i7.js";
import "./reply-prefix-Dk5Tb9So.js";
import "./memory-cli-CMnQ-2uh.js";
import "./manager-DMlMOHzk.js";
import "./sqlite-DWNRhtfU.js";
import "./retry-CsJdgSl0.js";
import "./common-C5isiZ_Z.js";
import "./chunk-DcqcJHjP.js";
import "./markdown-tables-CQQzFscn.js";
import "./ir-CPmg2HMv.js";
import "./render-CXDO_kgw.js";
import "./commands-registry-BmVWzbOo.js";
import "./client--PPEaq3E.js";
import "./call-BC26-1k1.js";
import "./channel-activity-4gYIj57z.js";
import "./fetch-D_cxmFbk.js";
import "./tables-BJY31-CG.js";
import "./send-CkMWXdm_.js";
import "./pairing-store-CsSXI6EC.js";
import "./proxy-bT3c25cJ.js";
import { t as formatDocsLink } from "./links-C8IJn_HH.js";
import { n as runCommandWithRuntime } from "./cli-utils-BqMwAlgf.js";
import "./help-format-BwCqDl6O.js";
import "./progress-By07Lltm.js";
import "./resolve-route-CMiOzrE9.js";
import "./replies-Bs5_YhFh.js";
import "./skill-commands-DAQnAiV6.js";
import "./workspace-dirs-CcREWmBd.js";
import "./pi-tools.policy-1sPKjjOu.js";
import "./send-DvLRJo-T.js";
import "./onboard-helpers-4IIGckKQ.js";
import "./prompt-style-K932lPCL.js";
import "./outbound-attachment-CO0tbY9_.js";
import "./pairing-labels-DvVTrpil.js";
import "./session-cost-usage-C72DlXmh.js";
import "./nodes-screen-BVo2a8We.js";
import "./control-service-Bf-7-beo.js";
import "./stagger-xzJwPnK6.js";
import "./channel-selection-z5hlR27m.js";
import "./delivery-queue-fx8E3HqU.js";
import "./runtime-guard-DLhZHmF6.js";
import "./note-C2gAZhIE.js";
import "./clack-prompter-BV7b_wr-.js";
import { t as hasExplicitOptions } from "./command-options-ekXfvGPo.js";
import "./daemon-runtime-B8f74KKp.js";
import "./systemd-l67v3f-x.js";
import "./service-CM-tm0wo.js";
import "./health-DD2su2XW.js";
import "./onboarding-BzJ4H2dG.js";
import "./shared-MTiRhHx9.js";
import "./auth-token-ir10egLB.js";
import { n as logConfigUpdated, t as formatConfigPath } from "./logging-Cjvw5J7n.js";
import "./openai-model-default-DQbdlTev.js";
import "./vllm-setup-CLpzjzYh.js";
import "./systemd-linger-BAE3B_WL.js";
import "./model-picker-DwDOuVfj.js";
import "./onboard-custom-DNv5Qfe6.js";
import { t as onboardCommand } from "./onboard-CnZULzBY.js";
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