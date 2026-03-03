export { createAsyncLock, readJsonFile, writeJsonAtomic } from "./json-files.js";
export declare function resolvePairingPaths(baseDir: string | undefined, subdir: string): {
    dir: string;
    pendingPath: string;
    pairedPath: string;
};
export declare function pruneExpiredPending<T extends {
    ts: number;
}>(pendingById: Record<string, T>, nowMs: number, ttlMs: number): void;
