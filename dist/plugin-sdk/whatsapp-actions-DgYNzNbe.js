import "./accounts-BSywe9Bq.js";
import "./registry-CvUzfgyU.js";
import "./paths-DJmOcr7Q.js";
import "./model-selection-CB9IIVWU.js";
import "./config-YVBCrP94.js";
import "./ssrf--zCZt1NJ.js";
import "./subsystem-CPwOCKbN.js";
import "./exec-CBwIXprv.js";
import "./tool-images-B8CfQtJH.js";
import { i as jsonResult, l as readStringParam, o as readReactionParams, t as createActionGate } from "./common-CH6orOBi.js";
import "./agent-scope-BmRbl8vE.js";
import "./fetch-CO6Olj9O.js";
import "./env-DNXtq8Zy.js";
import "./normalize-mEjrgr3H.js";
import "./bindings-BGhRgiFJ.js";
import "./plugins-BBPPyP5O.js";
import "./message-channel-CzbBSsGC.js";
import "./github-copilot-token-Dtvm_sTU.js";
import "./manifest-registry-C0jS6PBU.js";
import "./active-listener-BiMSzcgN.js";
import "./ir-WzWc9-m7.js";
import "./chunk-COfiKqBF.js";
import "./markdown-tables-MH5WoQHz.js";
import "./render-95l30zcf.js";
import { r as sendReactionWhatsApp } from "./outbound-ClQW7VvZ.js";

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