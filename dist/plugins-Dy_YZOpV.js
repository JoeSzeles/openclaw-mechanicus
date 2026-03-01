import { a as normalizeAnyChannelId, l as requireActivePluginRegistry, n as CHAT_CHANNEL_ORDER } from "./registry-B3v_dMjW.js";

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
export { listChannelPlugins as n, normalizeChannelId as r, getChannelPlugin as t };