import "./paths-CyR9Pa1R.js";
import "./registry-B3v_dMjW.js";
import "./agent-scope-DanU6CT8.js";
import "./subsystem-12Cr1qkN.js";
import "./exec-BcuB7agq.js";
import "./workspace-BBSUSFTB.js";
import "./accounts-DmbLHz3-.js";
import "./normalize-Cve15Q9q.js";
import "./boolean-CE7i9tBR.js";
import "./env-CHgPw2cH.js";
import "./bindings-Dxat9suu.js";
import "./plugins-Dy_YZOpV.js";
import "./image-ops-CqQZXJ9D.js";
import "./model-auth-CxlTW8uU.js";
import "./github-copilot-token-D5ISrFy7.js";
import "./message-channel-BSPy_J6t.js";
import "./config-CZmBKuLv.js";
import "./manifest-registry-BGtqiFuf.js";
import "./tool-images-ClEFO-t-.js";
import { i as jsonResult, l as readStringParam, o as readReactionParams, t as createActionGate } from "./common-q9iYbcty.js";
import "./chunk-CTULoyP3.js";
import "./markdown-tables-C6ikgcr9.js";
import "./fetch-CL56T8xy.js";
import "./ir-CZf3ql48.js";
import "./render-DwEu-aCr.js";
import "./tables-Cue7DGru.js";
import { r as sendReactionWhatsApp } from "./outbound-IcvLfs04.js";

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