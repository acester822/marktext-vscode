import { default as Clipboard } from './index';
export interface IClipboardPayload {
    html: string;
    text: string;
}
export declare function getClipboardData(clipboard: Clipboard): IClipboardPayload;
export declare function writeClipboardData(clipboard: Clipboard, event: ClipboardEvent): void;
