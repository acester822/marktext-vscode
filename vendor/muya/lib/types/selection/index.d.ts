import { Muya } from '../muya';
import { IAnchorFocusInfo, IImageSelectionData, ISelection, SelectionType } from './types';
import { default as ImageSelection } from './ImageSelection';
import { default as TableRectSelection } from './TableRectSelection';
import { default as TextSelection } from './TextSelection';
declare class Selection {
    private _muya;
    static getCursorYOffset(paragraph: HTMLElement): {
        topOffset: number;
        bottomOffset: number;
    };
    static getCursorCoords(preferEnd?: boolean): DOMRect | null;
    static getSelectionStart(): Node | null;
    private _text;
    private _image;
    private _table;
    constructor(_muya: Muya);
    get type(): SelectionType;
    get current(): TextSelection | TableRectSelection | ImageSelection;
    get image(): IImageSelectionData | null;
    get table(): TableRectSelection;
    get anchorBlock(): import('../types').Nullable<import('../block/base/content').default>;
    get anchorPath(): import('../block/types').TBlockPath;
    get focusBlock(): import('../types').Nullable<import('../block/base/content').default>;
    get focusPath(): import('../block/types').TBlockPath;
    get anchor(): import('../types').Nullable<import('./types').INodeOffset>;
    get focus(): import('../types').Nullable<import('./types').INodeOffset>;
    get isSelectionInSameBlock(): boolean;
    selectImage(data: IImageSelectionData): void;
    activate(type: SelectionType): void;
    clear(): void;
    clearImage(): void;
    getSelection(): ISelection | null;
    setSelection(anchor: IAnchorFocusInfo, focus: IAnchorFocusInfo): void;
    selectAll(): void;
}
export declare function getCursorReference(): {
    getBoundingClientRect(): DOMRect;
    clientWidth: number;
    clientHeight: number;
} | null;
export default Selection;
