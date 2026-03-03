import { listSkillCommandsForAgents } from "../../auto-reply/skill-commands.js";
import type { OpenClawConfig, ReplyToMode } from "../../config/config.js";
import { type RuntimeEnv } from "../../runtime.js";
import { createDiscordGatewayPlugin } from "./gateway-plugin.js";
export type MonitorDiscordOpts = {
    token?: string;
    accountId?: string;
    config?: OpenClawConfig;
    runtime?: RuntimeEnv;
    abortSignal?: AbortSignal;
    mediaMaxMb?: number;
    historyLimit?: number;
    replyToMode?: ReplyToMode;
};
declare function dedupeSkillCommandsForDiscord(skillCommands: ReturnType<typeof listSkillCommandsForAgents>): import("../../agents/skills.ts").SkillCommandSpec[];
declare function resolveDiscordRestFetch(proxyUrl: string | undefined, runtime: RuntimeEnv): typeof fetch;
export declare function monitorDiscordProvider(opts?: MonitorDiscordOpts): Promise<void>;
export declare const __testing: {
    createDiscordGatewayPlugin: typeof createDiscordGatewayPlugin;
    dedupeSkillCommandsForDiscord: typeof dedupeSkillCommandsForDiscord;
    resolveDiscordRestFetch: typeof resolveDiscordRestFetch;
};
export {};
