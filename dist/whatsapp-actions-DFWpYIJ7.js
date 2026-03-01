import "./paths-Bp5uKvNR.js";
import "./registry-DykAc8X1.js";
import "./agent-scope-BXfmtC-7.js";
import "./subsystem-BxhC68lz.js";
import "./exec-C2VmzI_A.js";
import "./model-selection-CAfIlaZ9.js";
import "./github-copilot-token-DKylFy4W.js";
import "./env-DUOlMsCb.js";
import "./accounts-CnqwYdBL.js";
import "./normalize-BSXyKBmg.js";
import "./bindings-geRcx8Yj.js";
import "./plugins-BoBVB9U9.js";
import "./image-ops-BoI24SLx.js";
import "./message-channel-BCOlFUGm.js";
import "./config-BVMQeibP.js";
import "./manifest-registry-B7RoObex.js";
import "./tool-images-NOQs9yEy.js";
import { i as jsonResult, l as readStringParam, o as readReactionParams, t as createActionGate } from "./common-Dj58eHOz.js";
import "./chunk-DECjl9qk.js";
import "./markdown-tables-BjlHOiXr.js";
import "./fetch-Cz5ElEP5.js";
import "./ir-CKNogzHu.js";
import "./render-4xrev36Z.js";
import "./active-listener-BjCMxBT_.js";
import { r as sendReactionWhatsApp } from "./outbound-D8CZ5GQw.js";

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