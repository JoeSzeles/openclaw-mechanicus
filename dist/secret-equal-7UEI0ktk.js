import { timingSafeEqual } from "node:crypto";

//#region src/security/secret-equal.ts
function safeEqualSecret(provided, expected) {
	if (typeof provided !== "string" || typeof expected !== "string") return false;
	const providedBuffer = Buffer.from(provided);
	const expectedBuffer = Buffer.from(expected);
	if (providedBuffer.length !== expectedBuffer.length) return false;
	return timingSafeEqual(providedBuffer, expectedBuffer);
}

//#endregion
export { safeEqualSecret as t };