import { Doc, JSONOp, JSONOpList, Path } from 'ot-json1';
import { Muya } from '../muya';
import { TDiff } from '../utils';
import { TState } from './types';
export declare function asDoc(state: TState[] | TState): Doc;
export declare function asState(doc: unknown): TState[];
declare class JSONState {
    private _muya;
    static invert(op: JSONOpList): JSONOp;
    static compose(op1: JSONOpList, op2: JSONOpList): JSONOp;
    static transform(op: JSONOpList, otherOp: JSONOpList, type: 'left' | 'right'): JSONOpList | null | undefined;
    private _operationCache;
    private _rafId;
    private _state;
    constructor(_muya: Muya, stateOrMarkdown: TState[] | string);
    private _apply;
    setContent(content: TState[] | string): void;
    private _setState;
    private _setMarkdown;
    markdownToState(markdown: string): TState[];
    /**
     * Build a single, fully-invertible ot-json1 op that turns the CURRENT
     * document state into `content` (markdown or a state array), and return it
     * together with the before/after states.
     *
     * The op is deliberately MOVE-FREE: it replaces each overlapping top-level
     * block, inserts the tail, and removes the surplus (highest index first).
     * It never emits a pick/drop `move`, so `json1.type.apply` reproduces the
     * target state exactly and `invertWithDoc` yields a lossless inverse. The op
     * is applied to the live tree via `ScrollPage.updateState` (a full rebuild),
     * never the incremental DOM walker, so arbitrary block-type changes are safe.
     */
    buildReplaceOp(content: TState[] | string): {
        op: JSONOpList;
        prevState: TState[];
        nextState: TState[];
    };
    insertOperation(path: Path, state: TState): void;
    removeOperation(path: Path): void;
    editOperation(path: Path, diff: TDiff[]): void;
    replaceOperation(path: Path, oldValue: Doc, newValue: Doc): void;
    dispatch(op: JSONOp, source?: string): void;
    getState(): TState[];
    getMarkdown(): string;
    getTOC(): import('./getTOC').ITocItem[];
    getMarkdownFromState(state: TState[]): string;
    private _emitStateChange;
    flush(): void;
    private _flushOperationCache;
}
export default JSONState;
