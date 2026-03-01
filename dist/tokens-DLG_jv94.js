import { w as escapeRegExp } from "./registry-DykAc8X1.js";

//#region src/auto-reply/tokens.ts
const HEARTBEAT_TOKEN = "HEARTBEAT_OK";
const SILENT_REPLY_TOKEN = "NO_REPLY";
function isSilentReplyText(text, token = SILENT_REPLY_TOKEN) {
	if (!text) return false;
	const escaped = escapeRegExp(token);
	if (new RegExp(`^\\s*${escaped}(?=$|\\W)`).test(text)) return true;
	return new RegExp(`\\b${escaped}\\b\\W*$`).test(text);
}

//#endregion
export { SILENT_REPLY_TOKEN as n, isSilentReplyText as r, HEARTBEAT_TOKEN as t };