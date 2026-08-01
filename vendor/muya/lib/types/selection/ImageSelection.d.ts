import { Muya } from '../muya';
import { default as Selection } from './index';
import { IImageSelectionData } from './types';
declare class ImageSelection {
    private _muya;
    private _selection;
    selected: IImageSelectionData | null;
    constructor(_muya: Muya, _selection: Selection);
    attach(): void;
    clear(): void;
    private _handleDocClick;
    private _handleClick;
    private _handleKeydown;
    private _previewSelectedImage;
    private _handleClickInlineImage;
}
export default ImageSelection;
