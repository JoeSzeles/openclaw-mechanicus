import { t as DEFAULT_ACCOUNT_ID } from "./session-key-9yEYlIQe.js";
import { t as formatCliCommand } from "./command-format-Bc6VPcNk.js";
import { r as markdownToIRWithMeta } from "./ir-WzWc9-m7.js";
import { t as renderMarkdownWithMarkers } from "./render-95l30zcf.js";

//#region src/polls.ts
function normalizePollInput(input, options = {}) {
	const question = input.question.trim();
	if (!question) throw new Error("Poll question is required");
	const cleaned = (input.options ?? []).map((option) => option.trim()).filter(Boolean);
	if (cleaned.length < 2) throw new Error("Poll requires at least 2 options");
	if (options.maxOptions !== void 0 && cleaned.length > options.maxOptions) throw new Error(`Poll supports at most ${options.maxOptions} options`);
	const maxSelectionsRaw = input.maxSelections;
	const maxSelections = typeof maxSelectionsRaw === "number" && Number.isFinite(maxSelectionsRaw) ? Math.floor(maxSelectionsRaw) : 1;
	if (maxSelections < 1) throw new Error("maxSelections must be at least 1");
	if (maxSelections > cleaned.length) throw new Error("maxSelections cannot exceed option count");
	const durationSecondsRaw = input.durationSeconds;
	const durationSeconds = typeof durationSecondsRaw === "number" && Number.isFinite(durationSecondsRaw) ? Math.floor(durationSecondsRaw) : void 0;
	if (durationSeconds !== void 0 && durationSeconds < 1) throw new Error("durationSeconds must be at least 1");
	const durationRaw = input.durationHours;
	const durationHours = typeof durationRaw === "number" && Number.isFinite(durationRaw) ? Math.floor(durationRaw) : void 0;
	if (durationHours !== void 0 && durationHours < 1) throw new Error("durationHours must be at least 1");
	if (durationSeconds !== void 0 && durationHours !== void 0) throw new Error("durationSeconds and durationHours are mutually exclusive");
	return {
		question,
		options: cleaned,
		maxSelections,
		durationSeconds,
		durationHours
	};
}
function normalizePollDurationHours(value, options) {
	const base = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : options.defaultHours;
	return Math.min(Math.max(base, 1), options.maxHours);
}

//#endregion
//#region src/markdown/tables.ts
const MARKDOWN_STYLE_MARKERS = {
	bold: {
		open: "**",
		close: "**"
	},
	italic: {
		open: "_",
		close: "_"
	},
	strikethrough: {
		open: "~~",
		close: "~~"
	},
	code: {
		open: "`",
		close: "`"
	},
	code_block: {
		open: "```\n",
		close: "```"
	}
};
function convertMarkdownTables(markdown, mode) {
	if (!markdown || mode === "off") return markdown;
	const { ir, hasTables } = markdownToIRWithMeta(markdown, {
		linkify: false,
		autolink: false,
		headingStyle: "none",
		blockquotePrefix: "",
		tableMode: mode
	});
	if (!hasTables) return markdown;
	return renderMarkdownWithMarkers(ir, {
		styleMarkers: MARKDOWN_STYLE_MARKERS,
		escapeText: (text) => text,
		buildLink: (link, text) => {
			const href = link.href.trim();
			if (!href) return null;
			if (!text.slice(link.start, link.end)) return null;
			return {
				start: link.start,
				end: link.end,
				open: "[",
				close: `](${href})`
			};
		}
	});
}

//#endregion
//#region src/web/active-listener.ts
const listeners = /* @__PURE__ */ new Map();
function resolveWebAccountId(accountId) {
	return (accountId ?? "").trim() || DEFAULT_ACCOUNT_ID;
}
function requireActiveWebListener(accountId) {
	const id = resolveWebAccountId(accountId);
	const listener = listeners.get(id) ?? null;
	if (!listener) throw new Error(`No active WhatsApp Web listener (account: ${id}). Start the gateway, then link WhatsApp with: ${formatCliCommand(`openclaw channels login --channel whatsapp --account ${id}`)}.`);
	return {
		accountId: id,
		listener
	};
}
function setActiveWebListener(accountIdOrListener, maybeListener) {
	const { accountId, listener } = typeof accountIdOrListener === "string" ? {
		accountId: accountIdOrListener,
		listener: maybeListener ?? null
	} : {
		accountId: DEFAULT_ACCOUNT_ID,
		listener: accountIdOrListener ?? null
	};
	const id = resolveWebAccountId(accountId);
	if (!listener) listeners.delete(id);
	else listeners.set(id, listener);
	if (id === DEFAULT_ACCOUNT_ID) {}
}
function getActiveWebListener(accountId) {
	const id = resolveWebAccountId(accountId);
	return listeners.get(id) ?? null;
}

//#endregion
export { normalizePollDurationHours as a, convertMarkdownTables as i, requireActiveWebListener as n, normalizePollInput as o, setActiveWebListener as r, getActiveWebListener as t };