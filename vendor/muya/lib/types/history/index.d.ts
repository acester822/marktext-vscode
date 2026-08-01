import { JSONOpList } from 'ot-json1';
import { Muya } from '../muya';
import { IAnchorFocusInfo, IHistorySelection } from '../selection/types';
import { TState } from '../state/types';
import { Nullable } from '../types';
interface IOptions {
    delay: number;
    maxStack: number;
    userOnly: boolean;
}
type ISerializableAnchorFocusInfo = Pick<IAnchorFocusInfo, 'offset' | 'path'>;
interface ISerializableSelection {
    anchor: ISerializableAnchorFocusInfo;
    focus: ISerializableAnchorFocusInfo;
    isCollapsed: IHistorySelection['isCollapsed'];
    isSelectionInSameBlock: IHistorySelection['isSelectionInSameBlock'];
    direction: IHistorySelection['direction'];
    type: IHistorySelection['type'];
}
interface ISerializableOperation {
    operation: JSONOpList;
    selection: Nullable<ISerializableSelection>;
    rebuild?: boolean;
}
export interface ISerializedHistory {
    stack: {
        undo: ISerializableOperation[];
        redo: ISerializableOperation[];
    };
    lastRecorded: number;
    selectionStack: (Nullable<ISerializableSelection>)[];
}
export type TInputKind = 'insert' | 'delete';
export declare function classifyInputKind(inputType: string): Nullable<TInputKind>;
export declare function shouldBreakUndoGroup(prevKind: Nullable<TInputKind>, kind: Nullable<TInputKind>, data: Nullable<string>): boolean;
declare class History {
    private _muya;
    private _options;
    private _lastRecorded;
    private _lastInputKind;
    private _ignoreChange;
    private _selectionStack;
    private _stack;
    private get _selection();
    constructor(_muya: Muya, _options?: IOptions);
    private _listen;
    private _change;
    clear(): void;
    getHistory(): ISerializedHistory;
    setHistory(history: ISerializedHistory): void;
    private _toSerializableOperation;
    private _fromSerializableOperation;
    private _toSerializableSelection;
    private _fromSerializableSelection;
    cutoff(): void;
    markInputBoundary(inputType: string, data: Nullable<string>): void;
    private _getLastSelection;
    private _record;
    /**
     * Record a whole-document replacement (e.g. exiting source-code mode) as a
     * single, standalone undo boundary that is applied via a full block-tree
     * rebuild rather than the incremental DOM walker.
     *
     * The forward op (`prevDoc` -> current state) is dispatched to the json
     * state by the caller; here we only record its lossless inverse so the first
     * undo reverts the entire bulk change in one step. The entry never coalesces
     * with neighbouring edits: `_lastRecorded` is reset so the next ordinary
     * edit also starts its own boundary, and the redo stack is cleared.
     */
    recordRebuild(op: JSONOpList, prevDoc: TState[], selection: Nullable<IHistorySelection>): void;
    /**
     * Run `fn` (which dispatches a json-change) WITHOUT recording it on the undo
     * stack. The caller has already recorded the corresponding boundary itself
     * (see `recordRebuild`), so the forward apply must not be double-recorded.
     */
    suppressRecording(fn: () => void): void;
    canRedo(): boolean;
    redo(): void;
    private _transform;
    canUndo(): boolean;
    undo(): void;
}
export default History;
