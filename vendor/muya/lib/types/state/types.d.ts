export interface IParagraphState {
    name: 'paragraph';
    text: string;
}
export interface IAtxHeadingState {
    name: 'atx-heading';
    meta: {
        level: number;
    };
    text: string;
}
export interface ISetextHeadingState {
    name: 'setext-heading';
    meta: {
        level: number;
        underline: string;
    };
    text: string;
}
export interface IThematicBreakState {
    name: 'thematic-break';
    text: string;
}
export interface ICodeBlockState {
    name: 'code-block';
    meta: {
        type: string;
        lang: string;
        fenceLength?: number;
    };
    text: string;
}
export interface IHtmlBlockState {
    name: 'html-block';
    text: string;
}
/**
 * @deprecated Reference definitions are stored as paragraph state nodes whose
 * `text` is the raw `[label]: url "title"` line (matches marktext's
 * "definition is paragraph text" model). `InlineRenderer.collectReferenceDefinitions`
 * regex-scans paragraphs to build the labels Map. This interface is unused
 * across the codebase and exists only for legacy type compatibility; remove
 * in v0.3.
 */
export interface ILinkReferenceDefinitionState {
    name: 'link-reference-definition';
    text: string;
}
export interface IBlockQuoteState {
    name: 'block-quote';
    children: TState[];
}
export interface IListItemState {
    name: 'list-item';
    children: TState[];
}
export interface IOrderListState {
    name: 'order-list';
    meta: {
        start: number;
        loose: boolean;
        delimiter: string;
    };
    children: IListItemState[];
}
export interface IBulletListState {
    name: 'bullet-list';
    meta: {
        marker: string;
        loose: boolean;
    };
    children: IListItemState[];
}
export interface ITableRowState {
    name: 'table.row';
    children: ITableCellState[];
}
export interface ITableCellMeta {
    align: string;
}
export interface ITableCellState {
    name: 'table.cell';
    meta: ITableCellMeta;
    text: string;
}
export interface ITableState {
    name: 'table';
    children: ITableRowState[];
}
export interface ITaskListItemMeta {
    checked: boolean;
}
export interface ITaskListItemState {
    name: 'task-list-item';
    meta: ITaskListItemMeta;
    children: TState[];
}
export interface ITaskListMeta {
    marker: string;
    loose: boolean;
}
export interface ITaskListState {
    name: 'task-list';
    meta: ITaskListMeta;
    children: ITaskListItemState[];
}
export interface IMathMeta {
    mathStyle: string;
}
export interface IMathBlockState {
    name: 'math-block';
    meta: IMathMeta;
    text: string;
}
export interface IFrontmatterMeta {
    lang: string;
    style: string;
}
export interface IFrontmatterState {
    name: 'frontmatter';
    meta: IFrontmatterMeta;
    text: string;
}
export interface IDiagramMeta {
    lang: string;
    type: 'mermaid' | 'plantuml' | 'vega-lite' | 'flowchart' | 'sequence';
}
export interface IDiagramState {
    name: 'diagram';
    meta: IDiagramMeta;
    text: string;
}
export interface IFootnoteBlockMeta {
    identifier: string;
}
export interface IFootnoteBlockState {
    name: 'footnote';
    meta: IFootnoteBlockMeta;
    children: TState[];
}
export type TLeafState = IParagraphState | IAtxHeadingState | ISetextHeadingState | IThematicBreakState | ICodeBlockState | IHtmlBlockState | ILinkReferenceDefinitionState | IMathBlockState | IFrontmatterState | IDiagramState | ITableCellState;
export type TContainerState = IBlockQuoteState | IOrderListState | IBulletListState | ITableState | ITaskListState | ITaskListItemState | IListItemState | ITableRowState | IFootnoteBlockState;
export type TState = TLeafState | TContainerState;
export type CodeContentState = ICodeBlockState | IHtmlBlockState | IDiagramState | IMathBlockState | IFrontmatterState;
export declare function isStateOfName<N extends TState['name']>(state: TState, name: N): state is Extract<TState, {
    name: N;
}>;
export declare const isParagraphState: (s: TState) => s is IParagraphState;
export declare const isAtxHeadingState: (s: TState) => s is IAtxHeadingState;
export declare const isSetextHeadingState: (s: TState) => s is ISetextHeadingState;
export declare const isThematicBreakState: (s: TState) => s is IThematicBreakState;
export declare const isCodeBlockState: (s: TState) => s is ICodeBlockState;
export declare const isHtmlBlockState: (s: TState) => s is IHtmlBlockState;
export declare const isLinkReferenceDefinitionState: (s: TState) => s is ILinkReferenceDefinitionState;
export declare const isMathBlockState: (s: TState) => s is IMathBlockState;
export declare const isFrontmatterState: (s: TState) => s is IFrontmatterState;
export declare const isDiagramState: (s: TState) => s is IDiagramState;
export declare const isTableCellState: (s: TState) => s is ITableCellState;
export declare const isBlockQuoteState: (s: TState) => s is IBlockQuoteState;
export declare const isOrderListState: (s: TState) => s is IOrderListState;
export declare const isBulletListState: (s: TState) => s is IBulletListState;
export declare const isTableState: (s: TState) => s is ITableState;
export declare const isTaskListState: (s: TState) => s is ITaskListState;
export declare const isTaskListItemState: (s: TState) => s is ITaskListItemState;
export declare const isListItemState: (s: TState) => s is IListItemState;
export declare const isTableRowState: (s: TState) => s is ITableRowState;
export declare const isFootnoteBlockState: (s: TState) => s is IFootnoteBlockState;
export declare function isAnyListState(s: TState): s is IOrderListState | IBulletListState | ITaskListState;
export interface ITurnoverOptions {
    headingStyle: 'atx' | 'setext';
    hr: '---';
    bulletListMarker: '-' | '+' | '*';
    codeBlockStyle: 'fenced' | 'indented';
    fence: '```' | '~~~';
    emDelimiter: '*' | '_';
    strongDelimiter: '**' | '__';
    linkStyle: 'inlined';
    linkReferenceStyle: 'full';
    blankReplacement: (content: unknown, node: unknown, options: unknown) => string;
}
