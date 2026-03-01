import { o as normalizeChatChannelId, s as getActivePluginRegistry, t as CHANNEL_IDS } from "./registry-DykAc8X1.js";

//#region src/gateway/protocol/client-info.ts
const GATEWAY_CLIENT_IDS = {
	WEBCHAT_UI: "webchat-ui",
	CONTROL_UI: "openclaw-control-ui",
	WEBCHAT: "webchat",
	CLI: "cli",
	GATEWAY_CLIENT: "gateway-client",
	MACOS_APP: "openclaw-macos",
	IOS_APP: "openclaw-ios",
	ANDROID_APP: "openclaw-android",
	NODE_HOST: "node-host",
	TEST: "test",
	FINGERPRINT: "fingerprint",
	PROBE: "openclaw-probe"
};
const GATEWAY_CLIENT_NAMES = GATEWAY_CLIENT_IDS;
const GATEWAY_CLIENT_MODES = {
	WEBCHAT: "webchat",
	CLI: "cli",
	UI: "ui",
	BACKEND: "backend",
	NODE: "node",
	PROBE: "probe",
	TEST: "test"
};
const GATEWAY_CLIENT_ID_SET = new Set(Object.values(GATEWAY_CLIENT_IDS));
const GATEWAY_CLIENT_MODE_SET = new Set(Object.values(GATEWAY_CLIENT_MODES));

//#endregion
//#region src/utils/message-channel.ts
const INTERNAL_MESSAGE_CHANNEL = "webchat";
const MARKDOWN_CAPABLE_CHANNELS = new Set([
	"slack",
	"telegram",
	"signal",
	"discord",
	"googlechat",
	"tui",
	INTERNAL_MESSAGE_CHANNEL
]);
function isInternalMessageChannel(raw) {
	return normalizeMessageChannel(raw) === INTERNAL_MESSAGE_CHANNEL;
}
function normalizeMessageChannel(raw) {
	const normalized = raw?.trim().toLowerCase();
	if (!normalized) return;
	if (normalized === INTERNAL_MESSAGE_CHANNEL) return INTERNAL_MESSAGE_CHANNEL;
	const builtIn = normalizeChatChannelId(normalized);
	if (builtIn) return builtIn;
	return (getActivePluginRegistry()?.channels.find((entry) => {
		if (entry.plugin.id.toLowerCase() === normalized) return true;
		return (entry.plugin.meta.aliases ?? []).some((alias) => alias.trim().toLowerCase() === normalized);
	}))?.plugin.id ?? normalized;
}
const listPluginChannelIds = () => {
	const registry = getActivePluginRegistry();
	if (!registry) return [];
	return registry.channels.map((entry) => entry.plugin.id);
};
const listDeliverableMessageChannels = () => Array.from(new Set([...CHANNEL_IDS, ...listPluginChannelIds()]));
const listGatewayMessageChannels = () => [...listDeliverableMessageChannels(), INTERNAL_MESSAGE_CHANNEL];
function isGatewayMessageChannel(value) {
	return listGatewayMessageChannels().includes(value);
}
function isDeliverableMessageChannel(value) {
	return listDeliverableMessageChannels().includes(value);
}
function resolveGatewayMessageChannel(raw) {
	const normalized = normalizeMessageChannel(raw);
	if (!normalized) return;
	return isGatewayMessageChannel(normalized) ? normalized : void 0;
}
function resolveMessageChannel(primary, fallback) {
	return normalizeMessageChannel(primary) ?? normalizeMessageChannel(fallback);
}
function isMarkdownCapableMessageChannel(raw) {
	const channel = normalizeMessageChannel(raw);
	if (!channel) return false;
	return MARKDOWN_CAPABLE_CHANNELS.has(channel);
}

//#endregion
export { listDeliverableMessageChannels as a, resolveMessageChannel as c, GATEWAY_CLIENT_NAMES as d, isMarkdownCapableMessageChannel as i, GATEWAY_CLIENT_IDS as l, isDeliverableMessageChannel as n, normalizeMessageChannel as o, isInternalMessageChannel as r, resolveGatewayMessageChannel as s, INTERNAL_MESSAGE_CHANNEL as t, GATEWAY_CLIENT_MODES as u };