import { r as resolveWhatsAppAccount } from "./accounts-BSywe9Bq.js";
import { c as requireActivePluginRegistry, i as normalizeAnyChannelId, n as CHAT_CHANNEL_ORDER } from "./registry-CvUzfgyU.js";
import { b as resolveDiscordAccount, f as resolveSlackAccount, n as normalizeWhatsAppTarget, s as resolveTelegramAccount, t as isWhatsAppGroupJid } from "./normalize-mEjrgr3H.js";

//#region src/channels/targets.ts
function normalizeTargetId(kind, id) {
	return `${kind}:${id}`.toLowerCase();
}
function buildMessagingTarget(kind, id, raw) {
	return {
		kind,
		id,
		raw,
		normalized: normalizeTargetId(kind, id)
	};
}
function ensureTargetId(params) {
	if (!params.pattern.test(params.candidate)) throw new Error(params.errorMessage);
	return params.candidate;
}
function parseTargetMention(params) {
	const match = params.raw.match(params.mentionPattern);
	if (!match?.[1]) return;
	return buildMessagingTarget(params.kind, match[1], params.raw);
}
function parseTargetPrefix(params) {
	if (!params.raw.startsWith(params.prefix)) return;
	const id = params.raw.slice(params.prefix.length).trim();
	return id ? buildMessagingTarget(params.kind, id, params.raw) : void 0;
}
function parseTargetPrefixes(params) {
	for (const entry of params.prefixes) {
		const parsed = parseTargetPrefix({
			raw: params.raw,
			prefix: entry.prefix,
			kind: entry.kind
		});
		if (parsed) return parsed;
	}
}
function requireTargetKind(params) {
	const kindLabel = params.kind;
	if (!params.target) throw new Error(`${params.platform} ${kindLabel} id is required.`);
	if (params.target.kind !== params.kind) throw new Error(`${params.platform} ${kindLabel} id is required (use ${kindLabel}:<id>).`);
	return params.target.id;
}

//#endregion
//#region src/slack/targets.ts
function parseSlackTarget(raw, options = {}) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	const mentionTarget = parseTargetMention({
		raw: trimmed,
		mentionPattern: /^<@([A-Z0-9]+)>$/i,
		kind: "user"
	});
	if (mentionTarget) return mentionTarget;
	const prefixedTarget = parseTargetPrefixes({
		raw: trimmed,
		prefixes: [
			{
				prefix: "user:",
				kind: "user"
			},
			{
				prefix: "channel:",
				kind: "channel"
			},
			{
				prefix: "slack:",
				kind: "user"
			}
		]
	});
	if (prefixedTarget) return prefixedTarget;
	if (trimmed.startsWith("@")) return buildMessagingTarget("user", ensureTargetId({
		candidate: trimmed.slice(1).trim(),
		pattern: /^[A-Z0-9]+$/i,
		errorMessage: "Slack DMs require a user id (use user:<id> or <@id>)"
	}), trimmed);
	if (trimmed.startsWith("#")) return buildMessagingTarget("channel", ensureTargetId({
		candidate: trimmed.slice(1).trim(),
		pattern: /^[A-Z0-9]+$/i,
		errorMessage: "Slack channels require a channel id (use channel:<id>)"
	}), trimmed);
	if (options.defaultKind) return buildMessagingTarget(options.defaultKind, trimmed, trimmed);
	return buildMessagingTarget("channel", trimmed, trimmed);
}
function resolveSlackChannelId(raw) {
	return requireTargetKind({
		platform: "Slack",
		target: parseSlackTarget(raw, { defaultKind: "channel" }),
		kind: "channel"
	});
}

//#endregion
//#region src/channels/plugins/normalize/slack.ts
function normalizeSlackMessagingTarget(raw) {
	return parseSlackTarget(raw, { defaultKind: "channel" })?.normalized;
}
function looksLikeSlackTargetId(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return false;
	if (/^<@([A-Z0-9]+)>$/i.test(trimmed)) return true;
	if (/^(user|channel):/i.test(trimmed)) return true;
	if (/^slack:/i.test(trimmed)) return true;
	if (/^[@#]/.test(trimmed)) return true;
	return /^[CUWGD][A-Z0-9]{8,}$/i.test(trimmed);
}

//#endregion
//#region src/channels/plugins/directory-config.ts
function addAllowFromAndDmsIds(ids, allowFrom, dms) {
	for (const entry of allowFrom ?? []) {
		const raw = String(entry).trim();
		if (!raw || raw === "*") continue;
		ids.add(raw);
	}
	for (const id of Object.keys(dms ?? {})) {
		const trimmed = id.trim();
		if (trimmed) ids.add(trimmed);
	}
}
async function listSlackDirectoryPeersFromConfig(params) {
	const account = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const q = params.query?.trim().toLowerCase() || "";
	const ids = /* @__PURE__ */ new Set();
	addAllowFromAndDmsIds(ids, account.config.allowFrom ?? account.dm?.allowFrom, account.config.dms);
	for (const channel of Object.values(account.config.channels ?? {})) for (const user of channel.users ?? []) {
		const raw = String(user).trim();
		if (raw) ids.add(raw);
	}
	return Array.from(ids).map((raw) => raw.trim()).filter(Boolean).map((raw) => {
		const normalizedUserId = (raw.match(/^<@([A-Z0-9]+)>$/i)?.[1] ?? raw).replace(/^(slack|user):/i, "").trim();
		if (!normalizedUserId) return null;
		const target = `user:${normalizedUserId}`;
		return normalizeSlackMessagingTarget(target) ?? target.toLowerCase();
	}).filter((id) => Boolean(id)).filter((id) => id.startsWith("user:")).filter((id) => q ? id.toLowerCase().includes(q) : true).slice(0, params.limit && params.limit > 0 ? params.limit : void 0).map((id) => ({
		kind: "user",
		id
	}));
}
async function listSlackDirectoryGroupsFromConfig(params) {
	const account = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const q = params.query?.trim().toLowerCase() || "";
	return Object.keys(account.config.channels ?? {}).map((raw) => raw.trim()).filter(Boolean).map((raw) => normalizeSlackMessagingTarget(raw) ?? raw.toLowerCase()).filter((id) => id.startsWith("channel:")).filter((id) => q ? id.toLowerCase().includes(q) : true).slice(0, params.limit && params.limit > 0 ? params.limit : void 0).map((id) => ({
		kind: "group",
		id
	}));
}
async function listDiscordDirectoryPeersFromConfig(params) {
	const account = resolveDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const q = params.query?.trim().toLowerCase() || "";
	const ids = /* @__PURE__ */ new Set();
	addAllowFromAndDmsIds(ids, account.config.allowFrom ?? account.config.dm?.allowFrom, account.config.dms);
	for (const guild of Object.values(account.config.guilds ?? {})) {
		for (const entry of guild.users ?? []) {
			const raw = String(entry).trim();
			if (raw) ids.add(raw);
		}
		for (const channel of Object.values(guild.channels ?? {})) for (const user of channel.users ?? []) {
			const raw = String(user).trim();
			if (raw) ids.add(raw);
		}
	}
	return Array.from(ids).map((raw) => raw.trim()).filter(Boolean).map((raw) => {
		const cleaned = (raw.match(/^<@!?(\d+)>$/)?.[1] ?? raw).replace(/^(discord|user):/i, "").trim();
		if (!/^\d+$/.test(cleaned)) return null;
		return `user:${cleaned}`;
	}).filter((id) => Boolean(id)).filter((id) => q ? id.toLowerCase().includes(q) : true).slice(0, params.limit && params.limit > 0 ? params.limit : void 0).map((id) => ({
		kind: "user",
		id
	}));
}
async function listDiscordDirectoryGroupsFromConfig(params) {
	const account = resolveDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const q = params.query?.trim().toLowerCase() || "";
	const ids = /* @__PURE__ */ new Set();
	for (const guild of Object.values(account.config.guilds ?? {})) for (const channelId of Object.keys(guild.channels ?? {})) {
		const trimmed = channelId.trim();
		if (trimmed) ids.add(trimmed);
	}
	return Array.from(ids).map((raw) => raw.trim()).filter(Boolean).map((raw) => {
		const cleaned = (raw.match(/^<#(\d+)>$/)?.[1] ?? raw).replace(/^(discord|channel|group):/i, "").trim();
		if (!/^\d+$/.test(cleaned)) return null;
		return `channel:${cleaned}`;
	}).filter((id) => Boolean(id)).filter((id) => q ? id.toLowerCase().includes(q) : true).slice(0, params.limit && params.limit > 0 ? params.limit : void 0).map((id) => ({
		kind: "group",
		id
	}));
}
async function listTelegramDirectoryPeersFromConfig(params) {
	const account = resolveTelegramAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const q = params.query?.trim().toLowerCase() || "";
	const raw = [...(account.config.allowFrom ?? []).map((entry) => String(entry)), ...Object.keys(account.config.dms ?? {})];
	return Array.from(new Set(raw.map((entry) => entry.trim()).filter(Boolean).map((entry) => entry.replace(/^(telegram|tg):/i, "")))).map((entry) => {
		const trimmed = entry.trim();
		if (!trimmed) return null;
		if (/^-?\d+$/.test(trimmed)) return trimmed;
		return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
	}).filter((id) => Boolean(id)).filter((id) => q ? id.toLowerCase().includes(q) : true).slice(0, params.limit && params.limit > 0 ? params.limit : void 0).map((id) => ({
		kind: "user",
		id
	}));
}
async function listTelegramDirectoryGroupsFromConfig(params) {
	const account = resolveTelegramAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const q = params.query?.trim().toLowerCase() || "";
	return Object.keys(account.config.groups ?? {}).map((id) => id.trim()).filter((id) => Boolean(id) && id !== "*").filter((id) => q ? id.toLowerCase().includes(q) : true).slice(0, params.limit && params.limit > 0 ? params.limit : void 0).map((id) => ({
		kind: "group",
		id
	}));
}
async function listWhatsAppDirectoryPeersFromConfig(params) {
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const q = params.query?.trim().toLowerCase() || "";
	return (account.allowFrom ?? []).map((entry) => String(entry).trim()).filter((entry) => Boolean(entry) && entry !== "*").map((entry) => normalizeWhatsAppTarget(entry) ?? "").filter(Boolean).filter((id) => !isWhatsAppGroupJid(id)).filter((id) => q ? id.toLowerCase().includes(q) : true).slice(0, params.limit && params.limit > 0 ? params.limit : void 0).map((id) => ({
		kind: "user",
		id
	}));
}
async function listWhatsAppDirectoryGroupsFromConfig(params) {
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const q = params.query?.trim().toLowerCase() || "";
	return Object.keys(account.groups ?? {}).map((id) => id.trim()).filter((id) => Boolean(id) && id !== "*").filter((id) => q ? id.toLowerCase().includes(q) : true).slice(0, params.limit && params.limit > 0 ? params.limit : void 0).map((id) => ({
		kind: "group",
		id
	}));
}

//#endregion
//#region src/channels/plugins/index.ts
function listPluginChannels() {
	return requireActivePluginRegistry().channels.map((entry) => entry.plugin);
}
function dedupeChannels(channels) {
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const plugin of channels) {
		const id = String(plugin.id).trim();
		if (!id || seen.has(id)) continue;
		seen.add(id);
		resolved.push(plugin);
	}
	return resolved;
}
function listChannelPlugins() {
	return dedupeChannels(listPluginChannels()).toSorted((a, b) => {
		const indexA = CHAT_CHANNEL_ORDER.indexOf(a.id);
		const indexB = CHAT_CHANNEL_ORDER.indexOf(b.id);
		const orderA = a.meta.order ?? (indexA === -1 ? 999 : indexA);
		const orderB = b.meta.order ?? (indexB === -1 ? 999 : indexB);
		if (orderA !== orderB) return orderA - orderB;
		return a.id.localeCompare(b.id);
	});
}
function getChannelPlugin(id) {
	const resolvedId = String(id).trim();
	if (!resolvedId) return;
	return listChannelPlugins().find((plugin) => plugin.id === resolvedId);
}
function normalizeChannelId(raw) {
	return normalizeAnyChannelId(raw);
}

//#endregion
export { ensureTargetId as _, listDiscordDirectoryPeersFromConfig as a, requireTargetKind as b, listTelegramDirectoryGroupsFromConfig as c, listWhatsAppDirectoryPeersFromConfig as d, looksLikeSlackTargetId as f, buildMessagingTarget as g, resolveSlackChannelId as h, listDiscordDirectoryGroupsFromConfig as i, listTelegramDirectoryPeersFromConfig as l, parseSlackTarget as m, listChannelPlugins as n, listSlackDirectoryGroupsFromConfig as o, normalizeSlackMessagingTarget as p, normalizeChannelId as r, listSlackDirectoryPeersFromConfig as s, getChannelPlugin as t, listWhatsAppDirectoryGroupsFromConfig as u, parseTargetMention as v, parseTargetPrefixes as y };