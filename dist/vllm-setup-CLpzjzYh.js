import { Et as upsertAuthProfileWithLock } from "./model-selection-CqXyRThV.js";

//#region src/commands/openai-codex-model-default.ts
const OPENAI_CODEX_DEFAULT_MODEL = "openai-codex/gpt-5.3-codex";
function shouldSetOpenAICodexModel(model) {
	const trimmed = model?.trim();
	if (!trimmed) return true;
	const normalized = trimmed.toLowerCase();
	if (normalized.startsWith("openai-codex/")) return false;
	if (normalized.startsWith("openai/")) return true;
	return normalized === "gpt" || normalized === "gpt-mini";
}
function resolvePrimaryModel(model) {
	if (typeof model === "string") return model;
	if (model && typeof model === "object" && typeof model.primary === "string") return model.primary;
}
function applyOpenAICodexModelDefault(cfg) {
	if (!shouldSetOpenAICodexModel(resolvePrimaryModel(cfg.agents?.defaults?.model))) return {
		next: cfg,
		changed: false
	};
	return {
		next: {
			...cfg,
			agents: {
				...cfg.agents,
				defaults: {
					...cfg.agents?.defaults,
					model: cfg.agents?.defaults?.model && typeof cfg.agents.defaults.model === "object" ? {
						...cfg.agents.defaults.model,
						primary: OPENAI_CODEX_DEFAULT_MODEL
					} : { primary: OPENAI_CODEX_DEFAULT_MODEL }
				}
			}
		},
		changed: true
	};
}

//#endregion
//#region src/commands/vllm-setup.ts
const VLLM_DEFAULT_BASE_URL = "http://127.0.0.1:8000/v1";
const VLLM_DEFAULT_CONTEXT_WINDOW = 128e3;
const VLLM_DEFAULT_MAX_TOKENS = 8192;
const VLLM_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
async function promptAndConfigureVllm(params) {
	const baseUrlRaw = await params.prompter.text({
		message: "vLLM base URL",
		initialValue: VLLM_DEFAULT_BASE_URL,
		placeholder: VLLM_DEFAULT_BASE_URL,
		validate: (value) => value?.trim() ? void 0 : "Required"
	});
	const apiKeyRaw = await params.prompter.text({
		message: "vLLM API key",
		placeholder: "sk-... (or any non-empty string)",
		validate: (value) => value?.trim() ? void 0 : "Required"
	});
	const modelIdRaw = await params.prompter.text({
		message: "vLLM model",
		placeholder: "meta-llama/Meta-Llama-3-8B-Instruct",
		validate: (value) => value?.trim() ? void 0 : "Required"
	});
	const baseUrl = String(baseUrlRaw ?? "").trim().replace(/\/+$/, "");
	const apiKey = String(apiKeyRaw ?? "").trim();
	const modelId = String(modelIdRaw ?? "").trim();
	const modelRef = `vllm/${modelId}`;
	await upsertAuthProfileWithLock({
		profileId: "vllm:default",
		credential: {
			type: "api_key",
			provider: "vllm",
			key: apiKey
		},
		agentDir: params.agentDir
	});
	return {
		config: {
			...params.cfg,
			models: {
				...params.cfg.models,
				mode: params.cfg.models?.mode ?? "merge",
				providers: {
					...params.cfg.models?.providers,
					vllm: {
						baseUrl,
						api: "openai-completions",
						apiKey: "VLLM_API_KEY",
						models: [{
							id: modelId,
							name: modelId,
							reasoning: false,
							input: ["text"],
							cost: VLLM_DEFAULT_COST,
							contextWindow: VLLM_DEFAULT_CONTEXT_WINDOW,
							maxTokens: VLLM_DEFAULT_MAX_TOKENS
						}]
					}
				}
			}
		},
		modelId,
		modelRef
	};
}

//#endregion
export { OPENAI_CODEX_DEFAULT_MODEL as n, applyOpenAICodexModelDefault as r, promptAndConfigureVllm as t };