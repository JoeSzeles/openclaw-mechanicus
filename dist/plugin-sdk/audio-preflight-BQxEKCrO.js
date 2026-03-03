import "./accounts-WG-Hmhh4.js";
import { G as shouldLogVerbose, H as logVerbose } from "./registry-DFcSCP5o.js";
import "./paths-DJmOcr7Q.js";
import "./model-selection-CcII_ph5.js";
import "./config-BUR5GFvw.js";
import "./ssrf-CIYAMVQH.js";
import "./subsystem-CNxEMAhB.js";
import "./exec-CikK1sTs.js";
import "./tool-images-DZscW5Qf.js";
import "./agent-scope-DGo2Lh53.js";
import "./skills-DNzuu_Hz.js";
import "./redact-BUgsXMP1.js";
import "./errors-7SO55DQM.js";
import "./fetch-CRvmXstS.js";
import "./chrome-WS-Z8NHV.js";
import "./env-CjjrqHd2.js";
import "./thinking-CL3Zx3n9.js";
import "./normalize-nbycZ809.js";
import "./bindings-BkL2h399.js";
import "./plugins-BNWuvEuT.js";
import "./message-channel-CaoRC6Bw.js";
import "./pi-embedded-helpers-BBn71qTx.js";
import "./github-copilot-token-Dtvm_sTU.js";
import "./manifest-registry-B8hfUlu9.js";
import "./paths-CyXoO9iV.js";
import { a as runCapability, l as isAudioAttachment, n as createMediaAttachmentCache, r as normalizeMediaAttachments, t as buildProviderRegistry } from "./runner-AYensfnh.js";
import "./image-JmJ4zLpW.js";
import "./pi-model-discovery-BEgrTVvT.js";

//#region src/media-understanding/audio-preflight.ts
/**
* Transcribes the first audio attachment BEFORE mention checking.
* This allows voice notes to be processed in group chats with requireMention: true.
* Returns the transcript or undefined if transcription fails or no audio is found.
*/
async function transcribeFirstAudio(params) {
	const { ctx, cfg } = params;
	const audioConfig = cfg.tools?.media?.audio;
	if (!audioConfig || audioConfig.enabled === false) return;
	const attachments = normalizeMediaAttachments(ctx);
	if (!attachments || attachments.length === 0) return;
	const firstAudio = attachments.find((att) => att && isAudioAttachment(att) && !att.alreadyTranscribed);
	if (!firstAudio) return;
	if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribing attachment ${firstAudio.index} for mention check`);
	const providerRegistry = buildProviderRegistry(params.providers);
	const cache = createMediaAttachmentCache(attachments);
	try {
		const result = await runCapability({
			capability: "audio",
			cfg,
			ctx,
			attachments: cache,
			media: attachments,
			agentDir: params.agentDir,
			providerRegistry,
			config: audioConfig,
			activeModel: params.activeModel
		});
		if (!result || result.outputs.length === 0) return;
		const audioOutput = result.outputs.find((output) => output.kind === "audio.transcription");
		if (!audioOutput || !audioOutput.text) return;
		firstAudio.alreadyTranscribed = true;
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribed ${audioOutput.text.length} chars from attachment ${firstAudio.index}`);
		return audioOutput.text;
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcription failed: ${String(err)}`);
		return;
	} finally {
		await cache.cleanup();
	}
}

//#endregion
export { transcribeFirstAudio };