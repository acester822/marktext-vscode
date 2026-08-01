import { Muya } from '../../../muya';
import { ITableState } from '../../../state/types';
import { Nullable } from '../../../types';
import { default as Content } from '../../base/content';
import { default as TableCellContent } from '../../content/tableCell';
import { TBlockPath } from '../../types';
import { default as TableBodyCell } from './cell';
import { default as TableInner } from './table';
import { LinkedList } from '../../base/linkedList/linkedList';
import { default as Parent } from '../../base/parent';
declare class Table extends Parent {
    children: LinkedList<TableInner>;
    static blockName: string;
    static create(muya: Muya, state: ITableState): Table;
    static createWithHeader(muya: Muya, header: string[]): Table;
    get path(): (string | number)[];
    get rowCount(): number;
    get columnCount(): number;
    constructor(muya: Muya);
    isEmpty(): boolean;
    private _listenDomEvent;
    queryBlock(path: TBlockPath): Content | Parent | undefined;
    protected empty(): void;
    insertRow(offset: number): any;
    insertColumn(offset: number, align?: string): TableCellContent;
    removeRow(offset: number): Nullable<Content>;
    removeColumn(offset: number): Nullable<Content>;
    alignColumn(offset: number, value: string): void;
    /**
     * Resolve a body cell by its (row, column) offsets, both zero-based. Returns
     * `null` when either index is out of range. Used by the cross-cell selection
     * controller to walk the rectangle between an anchor and focus cell.
     */
    cellAt(row: number, column: number): Nullable<TableBodyCell>;
    /**
     * Build an `ITableState` for the rectangular block of cells bounded by
     * (`startRow`, `startColumn`) and (`endRow`, `endColumn`) inclusive. The
     * bounds may be passed in any order — they are normalised — and are clamped
     * to the table's dimensions, so a copied cell rectangle round-trips to GFM
     * table markdown via `StateToMarkdown`. The first selected row becomes the
     * header
     * row of the resulting sub-table, preserving each cell's alignment.
     */
    getSubTableState(startRow: number, startColumn: number, endRow: number, endColumn: number): ITableState;
    getState(): ITableState;
}
export default Table;
