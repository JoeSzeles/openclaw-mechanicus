import type { NormalizedUsage } from "../../agents/usage.js";
import type { ChannelId, ChannelThreadingToolContext } from "../../channels/plugins/types.js";
import type { OpenClawConfig } from "../../config/config.js";
import type { TemplateContext } from "../templating.js";
import type { ReplyPayload } from "../types.js";
import type { FollowupRun } from "./queue.js";
/**
 * Build provider-specific threading context for tool auto-injection.
 */
export declare function buildThreadingToolContext(params: {
    sessionCtx: TemplateContext;
    config: OpenClawConfig | undefined;
    hasRepliedRef: {
        value: boolean;
    } | undefined;
}): ChannelThreadingToolContext;
export declare const isBunFetchSocketError: (message?: string) => boolean;
export declare const formatBunFetchSocketError: (message: string) => string;
export declare const formatResponseUsageLine: (params: {
    usage?: NormalizedUsage;
    showCost: boolean;
    costConfig?: {
        input: number;
        output: number;
        cacheRead: number;
        cacheWrite: number;
    };
}) => string | null;
export declare const appendUsageLine: (payloads: ReplyPayload[], line: string) => ReplyPayload[];
export declare const resolveEnforceFinalTag: (run: FollowupRun["run"], provider: string) => boolean;
export declare function buildEmbeddedContextFromTemplate(params: {
    run: FollowupRun["run"];
    sessionCtx: TemplateContext;
    hasRepliedRef: {
        value: boolean;
    } | undefined;
}): {
    currentChannelId?: string;
    currentChannelProvider?: ChannelId;
    currentThreadTs?: string;
    replyToMode?: "off" | "first" | "all";
    hasRepliedRef?: {
        value: boolean;
    };
    skipCrossContextDecoration?: boolean;
    sessionId: string;
    sessionKey: string | undefined;
    agentId: string;
    messageProvider: string | undefined;
    agentAccountId: string | undefined;
    messageTo: string | undefined;
    messageThreadId: string | number | undefined;
};
export declare function buildTemplateSenderContext(sessionCtx: TemplateContext): {
    senderId: string | undefined;
    senderName: string | undefined;
    senderUsername: string | undefined;
    senderE164: string | undefined;
};
export declare function resolveRunAuthProfile(run: FollowupRun["run"], provider: string): {
    authProfileId?: string;
    authProfileIdSource?: "auto" | "user";
};
export declare function resolveProviderScopedAuthProfile(params: {
    provider: string;
    primaryProvider: string;
    authProfileId?: string;
    authProfileIdSource?: "auto" | "user";
}): {
    authProfileId?: string;
    authProfileIdSource?: "auto" | "user";
};
