import { Dt as theme, Et as isRich, X as escapeRegExp, _ as defaultRuntime, cn as hasHelpOrVersion, n as isTruthyEnvValue, nn as getCommandPath, on as getVerboseFlag, xt as setVerbose } from "./entry.js";
import "./auth-profiles-Cn5oo5Dj.js";
import { n as replaceCliName, r as resolveCliName } from "./command-format-Cutkv9UT.js";
import "./exec-CBKBIMpA.js";
import "./agent-scope-F21xRiu_.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./model-BipDi6tz.js";
import "./pi-model-discovery-C5wXDGiT.js";
import "./frontmatter-DRl3Sa-X.js";
import "./skills-BNzMUqt1.js";
import "./manifest-registry-CYUiqtAr.js";
import { F as VERSION } from "./config-jQwklJz3.js";
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
import "./cli-utils-f9j-_1VT.js";
import "./help-format-5GFCgEVf.js";
import "./progress-Clpi3Ckj.js";
import "./replies-BFcCU9NN.js";
import "./pi-tools.policy-qbAa35WM.js";
import "./onboard-helpers-C223CFn-.js";
import "./prompt-style-B_yUCLn4.js";
import "./pairing-labels-3nsEq_HC.js";
import "./catalog-CaTRjmGt.js";
import "./plugin-registry-zcaZWuxu.js";
import { n as resolveCliChannelOptions } from "./channel-options-BBKUDwrm.js";
import { t as getSubCliCommandsWithSubcommands } from "./register.subclis-BTiMm1jW.js";
import { a as registerProgramCommands, r as getCoreCliCommandsWithSubcommands } from "./command-registry-BbV8FBPI.js";
import { r as setProgramContext } from "./program-context--isQKnLs.js";
import { t as forceFreePort } from "./ports-ChZdzLQI.js";
import { n as formatCliBannerLine, r as hasEmittedCliBanner, t as emitCliBanner } from "./banner-B2fpY5Aa.js";
import { Command } from "commander";

//#region src/cli/program/context.ts
function createProgramContext() {
	const channelOptions = resolveCliChannelOptions();
	return {
		programVersion: VERSION,
		channelOptions,
		messageChannelOptions: channelOptions.join("|"),
		agentChannelOptions: ["last", ...channelOptions].join("|")
	};
}

//#endregion
//#region src/cli/program/help.ts
const CLI_NAME = resolveCliName();
const CLI_NAME_PATTERN = escapeRegExp(CLI_NAME);
const ROOT_COMMANDS_WITH_SUBCOMMANDS = new Set([...getCoreCliCommandsWithSubcommands(), ...getSubCliCommandsWithSubcommands()]);
const ROOT_COMMANDS_HINT = "Hint: commands suffixed with * have subcommands. Run <command> --help for details.";
const EXAMPLES = [
	["openclaw models --help", "Show detailed help for the models command."],
	["openclaw channels login --verbose", "Link personal WhatsApp Web and show QR + connection logs."],
	["openclaw message send --target +15555550123 --message \"Hi\" --json", "Send via your web session and print JSON result."],
	["openclaw gateway --port 18789", "Run the WebSocket Gateway locally."],
	["openclaw --dev gateway", "Run a dev Gateway (isolated state/config) on ws://127.0.0.1:19001."],
	["openclaw gateway --force", "Kill anything bound to the default gateway port, then start it."],
	["openclaw gateway ...", "Gateway control via WebSocket."],
	["openclaw agent --to +15555550123 --message \"Run summary\" --deliver", "Talk directly to the agent using the Gateway; optionally send the WhatsApp reply."],
	["openclaw message send --channel telegram --target @mychat --message \"Hi\"", "Send via your Telegram bot."]
];
function configureProgramHelp(program, ctx) {
	program.name(CLI_NAME).description("").version(ctx.programVersion).option("--dev", "Dev profile: isolate state under ~/.openclaw-dev, default gateway port 19001, and shift derived ports (browser/canvas)").option("--profile <name>", "Use a named profile (isolates OPENCLAW_STATE_DIR/OPENCLAW_CONFIG_PATH under ~/.openclaw-<name>)");
	program.option("--no-color", "Disable ANSI colors", false);
	program.helpOption("-h, --help", "Display help for command");
	program.helpCommand("help [command]", "Display help for command");
	program.configureHelp({
		sortSubcommands: true,
		sortOptions: true,
		optionTerm: (option) => theme.option(option.flags),
		subcommandTerm: (cmd) => {
			const hasSubcommands = cmd.parent === program && ROOT_COMMANDS_WITH_SUBCOMMANDS.has(cmd.name());
			return theme.command(hasSubcommands ? `${cmd.name()} *` : cmd.name());
		}
	});
	const formatHelpOutput = (str) => {
		let output = str;
		if (new RegExp(`^Usage:\\s+${CLI_NAME_PATTERN}\\s+\\[options\\]\\s+\\[command\\]\\s*$`, "m").test(output) && /^Commands:/m.test(output)) output = output.replace(/^Commands:/m, `Commands:\n  ${theme.muted(ROOT_COMMANDS_HINT)}`);
		return output.replace(/^Usage:/gm, theme.heading("Usage:")).replace(/^Options:/gm, theme.heading("Options:")).replace(/^Commands:/gm, theme.heading("Commands:"));
	};
	program.configureOutput({
		writeOut: (str) => {
			process.stdout.write(formatHelpOutput(str));
		},
		writeErr: (str) => {
			process.stderr.write(formatHelpOutput(str));
		},
		outputError: (str, write) => write(theme.error(str))
	});
	if (process.argv.includes("-V") || process.argv.includes("--version") || process.argv.includes("-v")) {
		console.log(ctx.programVersion);
		process.exit(0);
	}
	program.addHelpText("beforeAll", () => {
		if (hasEmittedCliBanner()) return "";
		const rich = isRich();
		return `\n${formatCliBannerLine(ctx.programVersion, { richTty: rich })}\n`;
	});
	const fmtExamples = EXAMPLES.map(([cmd, desc]) => `  ${theme.command(replaceCliName(cmd, CLI_NAME))}\n    ${theme.muted(desc)}`).join("\n");
	program.addHelpText("afterAll", ({ command }) => {
		if (command !== program) return "";
		const docs = formatDocsLink("/cli", "docs.openclaw.ai/cli");
		return `\n${theme.heading("Examples:")}\n${fmtExamples}\n\n${theme.muted("Docs:")} ${docs}\n`;
	});
}

//#endregion
//#region src/cli/program/preaction.ts
function setProcessTitleForCommand(actionCommand) {
	let current = actionCommand;
	while (current.parent && current.parent.parent) current = current.parent;
	const name = current.name();
	const cliName = resolveCliName();
	if (!name || name === cliName) return;
	process.title = `${cliName}-${name}`;
}
const PLUGIN_REQUIRED_COMMANDS = new Set([
	"message",
	"channels",
	"directory"
]);
function registerPreActionHooks(program, programVersion) {
	program.hook("preAction", async (_thisCommand, actionCommand) => {
		setProcessTitleForCommand(actionCommand);
		const argv = process.argv;
		if (hasHelpOrVersion(argv)) return;
		const commandPath = getCommandPath(argv, 2);
		if (!(isTruthyEnvValue(process.env.OPENCLAW_HIDE_BANNER) || commandPath[0] === "update" || commandPath[0] === "completion" || commandPath[0] === "plugins" && commandPath[1] === "update")) emitCliBanner(programVersion);
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		setVerbose(verbose);
		if (!verbose) process.env.NODE_NO_WARNINGS ??= "1";
		if (commandPath[0] === "doctor" || commandPath[0] === "completion") return;
		const { ensureConfigReady } = await import("./config-guard-DESITOnh.js").then((n) => n.t);
		await ensureConfigReady({
			runtime: defaultRuntime,
			commandPath
		});
		if (PLUGIN_REQUIRED_COMMANDS.has(commandPath[0])) {
			const { ensurePluginRegistryLoaded } = await import("./plugin-registry-zcaZWuxu.js").then((n) => n.n);
			ensurePluginRegistryLoaded();
		}
	});
}

//#endregion
//#region src/cli/program/build-program.ts
function buildProgram() {
	const program = new Command();
	const ctx = createProgramContext();
	const argv = process.argv;
	setProgramContext(program, ctx);
	configureProgramHelp(program, ctx);
	registerPreActionHooks(program, ctx.programVersion);
	registerProgramCommands(program, ctx, argv);
	return program;
}

//#endregion
export { buildProgram };