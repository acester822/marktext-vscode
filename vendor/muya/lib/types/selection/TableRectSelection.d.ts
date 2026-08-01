import { default as Table } from '../block/gfm/table';
import { default as TableBodyCell } from '../block/gfm/table/cell';
import { Muya } from '../muya';
import { ITableState } from '../state/types';
import { Nullable } from '../types';
declare class TableRectSelection {
    private _muya;
    private _table;
    private _anchor;
    private _focus;
    private _isSelecting;
    private _dragEventIds;
    static create(muya: Muya): TableRectSelection;
    constructor(_muya: Muya);
    get hasSelection(): boolean;
    isSingleCellSelected(): boolean;
    isWholeTableSelected(): boolean;
    selectTable(table: Table): void;
    selectWholeTable(): void;
    selectSingleCell(cell: TableBodyCell): void;
    private _attach;
    private _onMouseDown;
    private _onMouseMove;
    private _onMouseUp;
    private _freezeNativeSelection;
    private _suppressNativeRange;
    private _detachDragEvents;
    private _cellPositionFromEvent;
    /** Apply the selection class to every cell inside the anchor→focus rectangle. */
    private _renderHighlight;
    private _clearHighlight;
    /**
     * The selected rectangle as an `ITableState` sub-table, or `null` when there
     * is no frozen selection. The clipboard serializes this to GFM markdown.
     */
    getStateForCopy(): Nullable<ITableState>;
    /**
     * Empty every selected cell's text and re-render it, keeping the frozen
     * selection. Returns whether any cell actually had content to clear — the
     * caller uses that to drive the two-stage keyboard delete (first press
     * clears, second press removes structure). Each cleared cell is re-rendered
     * via `update()`; setting `.text` alone only patches state, so without this
     * the non-anchor cells would keep their stale DOM.
     */
    emptySelectedCells(): boolean;
    clearSelectedCells(): void;
    /** Discard the frozen selection and remove every highlight class. */
    clear(): void;
}
export default TableRectSelection;
