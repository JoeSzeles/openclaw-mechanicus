import "./paths-B4BZAPZh.js";
import { F as shouldLogVerbose, M as logVerbose } from "./utils-CFnnyoTP.js";
import "./thinking-EAliFiVK.js";
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
import { a as runCapability, n as createMediaAttachmentCache, o as isAudioAttachment, r as normalizeMediaAttachments, t as buildProviderRegistry } from "./runner-DchbsNd6.js";
import "./image-Bqk8GHw8.js";
import "./models-config-BPPFB5li.js";
import "./pi-model-discovery-DX1x3UsN.js";
import "./pi-embedded-helpers-ClaUaHjK.js";
import "./sandbox-DslYImdg.js";
import "./chrome-DuvmuAVy.js";
import "./tailscale-B2RP0O39.js";
import "./auth-Kz-t4hed.js";
import "./server-context-AyirCMgd.js";
import "./frontmatter-DrdSsH4-.js";
import "./skills-CL_0AHFf.js";
import "./routes-BKooeuMt.js";
import "./redact-CjJyQlVU.js";
import "./errors-CdJjJ1Jq.js";
import "./paths-CWc9mjAN.js";
import "./ssrf-Bhv0qRd-.js";
import "./image-ops-ib1_UDIa.js";
import "./store-CHQKN-y-.js";
import "./ports-Dru7vIR6.js";
import "./trash-DhlImRqi.js";
import "./message-channel-B11syIWY.js";
import "./sessions-B7E6-emA.js";
import "./dock-Bdl338Dx.js";
import "./accounts-BWv_S14y.js";
import "./normalize-C23emibo.js";
import "./accounts-FP3Dx3m5.js";
import "./accounts-CgV6POP2.js";
import "./bindings-CssSUqXx.js";
import "./logging-D3KTM1pH.js";
import "./plugins-MECKrdj4.js";
import "./paths-gjLMn4eA.js";
import "./tool-images-DFl3AXDm.js";
import "./tool-display-BRqP7S2f.js";
import "./fetch-guard-fVA6JVFp.js";
import "./fetch-DlQT4W4E.js";
import "./model-catalog-BTBFlq8q.js";

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