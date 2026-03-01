import { _ as isSubagentSessionKey, g as isCronSessionKey, l as normalizeAgentId, n as DEFAULT_AGENT_ID, v as parseAgentSessionKey } from "./session-key-9yEYlIQe.js";
import { O as pathExists, j as resolveUserPath } from "./registry-CvUzfgyU.js";
import { s as resolveStateDir, u as resolveRequiredHomeDir } from "./paths-DJmOcr7Q.js";
import { t as runCommandWithTimeout } from "./exec-CBwIXprv.js";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import fs$1 from "node:fs/promises";
import { fileURLToPath } from "node:url";

//#region src/agents/skills/filter.ts
function normalizeSkillFilter(skillFilter) {
	if (skillFilter === void 0) return;
	return skillFilter.map((entry) => String(entry).trim()).filter(Boolean);
}

//#endregion
//#region src/infra/openclaw-root.ts
const CORE_PACKAGE_NAMES = new Set(["openclaw"]);
async function readPackageName(dir) {
	try {
		const raw = await fs$1.readFile(path.join(dir, "package.json"), "utf-8");
		const parsed = JSON.parse(raw);
		return typeof parsed.name === "string" ? parsed.name : null;
	} catch {
		return null;
	}
}
function readPackageNameSync(dir) {
	try {
		const raw = fs.readFileSync(path.join(dir, "package.json"), "utf-8");
		const parsed = JSON.parse(raw);
		return typeof parsed.name === "string" ? parsed.name : null;
	} catch {
		return null;
	}
}
async function findPackageRoot(startDir, maxDepth = 12) {
	let current = path.resolve(startDir);
	for (let i = 0; i < maxDepth; i += 1) {
		const name = await readPackageName(current);
		if (name && CORE_PACKAGE_NAMES.has(name)) return current;
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return null;
}
function findPackageRootSync(startDir, maxDepth = 12) {
	let current = path.resolve(startDir);
	for (let i = 0; i < maxDepth; i += 1) {
		const name = readPackageNameSync(current);
		if (name && CORE_PACKAGE_NAMES.has(name)) return current;
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return null;
}
function candidateDirsFromArgv1(argv1) {
	const normalized = path.resolve(argv1);
	const candidates = [path.dirname(normalized)];
	try {
		const resolved = fs.realpathSync(normalized);
		if (resolved !== normalized) candidates.push(path.dirname(resolved));
	} catch {}
	const parts = normalized.split(path.sep);
	const binIndex = parts.lastIndexOf(".bin");
	if (binIndex > 0 && parts[binIndex - 1] === "node_modules") {
		const binName = path.basename(normalized);
		const nodeModulesDir = parts.slice(0, binIndex).join(path.sep);
		candidates.push(path.join(nodeModulesDir, binName));
	}
	return candidates;
}
async function resolveOpenClawPackageRoot(opts) {
	for (const candidate of buildCandidates(opts)) {
		const found = await findPackageRoot(candidate);
		if (found) return found;
	}
	return null;
}
function resolveOpenClawPackageRootSync(opts) {
	for (const candidate of buildCandidates(opts)) {
		const found = findPackageRootSync(candidate);
		if (found) return found;
	}
	return null;
}
function buildCandidates(opts) {
	const candidates = [];
	if (opts.moduleUrl) candidates.push(path.dirname(fileURLToPath(opts.moduleUrl)));
	if (opts.argv1) candidates.push(...candidateDirsFromArgv1(opts.argv1));
	if (opts.cwd) candidates.push(opts.cwd);
	return candidates;
}

//#endregion
//#region src/agents/workspace-templates.ts
const FALLBACK_TEMPLATE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../docs/reference/templates");
let cachedTemplateDir;
let resolvingTemplateDir;
async function resolveWorkspaceTemplateDir(opts) {
	if (cachedTemplateDir) return cachedTemplateDir;
	if (resolvingTemplateDir) return resolvingTemplateDir;
	resolvingTemplateDir = (async () => {
		const moduleUrl = opts?.moduleUrl ?? import.meta.url;
		const argv1 = opts?.argv1 ?? process.argv[1];
		const cwd = opts?.cwd ?? process.cwd();
		const packageRoot = await resolveOpenClawPackageRoot({
			moduleUrl,
			argv1,
			cwd
		});
		const candidates = [
			packageRoot ? path.join(packageRoot, "docs", "reference", "templates") : null,
			cwd ? path.resolve(cwd, "docs", "reference", "templates") : null,
			FALLBACK_TEMPLATE_DIR
		].filter(Boolean);
		for (const candidate of candidates) if (await pathExists(candidate)) {
			cachedTemplateDir = candidate;
			return candidate;
		}
		cachedTemplateDir = candidates[0] ?? FALLBACK_TEMPLATE_DIR;
		return cachedTemplateDir;
	})();
	try {
		return await resolvingTemplateDir;
	} finally {
		resolvingTemplateDir = void 0;
	}
}

//#endregion
//#region src/agents/workspace.ts
function resolveDefaultAgentWorkspaceDir(env = process.env, homedir = os.homedir) {
	const home = resolveRequiredHomeDir(env, homedir);
	const profile = env.OPENCLAW_PROFILE?.trim();
	if (profile && profile.toLowerCase() !== "default") return path.join(home, ".openclaw", `workspace-${profile}`);
	return path.join(home, ".openclaw", "workspace");
}
const DEFAULT_AGENT_WORKSPACE_DIR = resolveDefaultAgentWorkspaceDir();
const DEFAULT_AGENTS_FILENAME = "AGENTS.md";
const DEFAULT_SOUL_FILENAME = "SOUL.md";
const DEFAULT_TOOLS_FILENAME = "TOOLS.md";
const DEFAULT_IDENTITY_FILENAME = "IDENTITY.md";
const DEFAULT_USER_FILENAME = "USER.md";
const DEFAULT_HEARTBEAT_FILENAME = "HEARTBEAT.md";
const DEFAULT_BOOTSTRAP_FILENAME = "BOOTSTRAP.md";
const DEFAULT_MEMORY_FILENAME = "MEMORY.md";
const DEFAULT_MEMORY_ALT_FILENAME = "memory.md";
const WORKSPACE_STATE_DIRNAME = ".openclaw";
const WORKSPACE_STATE_FILENAME = "workspace-state.json";
const WORKSPACE_STATE_VERSION = 1;
const workspaceTemplateCache = /* @__PURE__ */ new Map();
let gitAvailabilityPromise = null;
function stripFrontMatter(content) {
	if (!content.startsWith("---")) return content;
	const endIndex = content.indexOf("\n---", 3);
	if (endIndex === -1) return content;
	const start = endIndex + 4;
	let trimmed = content.slice(start);
	trimmed = trimmed.replace(/^\s+/, "");
	return trimmed;
}
async function loadTemplate(name) {
	const cached = workspaceTemplateCache.get(name);
	if (cached) return cached;
	const pending = (async () => {
		const templateDir = await resolveWorkspaceTemplateDir();
		const templatePath = path.join(templateDir, name);
		try {
			return stripFrontMatter(await fs$1.readFile(templatePath, "utf-8"));
		} catch {
			throw new Error(`Missing workspace template: ${name} (${templatePath}). Ensure docs/reference/templates are packaged.`);
		}
	})();
	workspaceTemplateCache.set(name, pending);
	try {
		return await pending;
	} catch (error) {
		workspaceTemplateCache.delete(name);
		throw error;
	}
}
async function writeFileIfMissing(filePath, content) {
	try {
		await fs$1.writeFile(filePath, content, {
			encoding: "utf-8",
			flag: "wx"
		});
		return true;
	} catch (err) {
		if (err.code !== "EEXIST") throw err;
		return false;
	}
}
async function fileExists(filePath) {
	try {
		await fs$1.access(filePath);
		return true;
	} catch {
		return false;
	}
}
function resolveWorkspaceStatePath(dir) {
	return path.join(dir, WORKSPACE_STATE_DIRNAME, WORKSPACE_STATE_FILENAME);
}
function parseWorkspaceOnboardingState(raw) {
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		return {
			version: WORKSPACE_STATE_VERSION,
			bootstrapSeededAt: typeof parsed.bootstrapSeededAt === "string" ? parsed.bootstrapSeededAt : void 0,
			onboardingCompletedAt: typeof parsed.onboardingCompletedAt === "string" ? parsed.onboardingCompletedAt : void 0
		};
	} catch {
		return null;
	}
}
async function readWorkspaceOnboardingState(statePath) {
	try {
		return parseWorkspaceOnboardingState(await fs$1.readFile(statePath, "utf-8")) ?? { version: WORKSPACE_STATE_VERSION };
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
		return { version: WORKSPACE_STATE_VERSION };
	}
}
async function writeWorkspaceOnboardingState(statePath, state) {
	await fs$1.mkdir(path.dirname(statePath), { recursive: true });
	const payload = `${JSON.stringify(state, null, 2)}\n`;
	const tmpPath = `${statePath}.tmp-${process.pid}-${Date.now().toString(36)}`;
	try {
		await fs$1.writeFile(tmpPath, payload, { encoding: "utf-8" });
		await fs$1.rename(tmpPath, statePath);
	} catch (err) {
		await fs$1.unlink(tmpPath).catch(() => {});
		throw err;
	}
}
async function hasGitRepo(dir) {
	try {
		await fs$1.stat(path.join(dir, ".git"));
		return true;
	} catch {
		return false;
	}
}
async function isGitAvailable() {
	if (gitAvailabilityPromise) return gitAvailabilityPromise;
	gitAvailabilityPromise = (async () => {
		try {
			return (await runCommandWithTimeout(["git", "--version"], { timeoutMs: 2e3 })).code === 0;
		} catch {
			return false;
		}
	})();
	return gitAvailabilityPromise;
}
async function ensureGitRepo(dir, isBrandNewWorkspace) {
	if (!isBrandNewWorkspace) return;
	if (await hasGitRepo(dir)) return;
	if (!await isGitAvailable()) return;
	try {
		await runCommandWithTimeout(["git", "init"], {
			cwd: dir,
			timeoutMs: 1e4
		});
	} catch {}
}
async function ensureAgentWorkspace(params) {
	const dir = resolveUserPath(params?.dir?.trim() ? params.dir.trim() : DEFAULT_AGENT_WORKSPACE_DIR);
	await fs$1.mkdir(dir, { recursive: true });
	if (!params?.ensureBootstrapFiles) return { dir };
	const agentsPath = path.join(dir, DEFAULT_AGENTS_FILENAME);
	const soulPath = path.join(dir, DEFAULT_SOUL_FILENAME);
	const toolsPath = path.join(dir, DEFAULT_TOOLS_FILENAME);
	const identityPath = path.join(dir, DEFAULT_IDENTITY_FILENAME);
	const userPath = path.join(dir, DEFAULT_USER_FILENAME);
	const heartbeatPath = path.join(dir, DEFAULT_HEARTBEAT_FILENAME);
	const bootstrapPath = path.join(dir, DEFAULT_BOOTSTRAP_FILENAME);
	const statePath = resolveWorkspaceStatePath(dir);
	const isBrandNewWorkspace = await (async () => {
		const paths = [
			agentsPath,
			soulPath,
			toolsPath,
			identityPath,
			userPath,
			heartbeatPath
		];
		return (await Promise.all(paths.map(async (p) => {
			try {
				await fs$1.access(p);
				return true;
			} catch {
				return false;
			}
		}))).every((v) => !v);
	})();
	const agentsTemplate = await loadTemplate(DEFAULT_AGENTS_FILENAME);
	const soulTemplate = await loadTemplate(DEFAULT_SOUL_FILENAME);
	const toolsTemplate = await loadTemplate(DEFAULT_TOOLS_FILENAME);
	const identityTemplate = await loadTemplate(DEFAULT_IDENTITY_FILENAME);
	const userTemplate = await loadTemplate(DEFAULT_USER_FILENAME);
	const heartbeatTemplate = await loadTemplate(DEFAULT_HEARTBEAT_FILENAME);
	await writeFileIfMissing(agentsPath, agentsTemplate);
	await writeFileIfMissing(soulPath, soulTemplate);
	await writeFileIfMissing(toolsPath, toolsTemplate);
	await writeFileIfMissing(identityPath, identityTemplate);
	await writeFileIfMissing(userPath, userTemplate);
	await writeFileIfMissing(heartbeatPath, heartbeatTemplate);
	let state = await readWorkspaceOnboardingState(statePath);
	let stateDirty = false;
	const markState = (next) => {
		state = {
			...state,
			...next
		};
		stateDirty = true;
	};
	const nowIso = () => (/* @__PURE__ */ new Date()).toISOString();
	let bootstrapExists = await fileExists(bootstrapPath);
	if (!state.bootstrapSeededAt && bootstrapExists) markState({ bootstrapSeededAt: nowIso() });
	if (!state.onboardingCompletedAt && state.bootstrapSeededAt && !bootstrapExists) markState({ onboardingCompletedAt: nowIso() });
	if (!state.bootstrapSeededAt && !state.onboardingCompletedAt && !bootstrapExists) {
		const [identityContent, userContent] = await Promise.all([fs$1.readFile(identityPath, "utf-8"), fs$1.readFile(userPath, "utf-8")]);
		if (identityContent !== identityTemplate || userContent !== userTemplate) markState({ onboardingCompletedAt: nowIso() });
		else {
			if (!await writeFileIfMissing(bootstrapPath, await loadTemplate(DEFAULT_BOOTSTRAP_FILENAME))) bootstrapExists = await fileExists(bootstrapPath);
			else bootstrapExists = true;
			if (bootstrapExists && !state.bootstrapSeededAt) markState({ bootstrapSeededAt: nowIso() });
		}
	}
	if (stateDirty) await writeWorkspaceOnboardingState(statePath, state);
	await ensureGitRepo(dir, isBrandNewWorkspace);
	return {
		dir,
		agentsPath,
		soulPath,
		toolsPath,
		identityPath,
		userPath,
		heartbeatPath,
		bootstrapPath
	};
}
async function resolveMemoryBootstrapEntries(resolvedDir) {
	const candidates = [DEFAULT_MEMORY_FILENAME, DEFAULT_MEMORY_ALT_FILENAME];
	const entries = [];
	for (const name of candidates) {
		const filePath = path.join(resolvedDir, name);
		try {
			await fs$1.access(filePath);
			entries.push({
				name,
				filePath
			});
		} catch {}
	}
	if (entries.length <= 1) return entries;
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const entry of entries) {
		let key = entry.filePath;
		try {
			key = await fs$1.realpath(entry.filePath);
		} catch {}
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(entry);
	}
	return deduped;
}
async function loadWorkspaceBootstrapFiles(dir) {
	const resolvedDir = resolveUserPath(dir);
	const entries = [
		{
			name: DEFAULT_AGENTS_FILENAME,
			filePath: path.join(resolvedDir, DEFAULT_AGENTS_FILENAME)
		},
		{
			name: DEFAULT_SOUL_FILENAME,
			filePath: path.join(resolvedDir, DEFAULT_SOUL_FILENAME)
		},
		{
			name: DEFAULT_TOOLS_FILENAME,
			filePath: path.join(resolvedDir, DEFAULT_TOOLS_FILENAME)
		},
		{
			name: DEFAULT_IDENTITY_FILENAME,
			filePath: path.join(resolvedDir, DEFAULT_IDENTITY_FILENAME)
		},
		{
			name: DEFAULT_USER_FILENAME,
			filePath: path.join(resolvedDir, DEFAULT_USER_FILENAME)
		},
		{
			name: DEFAULT_HEARTBEAT_FILENAME,
			filePath: path.join(resolvedDir, DEFAULT_HEARTBEAT_FILENAME)
		},
		{
			name: DEFAULT_BOOTSTRAP_FILENAME,
			filePath: path.join(resolvedDir, DEFAULT_BOOTSTRAP_FILENAME)
		}
	];
	entries.push(...await resolveMemoryBootstrapEntries(resolvedDir));
	const result = [];
	for (const entry of entries) try {
		const content = await fs$1.readFile(entry.filePath, "utf-8");
		result.push({
			name: entry.name,
			path: entry.filePath,
			content,
			missing: false
		});
	} catch {
		result.push({
			name: entry.name,
			path: entry.filePath,
			missing: true
		});
	}
	return result;
}
const MINIMAL_BOOTSTRAP_ALLOWLIST = new Set([DEFAULT_AGENTS_FILENAME, DEFAULT_TOOLS_FILENAME]);
function filterBootstrapFilesForSession(files, sessionKey) {
	if (!sessionKey || !isSubagentSessionKey(sessionKey) && !isCronSessionKey(sessionKey)) return files;
	return files.filter((file) => MINIMAL_BOOTSTRAP_ALLOWLIST.has(file.name));
}

//#endregion
//#region src/agents/agent-scope.ts
let defaultAgentWarned = false;
function listAgents(cfg) {
	const list = cfg.agents?.list;
	if (!Array.isArray(list)) return [];
	return list.filter((entry) => Boolean(entry && typeof entry === "object"));
}
function listAgentIds(cfg) {
	const agents = listAgents(cfg);
	if (agents.length === 0) return [DEFAULT_AGENT_ID];
	const seen = /* @__PURE__ */ new Set();
	const ids = [];
	for (const entry of agents) {
		const id = normalizeAgentId(entry?.id);
		if (seen.has(id)) continue;
		seen.add(id);
		ids.push(id);
	}
	return ids.length > 0 ? ids : [DEFAULT_AGENT_ID];
}
function resolveDefaultAgentId(cfg) {
	const agents = listAgents(cfg);
	if (agents.length === 0) return DEFAULT_AGENT_ID;
	const defaults = agents.filter((agent) => agent?.default);
	if (defaults.length > 1 && !defaultAgentWarned) {
		defaultAgentWarned = true;
		console.warn("Multiple agents marked default=true; using the first entry as default.");
	}
	const chosen = (defaults[0] ?? agents[0])?.id?.trim();
	return normalizeAgentId(chosen || DEFAULT_AGENT_ID);
}
function resolveSessionAgentIds(params) {
	const defaultAgentId = resolveDefaultAgentId(params.config ?? {});
	const sessionKey = params.sessionKey?.trim();
	const normalizedSessionKey = sessionKey ? sessionKey.toLowerCase() : void 0;
	const parsed = normalizedSessionKey ? parseAgentSessionKey(normalizedSessionKey) : null;
	return {
		defaultAgentId,
		sessionAgentId: parsed?.agentId ? normalizeAgentId(parsed.agentId) : defaultAgentId
	};
}
function resolveSessionAgentId(params) {
	return resolveSessionAgentIds(params).sessionAgentId;
}
function resolveAgentEntry(cfg, agentId) {
	const id = normalizeAgentId(agentId);
	return listAgents(cfg).find((entry) => normalizeAgentId(entry.id) === id);
}
function resolveAgentConfig(cfg, agentId) {
	const entry = resolveAgentEntry(cfg, normalizeAgentId(agentId));
	if (!entry) return;
	return {
		name: typeof entry.name === "string" ? entry.name : void 0,
		workspace: typeof entry.workspace === "string" ? entry.workspace : void 0,
		agentDir: typeof entry.agentDir === "string" ? entry.agentDir : void 0,
		model: typeof entry.model === "string" || entry.model && typeof entry.model === "object" ? entry.model : void 0,
		skills: Array.isArray(entry.skills) ? entry.skills : void 0,
		memorySearch: entry.memorySearch,
		humanDelay: entry.humanDelay,
		heartbeat: entry.heartbeat,
		identity: entry.identity,
		groupChat: entry.groupChat,
		subagents: typeof entry.subagents === "object" && entry.subagents ? entry.subagents : void 0,
		sandbox: entry.sandbox,
		tools: entry.tools
	};
}
function resolveAgentSkillsFilter(cfg, agentId) {
	return normalizeSkillFilter(resolveAgentConfig(cfg, agentId)?.skills);
}
function resolveAgentModelPrimary(cfg, agentId) {
	const raw = resolveAgentConfig(cfg, agentId)?.model;
	if (!raw) return;
	if (typeof raw === "string") return raw.trim() || void 0;
	return raw.primary?.trim() || void 0;
}
function resolveAgentModelFallbacksOverride(cfg, agentId) {
	const raw = resolveAgentConfig(cfg, agentId)?.model;
	if (!raw || typeof raw === "string") return;
	if (!Object.hasOwn(raw, "fallbacks")) return;
	return Array.isArray(raw.fallbacks) ? raw.fallbacks : void 0;
}
function resolveAgentWorkspaceDir(cfg, agentId) {
	const id = normalizeAgentId(agentId);
	const configured = resolveAgentConfig(cfg, id)?.workspace?.trim();
	if (configured) return resolveUserPath(configured);
	if (id === resolveDefaultAgentId(cfg)) {
		const fallback = cfg.agents?.defaults?.workspace?.trim();
		if (fallback) return resolveUserPath(fallback);
		return resolveDefaultAgentWorkspaceDir(process.env);
	}
	const stateDir = resolveStateDir(process.env);
	return path.join(stateDir, `workspace-${id}`);
}
function resolveAgentDir(cfg, agentId) {
	const id = normalizeAgentId(agentId);
	const configured = resolveAgentConfig(cfg, id)?.agentDir?.trim();
	if (configured) return resolveUserPath(configured);
	const root = resolveStateDir(process.env);
	return path.join(root, "agents", id, "agent");
}

//#endregion
export { resolveOpenClawPackageRootSync as C, resolveOpenClawPackageRoot as S, DEFAULT_TOOLS_FILENAME as _, resolveAgentModelPrimary as a, filterBootstrapFilesForSession as b, resolveDefaultAgentId as c, DEFAULT_AGENTS_FILENAME as d, DEFAULT_AGENT_WORKSPACE_DIR as f, DEFAULT_SOUL_FILENAME as g, DEFAULT_IDENTITY_FILENAME as h, resolveAgentModelFallbacksOverride as i, resolveSessionAgentId as l, DEFAULT_HEARTBEAT_FILENAME as m, resolveAgentConfig as n, resolveAgentSkillsFilter as o, DEFAULT_BOOTSTRAP_FILENAME as p, resolveAgentDir as r, resolveAgentWorkspaceDir as s, listAgentIds as t, resolveSessionAgentIds as u, DEFAULT_USER_FILENAME as v, normalizeSkillFilter as w, loadWorkspaceBootstrapFiles as x, ensureAgentWorkspace as y };