import type { CommandHandler } from "./commands-types.js";
type ChatMessage = {
    role?: unknown;
    content?: unknown;
};
export declare function extractMessageText(message: ChatMessage): {
    role: string;
    text: string;
} | null;
export declare const handleSubagentsCommand: CommandHandler;
export {};
