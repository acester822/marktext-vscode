import { default as Clipboard } from './index';
export declare function pasteSelection(clipboard: Clipboard, event: ClipboardEvent, rawText?: string, rawHtml?: string): Promise<void>;
export declare function pastePlainText(clipboard: Clipboard, text: string): Promise<void>;
