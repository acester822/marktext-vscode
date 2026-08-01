import { TState } from './types';
export interface IExportMarkdownOptions {
    listIndentation: number | string;
}
export default class ExportMarkdown {
    private _listType;
    private _isLooseParentList;
    private _listIndentation;
    private _listIndentationCount;
    constructor({ listIndentation, }?: IExportMarkdownOptions);
    generate(states: TState[]): string;
    private _convertStatesToMarkdown;
    private _serializeSimpleBlock;
    private _serializeListBlock;
    private _startsWithEmptyDashBulletItem;
    private _serializeListItemBlock;
    private _insertLineBreak;
    private _serializeFrontMatter;
    private _serializeTextParagraph;
    private _serializeAtxHeading;
    private _serializeSetextHeading;
    private _serializeCodeBlock;
    private _codeFenceLength;
    private _serializeHtmlBlock;
    private _serializeMathBlock;
    private _serializeDiagramBlock;
    private _serializeBlockquote;
    private _serializeFootnote;
    private _serializeTable;
    private _serializeList;
    private _serializeListItem;
}
