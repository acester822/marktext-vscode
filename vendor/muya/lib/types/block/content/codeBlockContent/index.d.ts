import { Muya } from '../../../muya';
import { IRenderCursor } from '../../../selection/types';
import { CodeContentState } from '../../../state/types';
import { default as Code } from '../../commonMark/codeBlock/code';
import { default as Content } from '../../base/content';
declare class CodeBlockContent extends Content {
    private _initialLang;
    parent: Code | null;
    static blockName: string;
    static create(muya: Muya, state: CodeContentState): CodeBlockContent;
    private get _lang();
    /**
     * Always be the `pre` element
     */
    private get _codeContainer();
    get outContainer(): void | import('../../base/parent').default | null;
    private _lastPreviewText;
    constructor(muya: Muya, state: CodeContentState);
    getAnchor(): void | import('../../base/parent').default | null;
    private _updatePreviewIfHave;
    update(_cursor?: IRenderCursor, highlights?: never[]): void;
    private _lastLineCount;
    private _lineNumberResizeObserver;
    private _updateLineNumbers;
    private _observeLineNumberResize;
    inputHandler(event: Event): void;
    enterHandler(event: KeyboardEvent): void;
    tabHandler(event: KeyboardEvent): void;
    backspaceHandler(event: KeyboardEvent): void;
    keyupHandler(): void;
}
export default CodeBlockContent;
