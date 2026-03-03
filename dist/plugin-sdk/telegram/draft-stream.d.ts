import type { Bot } from "grammy";
import { type TelegramThreadSpec } from "./bot/helpers.js";
export type TelegramDraftStream = {
    update: (text: string) => void;
    flush: () => Promise<void>;
    messageId: () => number | undefined;
    clear: () => Promise<void>;
    stop: () => Promise<void>;
    /** Reset internal state so the next update creates a new message instead of editing. */
    forceNewMessage: () => void;
};
export declare function createTelegramDraftStream(params: {
    api: Bot["api"];
    chatId: number;
    maxChars?: number;
    thread?: TelegramThreadSpec | null;
    replyToMessageId?: number;
    throttleMs?: number;
    /** Minimum chars before sending first message (debounce for push notifications) */
    minInitialChars?: number;
    log?: (message: string) => void;
    warn?: (message: string) => void;
}): TelegramDraftStream;
