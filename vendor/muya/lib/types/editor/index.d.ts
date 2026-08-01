import { JSONOp } from 'ot-json1';
import { default as Content } from '../block/base/content';
import { Muya } from '../muya';
import { IHistorySelection } from '../selection/types';
import { TState } from '../state/types';
import { Nullable } from '../types';
import { ScrollPage } from '../block/scrollPage';
import { default as Clipboard } from '../clipboard';
import { default as History } from '../history';
import { default as InlineRenderer } from '../inlineRenderer';
import { Search } from '../search';
import { default as Selection } from '../selection';
import { default as JSONState } from '../state';
export declare class Editor {
    private _muya;
    jsonState: JSONState;
    inlineRenderer: InlineRenderer;
    selection: Selection;
    searchModule: Search;
    clipboard: Clipboard;
    history: History;
    scrollPage: Nullable<ScrollPage>;
    private _activeContentBlock;
    constructor(_muya: Muya);
    get activeContentBlock(): Nullable<Content>;
    set activeContentBlock(block: Nullable<Content>);
    init(): void;
    private _dispatchEvents;
    focus(): void;
    updateContents(operations: JSONOp, selection: Nullable<IHistorySelection>, source: string): void;
    private _restoreSelection;
    /**
     * Apply a history op by rebuilding the live block tree wholesale instead of
     * walking it incrementally (`updateContents`). The op is dispatched to the
     * authoritative json state, then `ScrollPage.updateState` re-creates the DOM
     * from that state — the same safe path `setContent` uses. Used for undo/redo
     * of whole-document boundaries (e.g. exiting source-code mode) whose op
     * shapes the incremental pick/drop walker cannot apply without desyncing the
     * DOM from the json state.
     */
    rebuildContents(operations: JSONOp, selection: Nullable<IHistorySelection>, source: string): void;
    setContent(content: TState[] | string, autoFocus?: boolean): void;
}
