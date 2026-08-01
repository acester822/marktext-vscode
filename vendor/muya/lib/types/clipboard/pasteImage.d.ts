import { default as Content } from '../block/base/content';
import { Nullable } from '../types';
import { default as Clipboard } from './index';
/**
 * Insert an image at the current cursor from an explicit `src`, routing it
 * through `imageAction` like a normal image paste. Used by the desktop macOS
 * screenshot flow: Chromium removed `document.execCommand('paste')`, so the
 * captured screenshot can no longer ride a synthetic paste event — the main
 * process saves the bitmap to a PNG and hands the path here instead.
 *
 * The anchor is the live selection's block, falling back to the persisted
 * active content block (the editor loses DOM focus during the menu/IPC
 * round-trip). No-ops when `src` is empty or no anchor block is available.
 */
export declare function pasteImageSrc(clipboard: Clipboard, src: string): Promise<void>;
/**
 * Insert a pasted image when the clipboard carries one. Returns `true` when an
 * image was inserted so the caller skips the text/HTML paste, `false` to fall
 * through.
 */
export declare function tryPasteImage(clipboard: Clipboard, anchorBlock: Content, imageFile: Nullable<File>): Promise<boolean>;
/**
 * Pasting an image while an inline image is selected replaces that image
 * (muyajs `pasteImage` selectedImage branch) instead of inserting a new one.
 * Returns `true` when it replaced the selected image.
 */
export declare function tryReplaceSelectedImage(clipboard: Clipboard, imageFile: Nullable<File>): Promise<boolean>;
