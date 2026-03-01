import { n as pickPrimaryTailnetIPv4 } from "./tailnet-Cbhv6uXB.js";
import os from "node:os";
import net from "node:net";
import { Buffer } from "node:buffer";

//#region src/gateway/net.ts
/**
* Pick the primary non-internal IPv4 address (LAN IP).
* Prefers common interface names (en0, eth0) then falls back to any external IPv4.
*/
function pickPrimaryLanIPv4() {
	const nets = os.networkInterfaces();
	for (const name of ["en0", "eth0"]) {
		const entry = nets[name]?.find((n) => n.family === "IPv4" && !n.internal);
		if (entry?.address) return entry.address;
	}
	for (const list of Object.values(nets)) {
		const entry = list?.find((n) => n.family === "IPv4" && !n.internal);
		if (entry?.address) return entry.address;
	}
}
function normalizeHostHeader(hostHeader) {
	return (hostHeader ?? "").trim().toLowerCase();
}
function resolveHostName(hostHeader) {
	const host = normalizeHostHeader(hostHeader);
	if (!host) return "";
	if (host.startsWith("[")) {
		const end = host.indexOf("]");
		if (end !== -1) return host.slice(1, end);
	}
	if (net.isIP(host) === 6) return host;
	const [name] = host.split(":");
	return name ?? "";
}
function isLoopbackAddress(ip) {
	if (!ip) return false;
	if (ip === "127.0.0.1") return true;
	if (ip.startsWith("127.")) return true;
	if (ip === "::1") return true;
	if (ip.startsWith("::ffff:127.")) return true;
	return false;
}
/**
* Returns true if the IP belongs to a private or loopback network range.
* Private ranges: RFC1918, link-local, ULA IPv6, and CGNAT (100.64/10), plus loopback.
*/
function isPrivateOrLoopbackAddress(ip) {
	if (!ip) return false;
	if (isLoopbackAddress(ip)) return true;
	const normalized = normalizeIPv4MappedAddress(ip.trim().toLowerCase());
	const family = net.isIP(normalized);
	if (!family) return false;
	if (family === 4) {
		const octets = normalized.split(".").map((value) => Number.parseInt(value, 10));
		if (octets.length !== 4 || octets.some((value) => Number.isNaN(value))) return false;
		const [o1, o2] = octets;
		if (o1 === 10 || o1 === 172 && o2 >= 16 && o2 <= 31 || o1 === 192 && o2 === 168) return true;
		if (o1 === 169 && o2 === 254 || o1 === 100 && o2 >= 64 && o2 <= 127) return true;
		return false;
	}
	if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
	if (/^fe[89ab]/.test(normalized)) return true;
	return false;
}
function normalizeIPv4MappedAddress(ip) {
	if (ip.startsWith("::ffff:")) return ip.slice(7);
	return ip;
}
function normalizeIp(ip) {
	const trimmed = ip?.trim();
	if (!trimmed) return;
	return normalizeIPv4MappedAddress(trimmed.toLowerCase());
}
function stripOptionalPort(ip) {
	if (ip.startsWith("[")) {
		const end = ip.indexOf("]");
		if (end !== -1) return ip.slice(1, end);
	}
	if (net.isIP(ip)) return ip;
	const lastColon = ip.lastIndexOf(":");
	if (lastColon > -1 && ip.includes(".") && ip.indexOf(":") === lastColon) {
		const candidate = ip.slice(0, lastColon);
		if (net.isIP(candidate) === 4) return candidate;
	}
	return ip;
}
function parseForwardedForClientIp(forwardedFor) {
	const raw = forwardedFor?.split(",")[0]?.trim();
	if (!raw) return;
	return normalizeIp(stripOptionalPort(raw));
}
function parseRealIp(realIp) {
	const raw = realIp?.trim();
	if (!raw) return;
	return normalizeIp(stripOptionalPort(raw));
}
/**
* Check if an IP address matches a CIDR block.
* Supports IPv4 CIDR notation (e.g., "10.42.0.0/24").
*
* @param ip - The IP address to check (e.g., "10.42.0.59")
* @param cidr - The CIDR block (e.g., "10.42.0.0/24")
* @returns True if the IP is within the CIDR block
*/
function ipMatchesCIDR(ip, cidr) {
	if (!cidr.includes("/")) return ip === cidr;
	const [subnet, prefixLenStr] = cidr.split("/");
	const prefixLen = parseInt(prefixLenStr, 10);
	if (Number.isNaN(prefixLen) || prefixLen < 0 || prefixLen > 32) return false;
	const ipParts = ip.split(".").map((p) => parseInt(p, 10));
	const subnetParts = subnet.split(".").map((p) => parseInt(p, 10));
	if (ipParts.length !== 4 || subnetParts.length !== 4 || ipParts.some((p) => Number.isNaN(p) || p < 0 || p > 255) || subnetParts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return false;
	const ipInt = ipParts[0] << 24 | ipParts[1] << 16 | ipParts[2] << 8 | ipParts[3];
	const subnetInt = subnetParts[0] << 24 | subnetParts[1] << 16 | subnetParts[2] << 8 | subnetParts[3];
	const mask = prefixLen === 0 ? 0 : -1 >>> 32 - prefixLen << 32 - prefixLen;
	return (ipInt & mask) === (subnetInt & mask);
}
function isTrustedProxyAddress(ip, trustedProxies) {
	const normalized = normalizeIp(ip);
	if (!normalized || !trustedProxies || trustedProxies.length === 0) return false;
	return trustedProxies.some((proxy) => {
		const candidate = proxy.trim();
		if (!candidate) return false;
		if (candidate.includes("/")) return ipMatchesCIDR(normalized, candidate);
		return normalizeIp(candidate) === normalized;
	});
}
function resolveGatewayClientIp(params) {
	const remote = normalizeIp(params.remoteAddr);
	if (!remote) return;
	if (!isTrustedProxyAddress(remote, params.trustedProxies)) return remote;
	return parseForwardedForClientIp(params.forwardedFor) ?? parseRealIp(params.realIp) ?? remote;
}
/**
* Resolves gateway bind host with fallback strategy.
*
* Modes:
* - loopback: 127.0.0.1 (rarely fails, but handled gracefully)
* - lan: always 0.0.0.0 (no fallback)
* - tailnet: Tailnet IPv4 if available, else loopback
* - auto: Loopback if available, else 0.0.0.0
* - custom: User-specified IP, fallback to 0.0.0.0 if unavailable
*
* @returns The bind address to use (never null)
*/
async function resolveGatewayBindHost(bind, customHost) {
	const mode = bind ?? "loopback";
	if (mode === "loopback") {
		if (await canBindToHost("127.0.0.1")) return "127.0.0.1";
		return "0.0.0.0";
	}
	if (mode === "tailnet") {
		const tailnetIP = pickPrimaryTailnetIPv4();
		if (tailnetIP && await canBindToHost(tailnetIP)) return tailnetIP;
		if (await canBindToHost("127.0.0.1")) return "127.0.0.1";
		return "0.0.0.0";
	}
	if (mode === "lan") return "0.0.0.0";
	if (mode === "custom") {
		const host = customHost?.trim();
		if (!host) return "0.0.0.0";
		if (isValidIPv4(host) && await canBindToHost(host)) return host;
		return "0.0.0.0";
	}
	if (mode === "auto") {
		if (await canBindToHost("127.0.0.1")) return "127.0.0.1";
		return "0.0.0.0";
	}
	return "0.0.0.0";
}
/**
* Test if we can bind to a specific host address.
* Creates a temporary server, attempts to bind, then closes it.
*
* @param host - The host address to test
* @returns True if we can successfully bind to this address
*/
async function canBindToHost(host) {
	return new Promise((resolve) => {
		const testServer = net.createServer();
		testServer.once("error", () => {
			resolve(false);
		});
		testServer.once("listening", () => {
			testServer.close();
			resolve(true);
		});
		testServer.listen(0, host);
	});
}
async function resolveGatewayListenHosts(bindHost, opts) {
	if (bindHost !== "127.0.0.1") return [bindHost];
	if (await (opts?.canBindToHost ?? canBindToHost)("::1")) return [bindHost, "::1"];
	return [bindHost];
}
/**
* Validate if a string is a valid IPv4 address.
*
* @param host - The string to validate
* @returns True if valid IPv4 format
*/
function isValidIPv4(host) {
	const parts = host.split(".");
	if (parts.length !== 4) return false;
	return parts.every((part) => {
		const n = parseInt(part, 10);
		return !Number.isNaN(n) && n >= 0 && n <= 255 && part === String(n);
	});
}
/**
* Check if a hostname or IP refers to the local machine.
* Handles: localhost, 127.x.x.x, ::1, [::1], ::ffff:127.x.x.x
* Note: 0.0.0.0 and :: are NOT loopback - they bind to all interfaces.
*/
function isLoopbackHost(host) {
	if (!host) return false;
	const h = host.trim().toLowerCase();
	if (h === "localhost") return true;
	return isLoopbackAddress(h.startsWith("[") && h.endsWith("]") ? h.slice(1, -1) : h);
}

//#endregion
//#region src/infra/ws.ts
function rawDataToString(data, encoding = "utf8") {
	if (typeof data === "string") return data;
	if (Buffer.isBuffer(data)) return data.toString(encoding);
	if (Array.isArray(data)) return Buffer.concat(data).toString(encoding);
	if (data instanceof ArrayBuffer) return Buffer.from(data).toString(encoding);
	return Buffer.from(String(data)).toString(encoding);
}

//#endregion
export { isTrustedProxyAddress as a, parseForwardedForClientIp as c, resolveGatewayClientIp as d, resolveGatewayListenHosts as f, isPrivateOrLoopbackAddress as i, pickPrimaryLanIPv4 as l, isLoopbackAddress as n, isValidIPv4 as o, resolveHostName as p, isLoopbackHost as r, normalizeHostHeader as s, rawDataToString as t, resolveGatewayBindHost as u };