import "./paths-CyR9Pa1R.js";
import { X as shouldLogVerbose, q as logVerbose } from "./registry-B3v_dMjW.js";
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
import "./accounts-BFVCDHLN.js";
import "./image-ops-CqQZXJ9D.js";
import "./model-auth-CxlTW8uU.js";
import "./github-copilot-token-D5ISrFy7.js";
import "./pi-model-discovery-CKatqe2T.js";
import "./message-channel-BSPy_J6t.js";
import "./pi-embedded-helpers-DkPUQuW2.js";
import "./config-CZmBKuLv.js";
import "./manifest-registry-BGtqiFuf.js";
import "./chrome-BhzZmGA3.js";
import "./frontmatter-BPvsEU3m.js";
import "./skills-CSRzV6uM.js";
import "./redact-9hYpOXID.js";
import "./errors-pj0CRkCB.js";
import "./store-nrEpGThw.js";
import "./thinking-jgR7yC2c.js";
import "./accounts-CrNX3S4t.js";
import "./paths-gnW-md4M.js";
import "./tool-images-ClEFO-t-.js";
import "./image-Dxec4m3g.js";
import "./fetch-CL56T8xy.js";
import { a as runCapability, l as isAudioAttachment, n as createMediaAttachmentCache, r as normalizeMediaAttachments, t as buildProviderRegistry } from "./runner-BrFhLhf5.js";

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