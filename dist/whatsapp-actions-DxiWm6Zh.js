import "./paths-B4BZAPZh.js";
import "./utils-CFnnyoTP.js";
import "./registry-D74-I5q-.js";
import "./subsystem-oVAQxyhr.js";
import "./exec-i2CMvUxK.js";
import "./agent-scope-CrP-i2MF.js";
import "./model-selection-CqXyRThV.js";
import "./github-copilot-token-D2zp6kMZ.js";
import "./boolean-BsqeuxE6.js";
import "./env-BV0iTNjd.js";
import "./config-i7AorPvh.js";
import "./manifest-registry-DoaWeDHN.js";
import "./ssrf-Bhv0qRd-.js";
import "./image-ops-ib1_UDIa.js";
import "./message-channel-B11syIWY.js";
import "./accounts-BWv_S14y.js";
import "./normalize-C23emibo.js";
import "./bindings-CssSUqXx.js";
import "./logging-D3KTM1pH.js";
import "./plugins-MECKrdj4.js";
import "./tool-images-DFl3AXDm.js";
import "./fetch-guard-fVA6JVFp.js";
import "./fetch-DlQT4W4E.js";
import { a as jsonResult, n as createActionGate, s as readReactionParams, u as readStringParam } from "./common-C5isiZ_Z.js";
import "./chunk-DcqcJHjP.js";
import "./markdown-tables-CQQzFscn.js";
import "./ir-CPmg2HMv.js";
import "./render-CXDO_kgw.js";
import "./tables-BJY31-CG.js";
import { r as sendReactionWhatsApp } from "./outbound-BGINxz8V.js";

//#region src/agents/tools/whatsapp-actions.ts
async function handleWhatsAppAction(params, cfg) {
	const action = readStringParam(params, "action", { required: true });
	const isActionEnabled = createActionGate(cfg.channels?.whatsapp?.actions);
	if (action === "react") {
		if (!isActionEnabled("reactions")) throw new Error("WhatsApp reactions are disabled.");
		const chatJid = readStringParam(params, "chatJid", { required: true });
		const messageId = readStringParam(params, "messageId", { required: true });
		const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a WhatsApp reaction." });
		const participant = readStringParam(params, "participant");
		const accountId = readStringParam(params, "accountId");
		const fromMeRaw = params.fromMe;
		await sendReactionWhatsApp(chatJid, messageId, remove ? "" : emoji, {
			verbose: false,
			fromMe: typeof fromMeRaw === "boolean" ? fromMeRaw : void 0,
			participant: participant ?? void 0,
			accountId: accountId ?? void 0
		});
		if (!remove && !isEmpty) return jsonResult({
			ok: true,
			added: emoji
		});
		return jsonResult({
			ok: true,
			removed: true
		});
	}
	throw new Error(`Unsupported WhatsApp action: ${action}`);
}

//#endregion
export { handleWhatsAppAction };