import { default as ContentBlock } from '../block/base/content';
import { default as Format } from '../block/base/format';
import { TBlockPath } from '../block/types';
import { ImageToken } from '../inlineRenderer/types';
export interface INodeOffset {
    offset: number;
}
export interface IContentCursor extends ISelection {
    start: INodeOffset;
    end: INodeOffset;
}
export interface IRenderCursor {
    start?: INodeOffset;
    end?: INodeOffset;
    anchor?: INodeOffset;
    focus?: INodeOffset;
    block?: ContentBlock;
}
export interface IPublicCursorInput {
    start?: INodeOffset | null;
    end?: INodeOffset | null;
    anchor?: INodeOffset | null;
    focus?: INodeOffset | null;
    block?: ContentBlock;
    path?: TBlockPath;
    anchorBlock?: ContentBlock;
    anchorPath?: TBlockPath;
    focusBlock?: ContentBlock;
    focusPath?: TBlockPath;
}
export interface IPathCursor {
    anchor: INodeOffset;
    anchorPath: TBlockPath;
    focus: INodeOffset;
    focusPath: TBlockPath;
}
export interface IAnchorFocusInfo {
    offset: number;
    block: ContentBlock;
    path: TBlockPath;
}
export interface ISelection {
    anchor: IAnchorFocusInfo;
    focus: IAnchorFocusInfo;
    isCollapsed: boolean;
    isSelectionInSameBlock: boolean;
    direction: SelectionDirection;
    type: SelectionCaretType;
}
export type IHistoryAnchorFocusInfo = Omit<IAnchorFocusInfo, 'block'> & {
    block?: ContentBlock;
};
export type IHistorySelection = Omit<ISelection, 'anchor' | 'focus'> & {
    anchor: IHistoryAnchorFocusInfo;
    focus: IHistoryAnchorFocusInfo;
};
export declare enum SelectionType {
    TEXT = "text",
    TABLE = "table",
    IMAGE = "image"
}
export declare enum SelectionDirection {
    NONE = "none",
    FORWARD = "forward",
    BACKWARD = "backward"
}
export declare enum SelectionCaretType {
    NONE = "None",
    CARET = "Caret",
    RANGE = "Range"
}
export interface IImageSelectionData {
    token: ImageToken;
    imageId: string;
    block: Format;
}
