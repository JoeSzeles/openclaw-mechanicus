import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-B11syIWY.js";
import { i as randomIdempotencyKey, n as callGateway } from "./call-BC26-1k1.js";
import { n as withProgress } from "./progress-By07Lltm.js";
import { t as resolveNodeIdFromCandidates } from "./node-match-BCLs6OmB.js";

//#region src/cli/nodes-cli/format.ts
function parsePairingList(value) {
	const obj = typeof value === "object" && value !== null ? value : {};
	return {
		pending: Array.isArray(obj.pending) ? obj.pending : [],
		paired: Array.isArray(obj.paired) ? obj.paired : []
	};
}
function parseNodeList(value) {
	const obj = typeof value === "object" && value !== null ? value : {};
	return Array.isArray(obj.nodes) ? obj.nodes : [];
}
function formatPermissions(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const entries = Object.entries(raw).map(([key, value]) => [String(key).trim(), value === true]).filter(([key]) => key.length > 0).toSorted((a, b) => a[0].localeCompare(b[0]));
	if (entries.length === 0) return null;
	return `[${entries.map(([key, granted]) => `${key}=${granted ? "yes" : "no"}`).join(", ")}]`;
}

//#endregion
//#region src/cli/nodes-cli/rpc.ts
const nodesCallOpts = (cmd, defaults) => cmd.option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--timeout <ms>", "Timeout in ms", String(defaults?.timeoutMs ?? 1e4)).option("--json", "Output JSON", false);
const callGatewayCli = async (method, opts, params, callOpts) => withProgress({
	label: `Nodes ${method}`,
	indeterminate: true,
	enabled: opts.json !== true
}, async () => await callGateway({
	url: opts.url,
	token: opts.token,
	method,
	params,
	timeoutMs: callOpts?.transportTimeoutMs ?? Number(opts.timeout ?? 1e4),
	clientName: GATEWAY_CLIENT_NAMES.CLI,
	mode: GATEWAY_CLIENT_MODES.CLI
}));
function buildNodeInvokeParams(params) {
	const invokeParams = {
		nodeId: params.nodeId,
		command: params.command,
		params: params.params,
		idempotencyKey: params.idempotencyKey ?? randomIdempotencyKey()
	};
	if (typeof params.timeoutMs === "number" && Number.isFinite(params.timeoutMs)) invokeParams.timeoutMs = params.timeoutMs;
	return invokeParams;
}
function unauthorizedHintForMessage(message) {
	const haystack = message.toLowerCase();
	if (haystack.includes("unauthorizedclient") || haystack.includes("bridge client is not authorized") || haystack.includes("unsigned bridge clients are not allowed")) return [
		"peekaboo bridge rejected the client.",
		"sign the peekaboo CLI (TeamID Y5PE65HELJ) or launch the host with",
		"PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1 for local dev."
	].join(" ");
	return null;
}
async function resolveNodeId(opts, query) {
	const q = String(query ?? "").trim();
	if (!q) throw new Error("node required");
	let nodes = [];
	try {
		nodes = parseNodeList(await callGatewayCli("node.list", opts, {}));
	} catch {
		const { paired } = parsePairingList(await callGatewayCli("node.pair.list", opts, {}));
		nodes = paired.map((n) => ({
			nodeId: n.nodeId,
			displayName: n.displayName,
			platform: n.platform,
			version: n.version,
			remoteIp: n.remoteIp
		}));
	}
	return resolveNodeIdFromCandidates(nodes, q);
}

//#endregion
export { unauthorizedHintForMessage as a, parsePairingList as c, resolveNodeId as i, callGatewayCli as n, formatPermissions as o, nodesCallOpts as r, parseNodeList as s, buildNodeInvokeParams as t };