import "./paths-Bp5uKvNR.js";
import { G as logVerbose, J as shouldLogVerbose } from "./registry-DykAc8X1.js";
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
import "./thinking-C6NjWV99.js";
import "./image-ops-BoI24SLx.js";
import "./pi-model-discovery-CH4vndgB.js";
import "./message-channel-BCOlFUGm.js";
import "./pi-embedded-helpers-CffwF19P.js";
import "./config-BVMQeibP.js";
import "./manifest-registry-B7RoObex.js";
import "./chrome-efU-I88_.js";
import "./skills-DfNjMhAi.js";
import "./redact-BtPEA5cl.js";
import "./errors-C7sgRdrp.js";
import "./paths-BHRTOOlS.js";
import "./tool-images-NOQs9yEy.js";
import "./image-CTGIP6ID.js";
import "./fetch-Cz5ElEP5.js";
import { a as runCapability, l as isAudioAttachment, n as createMediaAttachmentCache, r as normalizeMediaAttachments, t as buildProviderRegistry } from "./runner-CxCuNa2s.js";

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