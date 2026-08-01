import { Muya } from '../../index';
import { default as BaseScrollFloat } from '../baseScrollFloat';
/**
 * A single path suggestion produced by the `imagePathAutoComplete` hook.
 * `text` is the basename rendered (and written back into the src input);
 * `iconClass` selects a font-icon class, `type` distinguishes files from
 * directories. Extra keys are tolerated so callers can carry metadata.
 */
export interface IImagePathSuggestion {
    text: string;
    iconClass?: string;
    type?: string;
    [key: string]: unknown;
}
/**
 * Floating autocomplete dropdown that suggests local image file paths as the
 * user edits an image's `src` in the {@link ImageEditTool}. It listens
 * for the `muya-image-picker` event, renders a scrollable filtered list, and
 * supports arrow-key navigation plus Enter/click to choose. The chosen path is
 * written back through the callback supplied in the event payload.
 *
 * The list itself is produced by the host application via the
 * `imagePathAutoComplete` option on the ImageEditTool — muya only renders the
 * result and reports the selection.
 */
export declare class ImagePathPicker extends BaseScrollFloat {
    static pluginName: string;
    capturesContentKeydown: boolean;
    private _oldVNode;
    renderArray: IImagePathSuggestion[];
    activeItem: IImagePathSuggestion | null;
    constructor(muya: Muya, options?: {});
    listen(): void;
    render(): void;
    getItemElement(item: IImagePathSuggestion): HTMLElement | null;
}
export default ImagePathPicker;
