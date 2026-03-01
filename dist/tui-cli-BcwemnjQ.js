import "./paths-B4BZAPZh.js";
import { B as theme } from "./utils-CFnnyoTP.js";
import "./thinking-EAliFiVK.js";
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
import "./plugins-MECKrdj4.js";
import "./paths-gjLMn4eA.js";
import "./tool-images-DFl3AXDm.js";
import "./tool-display-BRqP7S2f.js";
import "./commands-registry-BmVWzbOo.js";
import "./client--PPEaq3E.js";
import "./call-BC26-1k1.js";
import { t as formatDocsLink } from "./links-C8IJn_HH.js";
import { t as parseTimeoutMs } from "./parse-timeout-DjZJaZxW.js";
import { t as runTui } from "./tui-B10UQ3wg.js";

//#region src/cli/tui-cli.ts
function registerTuiCli(program) {
	program.command("tui").description("Open a terminal UI connected to the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (if required)").option("--session <key>", "Session key (default: \"main\", or \"global\" when scope is global)").option("--deliver", "Deliver assistant replies", false).option("--thinking <level>", "Thinking level override").option("--message <text>", "Send an initial message after connecting").option("--timeout-ms <ms>", "Agent timeout in ms (defaults to agents.defaults.timeoutSeconds)").option("--history-limit <n>", "History entries to load", "200").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/tui", "docs.openclaw.ai/cli/tui")}\n`).action(async (opts) => {
		try {
			const timeoutMs = parseTimeoutMs(opts.timeoutMs);
			if (opts.timeoutMs !== void 0 && timeoutMs === void 0) defaultRuntime.error(`warning: invalid --timeout-ms "${String(opts.timeoutMs)}"; ignoring`);
			const historyLimit = Number.parseInt(String(opts.historyLimit ?? "200"), 10);
			await runTui({
				url: opts.url,
				token: opts.token,
				password: opts.password,
				session: opts.session,
				deliver: Boolean(opts.deliver),
				thinking: opts.thinking,
				message: opts.message,
				timeoutMs,
				historyLimit: Number.isNaN(historyLimit) ? void 0 : historyLimit
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
export { registerTuiCli };