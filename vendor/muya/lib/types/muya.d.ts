import { default as Parent } from './block/base/parent';
import { Listener } from './event/types';
import { ILocale } from './i18n/types';
import { IIndexCursor } from './selection/offsetCursor';
import { IHistorySelection, IPublicCursorInput } from './selection/types';
import { ITocItem } from './state/getTOC';
import { TState } from './state/types';
import { IMuyaOptions, Nullable } from './types';
import { Editor } from './editor/index';
import { default as EventCenter } from './event/index';
import { default as I18n } from './i18n/index';
import { Ui } from './ui/ui';
export interface IMuyaPluginConstructor {
    pluginName: string;
    new (muya: Muya, options: Record<string, unknown>): unknown;
}
interface IPlugin {
    plugin: IMuyaPluginConstructor;
    options: Record<string, unknown>;
}
export declare class Muya {
    static plugins: IPlugin[];
    static use(plugin: IMuyaPluginConstructor, options?: Record<string, unknown>): void;
    readonly version: string;
    options: IMuyaOptions;
    eventCenter: EventCenter;
    domNode: HTMLElement;
    editor: Editor;
    ui: Ui;
    i18n: I18n;
    private _uiPlugins;
    constructor(element: HTMLElement, options?: Partial<IMuyaOptions>);
    private _bindFocusBlurEvents;
    init(): void;
    locale(object: ILocale): void;
    /**
     * [on] on custom event
     */
    on(event: string, listener: Listener): void;
    /**
     * [off] off custom event
     */
    off(event: string, listener: Listener): void;
    /**
     * [once] subscribe event and listen once
     */
    once(event: string, listener: Listener): void;
    getState(): TState[];
    getMarkdown(): string;
    flush(): void;
    getTOC(): ITocItem[];
    undo(): void;
    redo(): void;
    getHistory(): import('./history').ISerializedHistory;
    setHistory(history: ReturnType<Muya['getHistory']>): void;
    /**
     * Clear the undo/redo history (e.g. after loading a fresh document).
     */
    clearHistory(): void;
    /**
     * Search value in current document.
     * @param {string} value
     * @param {object} opts
     */
    search(value: string, opts?: {}): import('./search').Search;
    /**
     * Find preview or next value, and highlight it.
     * @param {string} action : previous or next.
     */
    find(action: 'previous' | 'next'): import('./search').Search;
    replace(replaceValue: string, opt?: {
        isSingle: boolean;
        isRegexp: boolean;
    }): import('./search').Search;
    setContent(content: TState[] | string, autoFocus?: boolean): void;
    /**
     * Replace the whole document with `content` (markdown or a state array) as a
     * SINGLE undo boundary — the first subsequent `undo()` reverts the entire
     * replacement in one step. Unlike `setContent`, the existing undo/redo
     * history is preserved and a new boundary is pushed on top of it.
     *
     * Used by the desktop shell when handing a tab back from source-code mode:
     * the bulk source-mode edit becomes one undo step. The change is recorded
     * as a `rebuild` history entry, so undo /
     * redo re-create the block tree wholesale (`ScrollPage.updateState`) rather
     * than walking it incrementally — making arbitrary block-type changes
     * (paragraph<->heading, list/table/code/frontmatter, multi-block reorder…)
     * safe to round-trip. No-op when `content` is identical to the current
     * document.
     *
     * `recordSelection` overrides the caret stored on the rebuild boundary (the
     * one the first `undo()` restores). Pass it when the live DOM selection no
     * longer points into the muya tree at call time — notably the source-mode
     * handoff, where focus has moved to CodeMirror, so the desktop shell hands
     * back the caret captured when the user switched INTO source mode. Omitted,
     * it falls back to the current live selection.
     *
     * @returns `true` if a boundary was recorded, `false` if nothing changed.
     */
    replaceContent(content: TState[] | string, recordSelection?: Nullable<IHistorySelection>): boolean;
    setOptions(options: Partial<IMuyaOptions>, forceRender?: boolean): void;
    private _forceRender;
    /** Update list indentation and re-render so it takes effect. */
    setListIndentation(listIndentation: IMuyaOptions['listIndentation']): void;
    focus(): void;
    setFocusMode(focusMode: boolean): void;
    selectAll(): void;
    format(type: string): void;
    private _formatAcrossBlocks;
    /** The selection's first/last content leaves and offsets, in document order. */
    private _orderedSelectionRange;
    /**
     * Apply `type` to one leaf over [start, end], skipping non-formattable
     * leaves and a heading's leading `# ` marker. Returns the leaf's selection
     * range AFTER formatting (offsets shift past inserted markers), or null when
     * the leaf was skipped.
     */
    private _formatLeafInRange;
    /** Length of a heading content's leading `#{1,6}` + space marker, else 0. */
    private _headingMarkerLen;
    /**
     * Replace the word at the current cursor with `replacement`, then place the
     * cursor after the replacement.
     *
     * The desktop spell checker calls this when the user picks a suggestion
     * from the misspelled-word
     * context menu (Chromium has already selected the whole word). Unsafe: the
     * call is a no-op unless the word at the cursor matches `word`.
     *
     * @param word The expected (misspelled) word at the cursor.
     * @param replacement The replacement word.
     * @returns True when the replacement was applied.
     */
    replaceCurrentWordInlineUnsafe(word: string, replacement: string): boolean;
    /**
     * Return the current selection, or null when the editor has no selection.
     */
    getSelection(): import('./selection/types').ISelection | null;
    /**
     * Whether the editor (or one of its descendants) currently holds focus.
     */
    hasFocus(): boolean;
    /**
     * Blur the editor. Always hides every floating tool and blurs the
     * contenteditable node.
     * @param isRemoveAllRange Remove all native selection ranges.
     * @param unSelect Clear the selected inline image so its toolbar/resize
     * bar do not linger after the editor is blurred.
     */
    blur(isRemoveAllRange?: boolean, unSelect?: boolean): void;
    /**
     * Hide every floating tool/menu (toolbars, pickers, front button, …).
     */
    hideAllFloatTools(): void;
    /**
     * Flush every cached inline image and force them to reload.
     *
     * The renderer memoises loaded images, so an image whose file changed on
     * disk would otherwise keep showing the stale bitmap. Desktop calls this
     * after a watched image file changes or on the `mt::invalidate-image-cache`
     * IPC; it clears the image caches and re-renders all content blocks so the
     * images load afresh.
     */
    invalidateImageCache(): void;
    /**
     * Copy the current document as Markdown to the clipboard.
     */
    copyAsMarkdown(): void;
    /**
     * Copy the current selection as rendered HTML to the clipboard.
     */
    copyAsHtml(): void;
    /**
     * Copy the current selection as rich text to the clipboard: the rendered
     * HTML goes in the `text/html` slot so a rich-text target (Word, email, a
     * contenteditable) renders formatting, and the markdown source goes in the
     * `text/plain` slot. Unlike {@link copyAsHtml}, which blanks `text/html`
     * and drops the markup into `text/plain` as literal source.
     */
    copyAsRich(): void;
    /**
     * Paste the clipboard content as plain text at the current cursor.
     */
    pasteAsPlainText(): Promise<void>;
    /**
     * Insert an image at the current cursor from an explicit `src` (a saved file
     * path or `data:` URL), routing through the configured `imageAction` like a
     * clipboard image paste. Drives the desktop macOS screenshot flow, which can
     * no longer rely on the removed `document.execCommand('paste')`.
     */
    pasteImage(src: string): Promise<void>;
    private _outmostBlockAtCursor;
    private _immediateBlockAtCursor;
    /**
     * Cross-block paragraph-menu handling: a selection that spans several
     * outmost blocks wraps each block into one list item. Returns true when the
     * operation was handled so the single-block path is skipped. Quote/code and
     * other cross-block targets are gated by the menu layer and fall through.
     */
    private _handleCrossBlockParagraph;
    /**
     * The outmost-block endpoints of the current selection. Prefers the pair
     * that spans two different outmost blocks: the live DOM selection is the
     * truth in the browser, but the cached selection endpoints survive the
     * menu/IPC round-trip (and the headless test environment, where
     * `Selection.extend` collapses a cross-node range to one block).
     */
    private _selectionEndpoints;
    /** Whether the current selection stays within a single outmost block. */
    private _selectionInSameBlock;
    /**
     * Whether the current selection stays within a single content leaf. Unlike
     * `_selectionInSameBlock` (outmost-block granularity, for paragraph-menu
     * dispatch), this compares the actual leaves so a selection spanning two
     * paragraphs nested in one blockquote is correctly treated as cross-leaf
     * for inline formatting (#3462).
     */
    private _selectionInSameLeaf;
    /**
     * The contiguous run of OUTMOST (scrollPage-child) blocks the current
     * selection spans, in document order. Mirrors clipboard's outmost walk.
     */
    private _selectedOutmostBlocks;
    /**
     * Select the full span of a freshly-wrapped container (first content leaf to
     * last) so the selection keeps covering the wrapped content. Best-effort.
     */
    private _selectWrappedContent;
    /**
     * Replace the selected outmost blocks with a single container built by
     * `buildState`, then position the cursor/selection via `place`. Shared by the
     * cross-block list / block-quote / code-block wraps (ported from muyajs's
     * handleListMenu / handleQuoteMenu / handleCodeBlockMenu multi-block branches).
     */
    private _wrapSelectedBlocks;
    /** Wrap the selected outmost blocks as items of a new list of `label`. */
    private _wrapSelectedBlocksInList;
    /** Wrap the selected outmost blocks into a single block-quote. */
    private _wrapSelectedBlocksInQuote;
    /** Join the selected outmost blocks' text into a single fenced code block. */
    private _wrapSelectedBlocksInCodeBlock;
    /**
     * Duplicate the block at the current cursor, placing the cursor in the
     * copy. No-op when there is no current block.
     */
    duplicate(): void;
    /**
     * Insert an empty paragraph relative to the block at the current cursor.
     * @param location Insert `before` or `after` the current block (default `after`).
     * @param text Initial text of the new paragraph.
     * @param outMost When `true`, anchor the new paragraph to the OUTERMOST
     *   container (the legacy "Create Paragraph Below" behaviour). When `false`
     *   (default), anchor to the IMMEDIATE block at the cursor so the paragraph
     *   stays as an inner sibling inside a list item / blockquote — the legacy
     *   context-menu "Insert Paragraph Before/After" behaviour.
     */
    insertParagraph(location?: 'before' | 'after', text?: string, outMost?: boolean): void;
    /**
     * Delete the block at the current cursor, moving the cursor to an adjacent
     * block, or to a fresh empty paragraph when it was the only block.
     */
    deleteParagraph(): void;
    createTable({ rows, columns }: {
        rows: number;
        columns: number;
    }, { replace }?: {
        replace?: boolean;
    }): void;
    /**
     * Insert an inline image at the current cursor in the active formattable
     * block. The `![alt](src)` markdown is
     * written through the `Format` block's text setter so it dispatches a JSON
     * op (state stays in sync) rather than mutating the DOM directly. No-op when
     * there is no active formattable (`Format`) block — e.g. inside a code block
     * or with no cursor.
     */
    insertImage({ src, alt }: {
        src?: string;
        alt?: string;
    }): void;
    /**
     * Set the cursor programmatically. The desktop passes a cursor like
     * `{ anchor, focus, anchorPath, focusPath }` (and may use `{ start, end }`
     * / `block` / `path`). Resolves the target block(s) by path on the live tree
     * and restores the selection the same way `Editor.updateContents` does —
     * `block.setCursor` for the same-block case, `selection.setSelection` with
     * resolved block instances for the cross-block case. Passing bare paths to
     * `setSelection` does not work (it needs a block's `domNode`), so we always
     * resolve and pass the block instance. No-op when the target can't be
     * resolved.
     */
    setCursor(cursor: IPublicCursorInput): void;
    private _normalizeCursorEndpoints;
    private _resolveCursorBlocks;
    /**
     * Restore the WYSIWYG caret from a source-mode (CodeMirror) `{ line, ch }`
     * index cursor. The block tree has no source-line mapping, so the offsets
     * are resolved as follows: inject sentinel
     * strings into the current markdown at the line/ch positions, rebuild the
     * tree (sentinels embed as literal text), find which content blocks they
     * landed in, then rebuild the clean document and set the cursor by the
     * resolved block paths + offsets. The sentinel-bearing tree is transient —
     * both `setContent` calls run synchronously within this task, so no
     * intermediate paint happens.
     *
     * `Editor.setContent` clears the undo history, so this method snapshots the
     * history before its internal rebuild and restores it afterwards — the undo
     * stack is preserved, leaving only the caret changed. No-op (returns
     * `false`) when the cursor is stale / unresolvable, letting the caller fall
     * back to its default.
     */
    setCursorByOffset(indexCursor: IIndexCursor): boolean;
    /**
     * Read the current WYSIWYG caret as a source-mode (CodeMirror) `{ line, ch }`
     * index cursor — the INVERSE of `setCursorByOffset`. The desktop emits this
     * on every change so toggling WYSIWYG -> source
     * opens CodeMirror at the same caret.
     *
     * The block tree has no source-line mapping, so the offset is recovered the
     * same way `setCursorByOffset` resolves the reverse: clone the current
     * state, splice sentinel strings into the selected block's text at the
     * anchor/focus offsets, serialize that clone to markdown (identical to what
     * source mode shows), then read each sentinel's line/column back out. The
     * live document and undo history are untouched — only a throwaway clone is
     * mutated. Returns `null` when there is no selection or the caret can't be
     * located (the caller then falls back to its default cursor placement).
     */
    getCursorOffset(): IIndexCursor | null;
    /**
     * Convert the block at the cursor to another type. `type` uses the
     * paragraph-menu
     * vocabulary: `paragraph`, `heading 1`–`heading 6`, `upgrade heading`,
     * `degrade heading`, `blockquote`, `pre`, `mathblock`, `html`, `hr`,
     * `table`, `front-matter`, `ul-bullet`/`ol-order`/`ul-task`,
     * `loose-list-item`, `reset-to-paragraph`, and the diagram types.
     */
    updateParagraph(type: string): void;
    /**
     * If the cursor is inside a block matching `label` (the menu item is
     * checked), toggle it off and return true: unwrap EVERY ancestor of that
     * kind (so nested same-kind lists collapse in one click and the item ends up
     * un-checked), or convert a matching leaf (heading of that level / hr) back
     * to a paragraph. Returns false when nothing matches.
     */
    private _toggleIfActive;
    /** The nearest list ancestor of the cursor, of any kind. */
    private _closestListAtCursor;
    /**
     * Run a conversion, then restore the prior selection (anchor AND focus, so a
     * range stays selected) on the active content block — every conversion ends
     * with the caret's content active (unwraps restore it themselves).
     */
    private _withPreservedOffset;
    /**
     * The first FORMATTABLE content leaf whose text equals `text`, in document
     * order. Restricting to Format leaves skips marker-only content (a thematic
     * break's `---`, code/math/html), so toggling one never lands the caret on
     * an unrelated block that happens to share that text.
     */
    private _findContentByText;
    /**
     * General same-block conversion: the front menu's turn-into set is the
     * single source of truth. Operate on the IMMEDIATE block so a heading inside
     * a list item converts while the list stays intact; a target that is not a
     * valid turn-into replaces an empty block in place, or is inserted as a new
     * block directly below a non-empty one (focus moves into it).
     */
    private _convertOrInsertBelow;
    /**
     * Return a block to plain paragraph form: lists and blockquotes unwrap to
     * preserve every child, tables are left untouched, and everything else is
     * replaced by a paragraph carrying its leading text. Public so the
     * paragraph front menu can reset the block it targets (not just the cursor
     * block).
     */
    resetToParagraph(block: Parent): void;
    /**
     * The text a plain paragraph should carry when `block` is reset/converted to
     * one: a code block keeps its raw code; a thematic break is all marker
     * (`---` / `***` / …) with no content, so it yields an empty paragraph;
     * everything else keeps its leading text (heading hashes stripped).
     */
    private _paragraphTextFor;
    /**
     * Convert the *leaf* block that directly wraps the cursor (the immediate
     * parent of the active content) to a plain paragraph. No-op when that leaf
     * is already a paragraph. Because it targets the leaf rather
     * than the outermost container, a heading inside a list item / blockquote
     * converts to a paragraph while leaving the surrounding list/quote intact.
     */
    private _convertLeafToParagraph;
    /**
     * Unwrap a structured container (list or blockquote) into the top-level
     * blocks it contains, preserving every item.
     */
    private _unwrapToParagraphs;
    /** Leading text of a block, with the atx hash run stripped for headings. */
    private _blockLeadingText;
    /** Cycle the heading level (marktext upgrade/degrade semantics). */
    private _changeHeadingLevel;
    /** Toggle loose/tight on the list at the cursor. */
    private _toggleLooseList;
    /**
     * Capture the current selection as document paths + offsets. The live DOM
     * selection is the source of truth (it carries a click-placed caret), with
     * the cached selection — committed on mouse-up and surviving the menu/IPC
     * round-trip — as the fallback. Block references are intentionally dropped:
     * they go stale when the list is rebuilt, so the paths are re-resolved on
     * restore.
     */
    private _snapshotSelection;
    /**
     * Re-resolve a snapshot's paths against the live tree and re-apply it via
     * the selection API. Returns false when either path no longer resolves to a
     * content block so the caller can fall back.
     */
    private _restoreSelection;
    /** Convert an existing list to another list type, preserving items. */
    private _convertListType;
    destroy(): void;
}
export {};
