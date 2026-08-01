import { Muya } from '../../../muya';
import { IRenderCursor } from '../../../selection/types';
import { default as Table } from '../../gfm/table';
import { default as Format } from '../../base/format';
declare class TableCellContent extends Format {
    private _hasZeroWidthSpaceAtBeginning;
    static blockName: string;
    static create(muya: Muya, text: string): TableCellContent;
    get table(): Table;
    private get _tableInner();
    private get _row();
    private get _cell();
    constructor(muya: Muya, text: string);
    getAnchor(): Table;
    update(cursor?: IRenderCursor, highlights?: never[]): void;
    private _findNextRow;
    private _findPreviousRow;
    private _shiftEnter;
    private _commandEnter;
    private _normalEnter;
    enterHandler(event: Event): void;
    arrowHandler(event: Event): void;
    backspaceHandler(event: Event): void;
    tabHandler(event: Event): void;
    composeHandler(event: Event): void;
}
export default TableCellContent;
