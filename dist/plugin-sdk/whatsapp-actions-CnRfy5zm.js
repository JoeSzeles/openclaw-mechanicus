import "./accounts-WG-Hmhh4.js";
import "./registry-DFcSCP5o.js";
import "./paths-DJmOcr7Q.js";
import "./model-selection-CcII_ph5.js";
import "./config-BUR5GFvw.js";
import "./ssrf-CIYAMVQH.js";
import "./subsystem-CNxEMAhB.js";
import "./exec-CikK1sTs.js";
import "./tool-images-DZscW5Qf.js";
import { i as jsonResult, l as readStringParam, o as readReactionParams, t as createActionGate } from "./common-CXH6PFr2.js";
import "./agent-scope-DGo2Lh53.js";
import "./fetch-CRvmXstS.js";
import "./env-CjjrqHd2.js";
import "./normalize-nbycZ809.js";
import "./bindings-BkL2h399.js";
import "./plugins-BNWuvEuT.js";
import "./message-channel-CaoRC6Bw.js";
import "./github-copilot-token-Dtvm_sTU.js";
import "./manifest-registry-B8hfUlu9.js";
import "./active-listener-DqgfJFYZ.js";
import "./ir-D6km9t7C.js";
import "./chunk-Cfb0gRms.js";
import "./markdown-tables-Cyc-LieP.js";
import "./render-95l30zcf.js";
import { r as sendReactionWhatsApp } from "./outbound-B6uL5Vxh.js";

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