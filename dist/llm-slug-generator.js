import "./paths-CyR9Pa1R.js";
import "./registry-B3v_dMjW.js";
import { c as resolveDefaultAgentId, r as resolveAgentDir, s as resolveAgentWorkspaceDir } from "./agent-scope-DanU6CT8.js";
import "./subsystem-12Cr1qkN.js";
import "./exec-BcuB7agq.js";
import "./workspace-BBSUSFTB.js";
import "./tokens-BIWsvHaB.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-D4lfL_eV.js";
import "./accounts-DmbLHz3-.js";
import "./normalize-Cve15Q9q.js";
import "./boolean-CE7i9tBR.js";
import "./env-CHgPw2cH.js";
import "./bindings-Dxat9suu.js";
import "./send-BRSQ9eYh.js";
import "./plugins-Dy_YZOpV.js";
import "./send-BJ5Eq8nL.js";
import "./deliver-CheLNh5z.js";
import "./diagnostic-CJC2Qdcb.js";
import "./diagnostic-session-state-C1vRJs5w.js";
import "./accounts-BFVCDHLN.js";
import "./send-y2b-Rjli.js";
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
import "./reply-prefix-CBsUYPbZ.js";
import "./manager-D93sxzRU.js";
import "./sqlite-wwudzAAI.js";
import "./retry-DVtnPnF6.js";
import "./common-q9iYbcty.js";
import "./chunk-CTULoyP3.js";
import "./markdown-tables-C6ikgcr9.js";
import "./fetch-CL56T8xy.js";
import "./ir-CZf3ql48.js";
import "./render-DwEu-aCr.js";
import "./commands-registry-DZPpkBY3.js";
import "./runner-BrFhLhf5.js";
import "./skill-commands-dSfDO9Xr.js";
import "./fetch-BBkSX75a.js";
import "./send-BX84vHMI.js";
import "./outbound-attachment-DqLthHxA.js";
import "./send-C7RmpRLY.js";
import "./resolve-route-7_Yxg3Cy.js";
import "./channel-activity-BXFDwXVQ.js";
import "./tables-Cue7DGru.js";
import "./proxy-DVy9foH0.js";
import "./replies-WyKvESS_.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/llm-slug-generator.ts
/**
* LLM-based slug generator for session memory filenames
*/
/**
* Generate a short 1-2 word filename slug from session content using LLM
*/
async function generateSlugViaLLM(params) {
	let tempSessionFile = null;
	try {
		const agentId = resolveDefaultAgentId(params.cfg);
		const workspaceDir = resolveAgentWorkspaceDir(params.cfg, agentId);
		const agentDir = resolveAgentDir(params.cfg, agentId);
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-slug-"));
		tempSessionFile = path.join(tempDir, "session.jsonl");
		const prompt = `Based on this conversation, generate a short 1-2 word filename slug (lowercase, hyphen-separated, no file extension).

Conversation summary:
${params.sessionContent.slice(0, 2e3)}

Reply with ONLY the slug, nothing else. Examples: "vendor-pitch", "api-design", "bug-fix"`;
		const result = await runEmbeddedPiAgent({
			sessionId: `slug-generator-${Date.now()}`,
			sessionKey: "temp:slug-generator",
			agentId,
			sessionFile: tempSessionFile,
			workspaceDir,
			agentDir,
			config: params.cfg,
			prompt,
			timeoutMs: 15e3,
			runId: `slug-gen-${Date.now()}`
		});
		if (result.payloads && result.payloads.length > 0) {
			const text = result.payloads[0]?.text;
			if (text) return text.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || null;
		}
		return null;
	} catch (err) {
		console.error("[llm-slug-generator] Failed to generate slug:", err);
		return null;
	} finally {
		if (tempSessionFile) try {
			await fs.rm(path.dirname(tempSessionFile), {
				recursive: true,
				force: true
			});
		} catch {}
	}
}

//#endregion
export { generateSlugViaLLM };