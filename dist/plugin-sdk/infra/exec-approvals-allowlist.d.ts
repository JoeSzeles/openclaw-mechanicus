import { type ExecCommandAnalysis, type CommandResolution, type ExecCommandSegment } from "./exec-approvals-analysis.js";
import type { ExecAllowlistEntry } from "./exec-approvals.js";
export declare function normalizeSafeBins(entries?: string[]): Set<string>;
export declare function resolveSafeBins(entries?: string[] | null): Set<string>;
export declare function isSafeBinUsage(params: {
    argv: string[];
    resolution: CommandResolution | null;
    safeBins: Set<string>;
    cwd?: string;
    fileExists?: (filePath: string) => boolean;
}): boolean;
export type ExecAllowlistEvaluation = {
    allowlistSatisfied: boolean;
    allowlistMatches: ExecAllowlistEntry[];
    segmentSatisfiedBy: ExecSegmentSatisfiedBy[];
};
export type ExecSegmentSatisfiedBy = "allowlist" | "safeBins" | "skills" | null;
export declare function evaluateExecAllowlist(params: {
    analysis: ExecCommandAnalysis;
    allowlist: ExecAllowlistEntry[];
    safeBins: Set<string>;
    cwd?: string;
    skillBins?: Set<string>;
    autoAllowSkills?: boolean;
}): ExecAllowlistEvaluation;
export type ExecAllowlistAnalysis = {
    analysisOk: boolean;
    allowlistSatisfied: boolean;
    allowlistMatches: ExecAllowlistEntry[];
    segments: ExecCommandSegment[];
    segmentSatisfiedBy: ExecSegmentSatisfiedBy[];
};
/**
 * Evaluates allowlist for shell commands (including &&, ||, ;) and returns analysis metadata.
 */
export declare function evaluateShellAllowlist(params: {
    command: string;
    allowlist: ExecAllowlistEntry[];
    safeBins: Set<string>;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    skillBins?: Set<string>;
    autoAllowSkills?: boolean;
    platform?: string | null;
}): ExecAllowlistAnalysis;
