import { IHighlight } from '../../inlineRenderer/types';
import { Muya } from '../../muya';
import { IContentCursor, INodeOffset, IRenderCursor } from '../../selection/types';
import { Nullable } from '../../types';
import { TBlockPath } from '../types';
import { default as Parent } from './parent';
import { default as TreeNode } from '../../block/base/treeNode';
import { default as Selection } from '../../selection';
declare class Content extends TreeNode {
    private _text;
    protected isComposed: boolean;
    static blockName: string;
    protected get hasSelection(): boolean;
    protected get selection(): Selection;
    protected get inlineRenderer(): import('../../inlineRenderer').default;
    protected get autoPairType(): string;
    get path(): TBlockPath;
    get text(): string;
    set text(text: string);
    protected get isCollapsed(): boolean | undefined;
    get isContainerBlock(): boolean;
    constructor(muya: Muya, text: string);
    getAnchor(): Nullable<Parent>;
    clickHandler(event: Event): void;
    tabHandler(_event: Event): void;
    keyupHandler(_event: Event): void;
    inputHandler(_event: Event): void;
    backspaceHandler(_event: Event): void;
    enterHandler(_event: Event): void;
    deleteHandler(event: Event): void;
    arrowHandler(event: Event): void;
    createDomNode(): void;
    /**
     * Get cursor if selection is in this block.
     */
    getCursor(): IContentCursor | null;
    /**
     * Set cursor at the special position
     * @param {number} begin
     * @param {number} end
     * @param {boolean} needUpdate
     */
    setCursor(begin: number, end: number, needUpdate?: boolean): void;
    update(_cursor?: IRenderCursor, _highlights?: IHighlight[]): void;
    composeHandler(event: Event): void;
    /**
     * used in input handler
     * @param {input event} event
     */
    autoPair(event: Event, text: string, start: INodeOffset, end: INodeOffset, isInInlineMath?: boolean, isInInlineCode?: boolean, type?: string): {
        text: string;
        needRender: boolean;
    };
    protected insertTab(): void;
    /**
     * Replace the word at/around the current cursor with `replacement`.
     *
     * Used by the desktop spell checker: right
     * clicking a misspelled word selects the whole word via Chromium, and
     * choosing a suggestion replaces it inline. `extractWord` uses
     * VSCode-derived word boundaries.
     *
     * Unsafe: the caller asserts that exactly the word `word` is selected. If
     * the word found at the cursor does not match `word` the call is a no-op
     * (returns false) — this guards against a Chromium selection mismatch.
     *
     * @param word The expected word at the cursor; the whole word must be selected.
     * @param replacement The replacement text.
     * @returns True when the replacement was applied.
     */
    replaceCurrentWordInlineUnsafe(word: string, replacement: string): boolean;
    keydownHandler: (event: Event) => void;
    private _wrapSelectionWithAutoPair;
    blurHandler(): void;
    focusHandler(): void;
    getAncestors(): Parent[];
    remove(source?: string): this;
}
export default Content;
