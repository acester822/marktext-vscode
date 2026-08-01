import { PasteType } from '../clipboard/types';
interface INormalizePastedHTMLOptions {
    preserveBareUrlLinks?: boolean;
}
export declare const isOnline: () => boolean;
export declare function getPageTitle(url: string): Promise<string>;
export declare function normalizePastedHTML(html: string, options?: INormalizePastedHTMLOptions): Promise<string>;
export declare function isStandaloneTableHtml(text: string): boolean;
/**
 * Resolve the `clipboardFilePath` paste hook to a usable inline-image path.
 *
 * Returns the resolved path only when the hook yields a non-empty string that
 * looks like an image file (its extension matches {@link IMAGE_EXT_REG});
 * otherwise returns `''` so the caller falls through to the normal text/HTML
 * paste.
 *
 * @param hook the `options.clipboardFilePath` callback, if configured
 */
export declare function resolveClipboardImagePath(hook: (() => Promise<string>) | undefined): Promise<string>;
/**
 * Extract an in-memory image `File` from a paste `DataTransfer`.
 *
 * Covers the bitmap clipboard case: screenshots and browser
 * "Copy Image" put image bytes — not a file path — on the clipboard. We
 * prefer `clipboardData.files` and fall back to scanning `clipboardData.items`
 * for the first `image/*` entry. Returns `null` when no image is present.
 */
export declare function getClipboardImageFile(clipboardData: DataTransfer | null): File | null;
/**
 * Read a `File`/`Blob` as a base64 `data:` URL.
 *
 * Used to turn a pasted bitmap into a `data:` URL that the embedder's
 * `imageAction` can persist. Prefers the native {@link FileReader}
 * (`readAsDataURL`), covering the
 * `chrome70` build target where `Blob.arrayBuffer()` is unavailable; falls
 * back to `Blob.arrayBuffer()` + `btoa` where `FileReader` is absent (e.g. the
 * Node test environment). Resolves to `''` on read error.
 */
export declare function readFileAsDataURL(file: File): Promise<string>;
/**
 *
 * @param {string} html
 * @param {string} text
 * @param {string} pasteType normal or pasteAsPlainText
 * return html | text | code, if the return value is html, we'll use html as paste data, we'll use text
 * as paste data if the return value is text, we'll create a html code block if the result is code.
 */
export declare function getCopyTextType(html: string, text: string, pasteType: PasteType): "text" | "code" | "html";
export {};
