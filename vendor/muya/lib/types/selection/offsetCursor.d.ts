import { ScrollPage } from '../block/scrollPage';
import { TState } from '../state/types';
import { IPathCursor, ISelection } from './types';
/** One end of a source-mode (CodeMirror) selection: a `{ line, ch }` offset. */
export interface IIndexPosition {
    line: number;
    ch: number;
}
/** A source-mode selection in CodeMirror `{ line, ch }` coordinates. */
export interface IIndexCursor {
    anchor: IIndexPosition | null;
    focus: IIndexPosition | null;
}
/**
 * Inject the anchor/focus sentinels into `markdown` at the given `{ line, ch }`
 * offsets. Returns `null` when either offset references a line that does not
 * exist (stale cursor) so the caller can fall back to no cursor restore.
 */
export declare function injectSentinels(markdown: string, cursor: IIndexCursor): string | null;
/**
 * Resolve the index cursor against the live (sentinel-bearing) block tree into
 * a PATH-ONLY `IPathCursor` (json paths + offsets), or `null` when neither sentinel
 * resolved to a content block.
 *
 * Only the plain `anchorPath`/`focusPath` arrays are captured (snapshotted from
 * the live blocks here) — NOT the live block references. The caller rebuilds
 * the clean document immediately after, detaching these block instances, so
 * `setCursor` must re-resolve fresh blocks from those paths against the new
 * tree. The structure is identical between the sentinel tree and the clean tree
 * (the sentinels only change text), so the paths stay valid.
 *
 * The returned offsets are sentinel-free: the focus offset is decremented when
 * the anchor sentinel precedes it in the same block.
 */
export declare function resolveSentinelCursor(scrollPage: ScrollPage): IPathCursor | null;
/**
 * Inject the anchor/focus sentinels into a cloned `state` tree at the block
 * paths + offsets of `selection`. Returns the mutated state, or `null` when
 * neither endpoint resolves to a content block's text (so the caret can't be
 * located in the serialized markdown).
 *
 * When anchor and focus share a block, the sentinel at the SMALLER offset is
 * injected first (unshifted) and the one at the larger offset second, with its
 * offset bumped by the first sentinel's length — handling both forward and
 * backward selections. `_injectSentinelAtPath` re-reads the text on each call,
 * so injecting the earlier one first keeps the later offset valid.
 */
export declare function injectStateSentinels(state: TState[], selection: ISelection): TState[] | null;
/**
 * Read the sentinel positions back out of the serialized (sentinel-bearing)
 * `markdown` into an `{ line, ch }` index cursor. Returns `null` when a
 * sentinel that was injected cannot be found (e.g. a serializer dropped the
 * surrounding text). Removes both sentinels from the line/ch accounting: the
 * focus position is corrected for any earlier-occurring anchor sentinel.
 */
export declare function locateSentinelOffsets(markdown: string): IIndexCursor | null;
