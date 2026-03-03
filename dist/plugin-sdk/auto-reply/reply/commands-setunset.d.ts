export type SetUnsetParseResult = {
    kind: "set";
    path: string;
    value: unknown;
} | {
    kind: "unset";
    path: string;
} | {
    kind: "error";
    message: string;
};
export declare function parseSetUnsetCommand(params: {
    slash: string;
    action: "set" | "unset";
    args: string;
}): SetUnsetParseResult;
