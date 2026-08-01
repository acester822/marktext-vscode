import { Muya } from '../muya';
import { IClipboardPayload } from './copyData';
import { CopyType, PasteType } from './types';
export declare function shouldCrossBlockCut(key: string, metaKey: boolean, ctrlKey: boolean): boolean;
declare class Clipboard {
    muya: Muya;
    copyType: CopyType;
    pasteType: PasteType;
    copyInfo: string;
    get selection(): import('../selection').default;
    get scrollPage(): import('../types').Nullable<import('../block/scrollPage').ScrollPage>;
    static create(muya: Muya): Clipboard;
    constructor(muya: Muya);
    private _listen;
    getClipboardData(): IClipboardPayload;
    copyHandler(event: ClipboardEvent): void;
    cutHandler(): void;
    pasteHandler(event: ClipboardEvent, rawText?: string, rawHtml?: string): Promise<void>;
    copyAsMarkdown(): void;
    copyAsHtml(): void;
    copyAsRich(): void;
    pasteAsPlainText(): Promise<void>;
    pasteImage(src: string): Promise<void>;
    private _readClipboardText;
    copy(type: CopyType, info: string): void;
}
export default Clipboard;
