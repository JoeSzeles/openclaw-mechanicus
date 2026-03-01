import "./paths-B4BZAPZh.js";
import { B as theme } from "./utils-CFnnyoTP.js";
import "./thinking-EAliFiVK.js";
import "./reply-CdswmPvF.js";
import "./registry-D74-I5q-.js";
import { f as defaultRuntime } from "./subsystem-oVAQxyhr.js";
import "./exec-i2CMvUxK.js";
import "./agent-scope-CrP-i2MF.js";
import "./model-selection-CqXyRThV.js";
import "./github-copilot-token-D2zp6kMZ.js";
import "./boolean-BsqeuxE6.js";
import "./env-BV0iTNjd.js";
import "./config-i7AorPvh.js";
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
import "./paths-gjLMn4eA.js";
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
import "./daemon-runtime-B8f74KKp.js";
import "./systemd-l67v3f-x.js";
import "./service-CM-tm0wo.js";
import "./health-DD2su2XW.js";
import "./onboarding-BzJ4H2dG.js";
import "./shared-MTiRhHx9.js";
import "./auth-token-ir10egLB.js";
import "./logging-Cjvw5J7n.js";
import { n as formatAuthChoiceChoicesForCli } from "./auth-choice-options-B4GnEmY_.js";
import "./openai-model-default-DQbdlTev.js";
import "./vllm-setup-CLpzjzYh.js";
import "./systemd-linger-BAE3B_WL.js";
import "./model-picker-DwDOuVfj.js";
import "./onboard-custom-DNv5Qfe6.js";
import { n as ONBOARD_PROVIDER_AUTH_FLAGS, t as onboardCommand } from "./onboard-CnZULzBY.js";

//#region src/cli/program/register.onboard.ts
function resolveInstallDaemonFlag(command, opts) {
	if (!command || typeof command !== "object") return;
	const getOptionValueSource = "getOptionValueSource" in command ? command.getOptionValueSource : void 0;
	if (typeof getOptionValueSource !== "function") return;
	if (getOptionValueSource.call(command, "skipDaemon") === "cli") return false;
	if (getOptionValueSource.call(command, "installDaemon") === "cli") return Boolean(opts.installDaemon);
}
const AUTH_CHOICE_HELP = formatAuthChoiceChoicesForCli({
	includeLegacyAliases: true,
	includeSkip: true
});
function registerOnboardCommand(program) {
	const command = program.command("onboard").description("Interactive wizard to set up the gateway, workspace, and skills").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/onboard", "docs.openclaw.ai/cli/onboard")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace)").option("--reset", "Reset config + credentials + sessions + workspace before running wizard").option("--non-interactive", "Run without prompts", false).option("--accept-risk", "Acknowledge that agents are powerful and full system access is risky (required for --non-interactive)", false).option("--flow <flow>", "Wizard flow: quickstart|advanced|manual").option("--mode <mode>", "Wizard mode: local|remote").option("--auth-choice <choice>", `Auth: ${AUTH_CHOICE_HELP}`).option("--token-provider <id>", "Token provider id (non-interactive; used with --auth-choice token)").option("--token <token>", "Token value (non-interactive; used with --auth-choice token)").option("--token-profile-id <id>", "Auth profile id (non-interactive; default: <provider>:manual)").option("--token-expires-in <duration>", "Optional token expiry duration (e.g. 365d, 12h)").option("--cloudflare-ai-gateway-account-id <id>", "Cloudflare Account ID").option("--cloudflare-ai-gateway-gateway-id <id>", "Cloudflare AI Gateway ID");
	for (const providerFlag of ONBOARD_PROVIDER_AUTH_FLAGS) command.option(providerFlag.cliOption, providerFlag.description);
	command.option("--custom-base-url <url>", "Custom provider base URL").option("--custom-api-key <key>", "Custom provider API key (optional)").option("--custom-model-id <id>", "Custom provider model ID").option("--custom-provider-id <id>", "Custom provider ID (optional; auto-derived by default)").option("--custom-compatibility <mode>", "Custom provider API compatibility: openai|anthropic (default: openai)").option("--gateway-port <port>", "Gateway port").option("--gateway-bind <mode>", "Gateway bind: loopback|tailnet|lan|auto|custom").option("--gateway-auth <mode>", "Gateway auth: token|password").option("--gateway-token <token>", "Gateway token (token auth)").option("--gateway-password <password>", "Gateway password (password auth)").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").option("--tailscale <mode>", "Tailscale: off|serve|funnel").option("--tailscale-reset-on-exit", "Reset tailscale serve/funnel on exit").option("--install-daemon", "Install gateway service").option("--no-install-daemon", "Skip gateway service install").option("--skip-daemon", "Skip gateway service install").option("--daemon-runtime <runtime>", "Daemon runtime: node|bun").option("--skip-channels", "Skip channel setup").option("--skip-skills", "Skip skills setup").option("--skip-health", "Skip health check").option("--skip-ui", "Skip Control UI/TUI prompts").option("--node-manager <name>", "Node manager for skills: npm|pnpm|bun").option("--json", "Output JSON summary", false);
	command.action(async (opts, commandRuntime) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const installDaemon = resolveInstallDaemonFlag(commandRuntime, { installDaemon: Boolean(opts.installDaemon) });
			const gatewayPort = typeof opts.gatewayPort === "string" ? Number.parseInt(opts.gatewayPort, 10) : void 0;
			await onboardCommand({
				workspace: opts.workspace,
				nonInteractive: Boolean(opts.nonInteractive),
				acceptRisk: Boolean(opts.acceptRisk),
				flow: opts.flow,
				mode: opts.mode,
				authChoice: opts.authChoice,
				tokenProvider: opts.tokenProvider,
				token: opts.token,
				tokenProfileId: opts.tokenProfileId,
				tokenExpiresIn: opts.tokenExpiresIn,
				anthropicApiKey: opts.anthropicApiKey,
				openaiApiKey: opts.openaiApiKey,
				openrouterApiKey: opts.openrouterApiKey,
				aiGatewayApiKey: opts.aiGatewayApiKey,
				cloudflareAiGatewayAccountId: opts.cloudflareAiGatewayAccountId,
				cloudflareAiGatewayGatewayId: opts.cloudflareAiGatewayGatewayId,
				cloudflareAiGatewayApiKey: opts.cloudflareAiGatewayApiKey,
				moonshotApiKey: opts.moonshotApiKey,
				kimiCodeApiKey: opts.kimiCodeApiKey,
				geminiApiKey: opts.geminiApiKey,
				zaiApiKey: opts.zaiApiKey,
				xiaomiApiKey: opts.xiaomiApiKey,
				qianfanApiKey: opts.qianfanApiKey,
				minimaxApiKey: opts.minimaxApiKey,
				syntheticApiKey: opts.syntheticApiKey,
				veniceApiKey: opts.veniceApiKey,
				togetherApiKey: opts.togetherApiKey,
				huggingfaceApiKey: opts.huggingfaceApiKey,
				opencodeZenApiKey: opts.opencodeZenApiKey,
				xaiApiKey: opts.xaiApiKey,
				litellmApiKey: opts.litellmApiKey,
				customBaseUrl: opts.customBaseUrl,
				customApiKey: opts.customApiKey,
				customModelId: opts.customModelId,
				customProviderId: opts.customProviderId,
				customCompatibility: opts.customCompatibility,
				gatewayPort: typeof gatewayPort === "number" && Number.isFinite(gatewayPort) ? gatewayPort : void 0,
				gatewayBind: opts.gatewayBind,
				gatewayAuth: opts.gatewayAuth,
				gatewayToken: opts.gatewayToken,
				gatewayPassword: opts.gatewayPassword,
				remoteUrl: opts.remoteUrl,
				remoteToken: opts.remoteToken,
				tailscale: opts.tailscale,
				tailscaleResetOnExit: Boolean(opts.tailscaleResetOnExit),
				reset: Boolean(opts.reset),
				installDaemon,
				daemonRuntime: opts.daemonRuntime,
				skipChannels: Boolean(opts.skipChannels),
				skipSkills: Boolean(opts.skipSkills),
				skipHealth: Boolean(opts.skipHealth),
				skipUi: Boolean(opts.skipUi),
				nodeManager: opts.nodeManager,
				json: Boolean(opts.json)
			}, defaultRuntime);
		});
	});
}

//#endregion
export { registerOnboardCommand };