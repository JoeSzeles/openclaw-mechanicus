import { Dt as theme, _ as defaultRuntime } from "./entry.js";
import "./auth-profiles-Cn5oo5Dj.js";
import "./exec-CBKBIMpA.js";
import "./agent-scope-F21xRiu_.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./pi-auth-json-BrT0mGxa.js";
import "./model-BipDi6tz.js";
import "./pi-model-discovery-C5wXDGiT.js";
import "./frontmatter-DRl3Sa-X.js";
import "./skills-BNzMUqt1.js";
import "./manifest-registry-CYUiqtAr.js";
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
import { n as runCommandWithRuntime, t as resolveOptionFromCommand } from "./cli-utils-f9j-_1VT.js";
import "./help-format-5GFCgEVf.js";
import "./progress-Clpi3Ckj.js";
import "./replies-BFcCU9NN.js";
import "./pi-tools.policy-qbAa35WM.js";
import "./onboard-helpers-C223CFn-.js";
import "./prompt-style-B_yUCLn4.js";
import "./pairing-labels-3nsEq_HC.js";
import "./note-zyFEolLt.js";
import "./clack-prompter-BevfCaG8.js";
import "./table-Ca0mornk.js";
import "./shared-wRpn8Uwz.js";
import "./auth-token-BXxdQVkS.js";
import "./logging-PVQxLC6I.js";
import { c as githubCopilotLoginCommand } from "./provider-auth-helpers-p9nEihEd.js";
import { C as modelsAliasesListCommand, S as modelsAliasesAddCommand, _ as modelsAuthOrderSetCommand, a as modelsStatusCommand, b as modelsAuthPasteTokenCommand, c as modelsImageFallbacksClearCommand, d as modelsFallbacksAddCommand, f as modelsFallbacksClearCommand, g as modelsAuthOrderGetCommand, h as modelsAuthOrderClearCommand, i as modelsScanCommand, l as modelsImageFallbacksListCommand, m as modelsFallbacksRemoveCommand, n as modelsSetImageCommand, o as modelsListCommand, p as modelsFallbacksListCommand, r as modelsSetCommand, s as modelsImageFallbacksAddCommand, u as modelsImageFallbacksRemoveCommand, v as modelsAuthAddCommand, w as modelsAliasesRemoveCommand, x as modelsAuthSetupTokenCommand, y as modelsAuthLoginCommand } from "./models-DEDgLURB.js";
import "./auth-health-QOY0SpK-.js";

//#region src/cli/models-cli.ts
function runModelsCommand(action) {
	return runCommandWithRuntime(defaultRuntime, action);
}
function registerModelsCli(program) {
	const models = program.command("models").description("Model discovery, scanning, and configuration").option("--status-json", "Output JSON (alias for `models status --json`)", false).option("--status-plain", "Plain output (alias for `models status --plain`)", false).option("--agent <id>", "Agent id to inspect (overrides OPENCLAW_AGENT_DIR/PI_CODING_AGENT_DIR)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/models", "docs.openclaw.ai/cli/models")}\n`);
	models.command("list").description("List models (configured by default)").option("--all", "Show full model catalog", false).option("--local", "Filter to local models", false).option("--provider <name>", "Filter by provider").option("--json", "Output JSON", false).option("--plain", "Plain line output", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsListCommand(opts, defaultRuntime);
		});
	});
	models.command("status").description("Show configured model state").option("--json", "Output JSON", false).option("--plain", "Plain output", false).option("--check", "Exit non-zero if auth is expiring/expired (1=expired/missing, 2=expiring)", false).option("--probe", "Probe configured provider auth (live)", false).option("--probe-provider <name>", "Only probe a single provider").option("--probe-profile <id>", "Only probe specific auth profile ids (repeat or comma-separated)", (value, previous) => {
		const next = Array.isArray(previous) ? previous : previous ? [previous] : [];
		next.push(value);
		return next;
	}).option("--probe-timeout <ms>", "Per-probe timeout in ms").option("--probe-concurrency <n>", "Concurrent probes").option("--probe-max-tokens <n>", "Probe max tokens (best-effort)").option("--agent <id>", "Agent id to inspect (overrides OPENCLAW_AGENT_DIR/PI_CODING_AGENT_DIR)").action(async (opts, command) => {
		const agent = resolveOptionFromCommand(command, "agent") ?? opts.agent;
		await runModelsCommand(async () => {
			await modelsStatusCommand({
				json: Boolean(opts.json),
				plain: Boolean(opts.plain),
				check: Boolean(opts.check),
				probe: Boolean(opts.probe),
				probeProvider: opts.probeProvider,
				probeProfile: opts.probeProfile,
				probeTimeout: opts.probeTimeout,
				probeConcurrency: opts.probeConcurrency,
				probeMaxTokens: opts.probeMaxTokens,
				agent
			}, defaultRuntime);
		});
	});
	models.command("set").description("Set the default model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsSetCommand(model, defaultRuntime);
		});
	});
	models.command("set-image").description("Set the image model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsSetImageCommand(model, defaultRuntime);
		});
	});
	const aliases = models.command("aliases").description("Manage model aliases");
	aliases.command("list").description("List model aliases").option("--json", "Output JSON", false).option("--plain", "Plain output", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsAliasesListCommand(opts, defaultRuntime);
		});
	});
	aliases.command("add").description("Add or update a model alias").argument("<alias>", "Alias name").argument("<model>", "Model id or alias").action(async (alias, model) => {
		await runModelsCommand(async () => {
			await modelsAliasesAddCommand(alias, model, defaultRuntime);
		});
	});
	aliases.command("remove").description("Remove a model alias").argument("<alias>", "Alias name").action(async (alias) => {
		await runModelsCommand(async () => {
			await modelsAliasesRemoveCommand(alias, defaultRuntime);
		});
	});
	const fallbacks = models.command("fallbacks").description("Manage model fallback list");
	fallbacks.command("list").description("List fallback models").option("--json", "Output JSON", false).option("--plain", "Plain output", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsFallbacksListCommand(opts, defaultRuntime);
		});
	});
	fallbacks.command("add").description("Add a fallback model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsFallbacksAddCommand(model, defaultRuntime);
		});
	});
	fallbacks.command("remove").description("Remove a fallback model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsFallbacksRemoveCommand(model, defaultRuntime);
		});
	});
	fallbacks.command("clear").description("Clear all fallback models").action(async () => {
		await runModelsCommand(async () => {
			await modelsFallbacksClearCommand(defaultRuntime);
		});
	});
	const imageFallbacks = models.command("image-fallbacks").description("Manage image model fallback list");
	imageFallbacks.command("list").description("List image fallback models").option("--json", "Output JSON", false).option("--plain", "Plain output", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsImageFallbacksListCommand(opts, defaultRuntime);
		});
	});
	imageFallbacks.command("add").description("Add an image fallback model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsImageFallbacksAddCommand(model, defaultRuntime);
		});
	});
	imageFallbacks.command("remove").description("Remove an image fallback model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsImageFallbacksRemoveCommand(model, defaultRuntime);
		});
	});
	imageFallbacks.command("clear").description("Clear all image fallback models").action(async () => {
		await runModelsCommand(async () => {
			await modelsImageFallbacksClearCommand(defaultRuntime);
		});
	});
	models.command("scan").description("Scan OpenRouter free models for tools + images").option("--min-params <b>", "Minimum parameter size (billions)").option("--max-age-days <days>", "Skip models older than N days").option("--provider <name>", "Filter by provider prefix").option("--max-candidates <n>", "Max fallback candidates", "6").option("--timeout <ms>", "Per-probe timeout in ms").option("--concurrency <n>", "Probe concurrency").option("--no-probe", "Skip live probes; list free candidates only").option("--yes", "Accept defaults without prompting", false).option("--no-input", "Disable prompts (use defaults)").option("--set-default", "Set agents.defaults.model to the first selection", false).option("--set-image", "Set agents.defaults.imageModel to the first image selection", false).option("--json", "Output JSON", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsScanCommand(opts, defaultRuntime);
		});
	});
	models.action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsStatusCommand({
				json: Boolean(opts?.statusJson),
				plain: Boolean(opts?.statusPlain),
				agent: opts?.agent
			}, defaultRuntime);
		});
	});
	const auth = models.command("auth").description("Manage model auth profiles");
	auth.option("--agent <id>", "Agent id for auth order get/set/clear");
	auth.action(() => {
		auth.help();
	});
	auth.command("add").description("Interactive auth helper (setup-token or paste token)").action(async () => {
		await runModelsCommand(async () => {
			await modelsAuthAddCommand({}, defaultRuntime);
		});
	});
	auth.command("login").description("Run a provider plugin auth flow (OAuth/API key)").option("--provider <id>", "Provider id registered by a plugin").option("--method <id>", "Provider auth method id").option("--set-default", "Apply the provider's default model recommendation", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsAuthLoginCommand({
				provider: opts.provider,
				method: opts.method,
				setDefault: Boolean(opts.setDefault)
			}, defaultRuntime);
		});
	});
	auth.command("setup-token").description("Run a provider CLI to create/sync a token (TTY required)").option("--provider <name>", "Provider id (default: anthropic)").option("--yes", "Skip confirmation", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsAuthSetupTokenCommand({
				provider: opts.provider,
				yes: Boolean(opts.yes)
			}, defaultRuntime);
		});
	});
	auth.command("paste-token").description("Paste a token into auth-profiles.json and update config").requiredOption("--provider <name>", "Provider id (e.g. anthropic)").option("--profile-id <id>", "Auth profile id (default: <provider>:manual)").option("--expires-in <duration>", "Optional expiry duration (e.g. 365d, 12h). Stored as absolute expiresAt.").action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsAuthPasteTokenCommand({
				provider: opts.provider,
				profileId: opts.profileId,
				expiresIn: opts.expiresIn
			}, defaultRuntime);
		});
	});
	auth.command("login-github-copilot").description("Login to GitHub Copilot via GitHub device flow (TTY required)").option("--profile-id <id>", "Auth profile id (default: github-copilot:github)").option("--yes", "Overwrite existing profile without prompting", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await githubCopilotLoginCommand({
				profileId: opts.profileId,
				yes: Boolean(opts.yes)
			}, defaultRuntime);
		});
	});
	const order = auth.command("order").description("Manage per-agent auth profile order overrides");
	order.command("get").description("Show per-agent auth order override (from auth-profiles.json)").requiredOption("--provider <name>", "Provider id (e.g. anthropic)").option("--agent <id>", "Agent id (default: configured default agent)").option("--json", "Output JSON", false).action(async (opts, command) => {
		const agent = resolveOptionFromCommand(command, "agent") ?? opts.agent;
		await runModelsCommand(async () => {
			await modelsAuthOrderGetCommand({
				provider: opts.provider,
				agent,
				json: Boolean(opts.json)
			}, defaultRuntime);
		});
	});
	order.command("set").description("Set per-agent auth order override (locks rotation to this list)").requiredOption("--provider <name>", "Provider id (e.g. anthropic)").option("--agent <id>", "Agent id (default: configured default agent)").argument("<profileIds...>", "Auth profile ids (e.g. anthropic:default)").action(async (profileIds, opts, command) => {
		const agent = resolveOptionFromCommand(command, "agent") ?? opts.agent;
		await runModelsCommand(async () => {
			await modelsAuthOrderSetCommand({
				provider: opts.provider,
				agent,
				order: profileIds
			}, defaultRuntime);
		});
	});
	order.command("clear").description("Clear per-agent auth order override (fall back to config/round-robin)").requiredOption("--provider <name>", "Provider id (e.g. anthropic)").option("--agent <id>", "Agent id (default: configured default agent)").action(async (opts, command) => {
		const agent = resolveOptionFromCommand(command, "agent") ?? opts.agent;
		await runModelsCommand(async () => {
			await modelsAuthOrderClearCommand({
				provider: opts.provider,
				agent
			}, defaultRuntime);
		});
	});
}

//#endregion
export { registerModelsCli };