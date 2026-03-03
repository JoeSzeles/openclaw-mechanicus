import { type DeliveryContext } from "../utils/delivery-context.js";
import { type SubagentRunOutcome } from "./subagent-announce.js";
export type SubagentRunRecord = {
    runId: string;
    childSessionKey: string;
    requesterSessionKey: string;
    requesterOrigin?: DeliveryContext;
    requesterDisplayKey: string;
    task: string;
    cleanup: "delete" | "keep";
    label?: string;
    model?: string;
    runTimeoutSeconds?: number;
    createdAt: number;
    startedAt?: number;
    endedAt?: number;
    outcome?: SubagentRunOutcome;
    archiveAtMs?: number;
    cleanupCompletedAt?: number;
    cleanupHandled?: boolean;
    suppressAnnounceReason?: "steer-restart" | "killed";
    /** Number of times announce delivery has been attempted and returned false (deferred). */
    announceRetryCount?: number;
    /** Timestamp of the last announce retry attempt (for backoff). */
    lastAnnounceRetryAt?: number;
};
export declare function markSubagentRunForSteerRestart(runId: string): boolean;
export declare function clearSubagentRunSteerRestart(runId: string): boolean;
export declare function replaceSubagentRunAfterSteer(params: {
    previousRunId: string;
    nextRunId: string;
    fallback?: SubagentRunRecord;
    runTimeoutSeconds?: number;
}): boolean;
export declare function registerSubagentRun(params: {
    runId: string;
    childSessionKey: string;
    requesterSessionKey: string;
    requesterOrigin?: DeliveryContext;
    requesterDisplayKey: string;
    task: string;
    cleanup: "delete" | "keep";
    label?: string;
    model?: string;
    runTimeoutSeconds?: number;
}): void;
export declare function resetSubagentRegistryForTests(opts?: {
    persist?: boolean;
}): void;
export declare function addSubagentRunForTests(entry: SubagentRunRecord): void;
export declare function releaseSubagentRun(runId: string): void;
export declare function resolveRequesterForChildSession(childSessionKey: string): {
    requesterSessionKey: string;
    requesterOrigin?: DeliveryContext;
} | null;
export declare function isSubagentSessionRunActive(childSessionKey: string): boolean;
export declare function markSubagentRunTerminated(params: {
    runId?: string;
    childSessionKey?: string;
    reason?: string;
}): number;
export declare function listSubagentRunsForRequester(requesterSessionKey: string): SubagentRunRecord[];
export declare function countActiveRunsForSession(requesterSessionKey: string): number;
export declare function countActiveDescendantRuns(rootSessionKey: string): number;
export declare function listDescendantRunsForRequester(rootSessionKey: string): SubagentRunRecord[];
export declare function initSubagentRegistry(): void;
